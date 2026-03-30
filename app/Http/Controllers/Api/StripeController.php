<?php

namespace App\Http\Controllers\Api;

use App\Events\UserUpdateEvent;
use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\Plan;
use App\Models\Wallet;
use Exception;
use Illuminate\Http\Request;
use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Price;
use Stripe\Subscription;
use Stripe\SetupIntent;
use Carbon\Carbon;

class StripeController extends Controller
{
    /**
     * Paso 1: Crear un SetupIntent
     * Esto le dice a Stripe: "Este usuario quiere registrar una tarjeta"
     */
    public function createSetupIntent(Request $request)
    {
        try {
            $user = $request->user();
            $user->createOrGetStripeCustomer();
            
            $intent = $user->createSetupIntent([
                'payment_method_types' => ['card'],
            ]);
            
            // 1. Retornamos el éxito INMEDIATAMENTE si todo salió bien.
            return $this->returnSuccess(200, [
                'client_secret' => $intent->client_secret
            ]);
            
        } catch (\Stripe\Exception\InvalidRequestException $e) {
            
            if ($e->getStripeCode() === 'resource_missing') {
                $user->stripe_id = null;
                $user->save();
                $user = $request->user();
                $user->createOrGetStripeCustomer();
                
                $intent = $user->createSetupIntent([
                    'payment_method_types' => ['card'],
                ]);
                
                return $this->returnSuccess(200, [
                    'client_secret' => $intent->client_secret
                ]);
            }
            
            return $this->returnFail(500, 'Error de Stripe: ' . $e->getMessage());
            
        } catch (\Exception $e) {
            return $this->returnFail(500, 'Error del servidor: ' . $e->getMessage());
        }
    }
    public function createPaymentIntent(Request $request)
    {
        try {
            $link = Link::findOrFail($request->link_id); 
            
            Stripe::setApiKey(config('cashier.secret'));

            // 1. Determinar el código de la moneda basado en coin_id
            $currency = $link->coin_id == 2 ? 'usd' : 'pyg';

            // 2. Calcular el monto según las reglas de decimales de Stripe
            if ($currency === 'usd') {
                // USD tiene 2 decimales: $10.00 se envía como 1000
                $amount = $link->amount * 100; 
            } else {
                // PYG es moneda de cero decimales: 10000 Gs se envían como 10000
                $amount = $link->amount; 
            }

            // 3. Crear la Intención de Pago
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => $currency,
                'payment_method_types' => ['card'],
            ]);

