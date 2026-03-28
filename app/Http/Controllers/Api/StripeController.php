<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

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

    /**
     * Paso 2: Crear la suscripción
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
            ]);
            return $this->returnSuccess(200, ['msg'=>'Suscrito correctamente', 'trx' => $result->stripe_id]);
            
        } catch (\Exception $e) {
            return $this->returnFail(500, $e->getMessage());
        }
    }

    /**
     * Extra: Pago único (Sin suscripción)
     */
    public function singleCharge(Request $request)
    {
        $amount = 1000; // $10.00 (en centavos)
        try {
            $request->user()->charge($amount, $request->payment_method, [
                'currency' => 'pyg',
            ]);
            return $this->returnSuccess(200, '200');
        } catch (\Exception $e) {
            return $this->returnFail(500, $e->getMessage());
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
    private function actionsToDo($data)
    {
        $this->activeWallet($data['request']);
        $this->storeRegisterStripe($data);
    }
    private function activeWallet($request)
    {
        $wallet = new WalletController();
        $wallet->setPlan($request);
    }
    private function storeRegisterStripe($data)
    {
        $pay = new PayController();
        $pay->storeStripePay($data);
    }
}