            return $this->returnSuccess(200, [
                'client_secret' => $paymentIntent->client_secret
            ]);

        } catch (\Exception $e) {
            return $this->returnFail(500, 'Error: ' . $e->getMessage());
        }
    }

    public function createSetupIntentLink(Request $request)
    {
        try {
            Stripe::setApiKey(config('cashier.secret'));
            
            // Creamos un SetupIntent vacío (no atado a un cliente aún)
            $setupIntent = SetupIntent::create([
                'payment_method_types' => ['card'],
            ]);
            
            return $this->returnSuccess(200, [
                'client_secret' => $setupIntent->client_secret
            ]);
        } catch (\Exception $e) {
            return $this->returnFail(500, 'Error: ' . $e->getMessage());
        }
    }

    // 2. Crear la suscripción mensual
    public function createSubscriptionLink(Request $request)
    {
        try {
            Stripe::setApiKey(config('cashier.secret'));
            $link = Link::findOrFail($request->link_id);
            
            $currency = $link->coin_id == 2 ? 'usd' : 'pyg';
            $amount = $currency === 'usd' ? $link->amount * 100 : (int)$link->amount;

            // 1. Crear Cliente en Stripe para este invitado y asignarle la tarjeta
            $customer = Customer::create([
                'name' => $request->payer_name,
                'email' => $request->payer_email, // Si no lo pides, puedes quitar esta línea
                'payment_method' => $request->payment_method_id,
                'invoice_settings' => [
                    'default_payment_method' => $request->payment_method_id
                ]
            ]);

            // 2. Crear el "Precio" en Stripe
            $price = Price::create([
                'unit_amount' => $amount,
                'currency' => $currency,
                'recurring' => ['interval' => 'month'],
                'product_data' => ['name' => $link->title],
            ]);

            // 3. Calcular Fechas
            $trialEnd = Carbon::parse($link->init_day)->timestamp; 
            $cancelAt = Carbon::parse($link->init_day)->addMonths($link->for_month)->timestamp;

            // 4. Crear Suscripción
            $subscription = Subscription::create([
                'customer' => $customer->id,
                'items' => [['price' => $price->id]],
                'trial_end' => $trialEnd, // Empieza a cobrar este día
                'cancel_at' => $cancelAt, // Se auto-cancela tras los X meses
                'metadata' => [
                    'link_id' => $link->id, // Vital para el Webhook
                ]
            ]);


            // 2. Actualizamos la wallet y el estado del link
                $link->pay_status = 2; 
                $link->status = 1; 

                $link->save();

                // $merchant = $link->user;
                // $merchant->wallet_balance += $link->amount;
                // $merchant->save();
                // $this->incrementWallet($link->user_id, $link->amount_to_client);
                // 3. Preparamos la data incluyendo los datos del pagador
                $data = [
                    'request'     => $request,
                    'link'        => $link,
                    'result'      => $subscription,
                    'payer_name'  => $customer->name ?? 'Invitado Anónimo',
                    'payer_email' => $customer->email ?? null,
                    'last4'       => $customer->payment_method->card->last4 ?? null
                ];

                // 4. Enviamos la data con el TYPE = 2 (indicando que es un Link)
               $idPayToReturn = $this->actionsToDo($data, 2);

                return $this->returnSuccess(200, ['msg' => 'Suscripción programada con éxito', 'data' => $idPayToReturn, 'oo' =>$data]);

        } catch (\Exception $e) {
            return $this->returnFail(500, 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Crear la suscripción
     */
    public function subscribe(Request $request)
    {
        $user = $request->user();
        $paymentMethod = $request->payment_method;
        $plan = $this->getPriceIdOfPlan($request->plan_code, $request->payment_type);
        

        try {
            $user->createOrGetStripeCustomer();
            
            $user->updateDefaultPaymentMethod($paymentMethod);
            $result = $user->newSubscription($plan->name, $plan->price->price_id)
                ->create($paymentMethod);
            
            $this->actionsToDo([
                'request' => $request,
                'plan' => $plan,
                'result' => $result
            ], 1);
            return $this->returnSuccess(200, ['msg'=>'Suscrito correctamente', 'trx' => $result->stripe_id]);
            
        } catch (\Exception $e) {
            return $this->returnFail(500, $e->getMessage());
        }
    }

    public function verifyAndCreditWallet(Request $request)
    {
        try {
            \Stripe\Stripe::setApiKey(config('cashier.secret'));
            
            // 1. Recuperamos la intención de pago expandiendo el método de pago
            $paymentIntent = \Stripe\PaymentIntent::retrieve([
                'id' => $request->payment_intent_id,
                'expand' => ['payment_method'] 
            ]);

            if ($paymentIntent->status === 'succeeded') {
                $link = Link::findOrFail($request->link_id);
                
                if ($link->pay_status == 3) {
                    return $this->returnFail(400, 'Este link ya fue procesado');
                }

                // 2. Actualizamos la wallet y el estado del link
                $link->pay_status = 3; 
                $link->status = 2; 

                $link->save();

                // $merchant = $link->user;
                // $merchant->wallet_balance += $link->amount;
                // $merchant->save();
                $this->incrementWallet($link->user_id, $link->amount_to_client);
                // 3. Preparamos la data incluyendo los datos del pagador
                $data = [
                    'request'     => $request,
                    'link'        => $link,
                    'result'      => $paymentIntent,
                    'payer_name'  => $paymentIntent->payment_method->billing_details->name ?? 'Invitado Anónimo',
                    'payer_email' => $paymentIntent->payment_method->billing_details->email ?? null,
                    'last4'       => $paymentIntent->payment_method->card->last4 ?? null
                ];

                // 4. Enviamos la data con el TYPE = 2 (indicando que es un Link)
               $idPayToReturn = $this->actionsToDo($data, 2);

                return $this->returnSuccess(200, ['msg' => 'Pago verificado y saldo actualizado', 'data' => $idPayToReturn]);
            }

            return $this->returnFail(400, 'El pago no se pudo verificar');

        } catch (\Exception $e) {
            return $this->returnFail(500, 'Error: ' . $e->getMessage());
        }
    }



    private function getPriceIdOfPlan($planID, $planType)
    {
        $plan = Plan::where('code',$planID)->first(); 
        $plan->price = $planType == 1
         ? $plan->load('priceAnnualy')->priceAnnualy
         : $plan->load('priceMonthly')->priceMonthly;

        return $plan;
    }

    
    private function actionsToDo($data, $type = 0)
    {
        // Si el type es 1 (Plan/Suscripción), activamos la wallet
        if($type == 1) {
            $this->activeWallet($data['request']);
        }
        
        // Pasamos la data y el type al registrador
        return $this->storeRegisterStripe($data, $type);
    }
    private function activeWallet($request)
    {
        $wallet = new WalletController();
        $wallet->setPlan($request);
    }
    private function storeRegisterStripe($data, $type)
    {
        $pay = new PayController();
        
        // Bifurcación limpia según el TYPE enviado
        if ($type == 2) {
            // Es un cobro de link
            
            return $pay->storeStripePayLink($data);
            
        } else {
            // Es un cobro de plan / subscripción (type 1 o 0)
            return $pay->storeStripePay($data);
        }
    }
    private function incrementWallet($user, $amount){
        $wallet = Wallet::where('user_id', $user)->where('type', 2)->first();
        
        if(!$wallet) return $this->returnFail(404, 'Wallet no encontrada');

        $wallet->balance +=  $amount;

        $wallet->save();
        try {
            event(new UserUpdateEvent($user));
        } catch (Exception $th) {
            //throw $th;
        }

        return $this->returnSuccess(200, $wallet);
    
    }

}
