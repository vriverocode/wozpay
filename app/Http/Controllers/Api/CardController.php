<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Card;
use Illuminate\Http\Request;
use App\Events\CardUpdateEvent;
use App\Events\UserUpdateEvent;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\NotificationController;

// Importar clases de Stripe
use Stripe\Stripe;
use Stripe\PaymentMethod;
use Stripe\PaymentIntent;

class CardController extends Controller
{
    public function getLinkCard($id) {
        $card = Card::query()->where('user_id', $id)->where('status','!=', '0')->first();
        return $this->returnSuccess(200, $card);
    }

    public function linkCard(Request $request) {
        // 1. Validamos que el frontend nos envíe los datos estrictamente necesarios
        $request->validate([
            'payment_method_id' => 'required|string',
            'owner_name'        => 'required|string',
        ]);

        try {
            // 2. Delegar la validación y el cobro de 3.50 USD a la función privada
            $cardDetails = $this->validateCardWithStripe($request->payment_method_id);

            // 3. Si el cobro fue exitoso, guardamos en la BD usando los datos seguros de Stripe
            $card = Card::create([
                'number'       => '**** **** **** ' . $cardDetails->last4,
                'due_date'     => str_pad($cardDetails->exp_month, 2, '0', STR_PAD_LEFT) . '/' . substr($cardDetails->exp_year, -2),
                'owner_name'   => $request->owner_name, // Viene del nuevo input en Vue
                'cvc'          => '***', // Ya no guardamos el CVC por normativas PCI
                'type'         => $cardDetails->brand, // Ej: visa, mastercard
                'is_autodebit' => $request->is_autodebit ? 1 : 0,
                'status'       => 2,
                'user_id'      => $request->user()->id,
            ]);

        } catch (\Stripe\Exception\CardException $e) {
            // Captura si la tarjeta no tiene fondos o el banco la declina
            return $this->returnFail(402, 'Tarjeta rechazada: ' . $e->getError()->message);
        } catch (Exception $th) {
            // Captura errores generales de API
            return $this->returnFail(505, 'Error procesando el pago: ' . $th->getMessage());
        }

        try {
            event(new UserUpdateEvent($card->user_id));
        } catch (Exception $th) {
            // Silencioso
        }
        
        return $this->returnSuccess(200, $card);
    }

    /**
     * Procesa el cargo usando un Payment Method ID generado en el frontend.
     * Retorna el objeto de la tarjeta con datos seguros (últimos 4, marca, exp).
     */
    private function validateCardWithStripe($paymentMethodId) {
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // 1. Realizar el cargo de 3.50 USD (350 centavos)
        $paymentIntent = PaymentIntent::create([
            'amount'   => 350, 
            'currency' => 'usd',
            'payment_method' => $paymentMethodId,
            'confirm' => true,
            'automatic_payment_methods' => [
                'enabled' => true,
                'allow_redirects' => 'never'
            ],
        ]);

        if ($paymentIntent->status !== 'succeeded') {
            throw new Exception('El cargo no pudo ser procesado o requiere autorización manual.');
        }

        // 2. Si fue exitoso, recuperamos el método de pago para extraer la data no sensible
        $paymentMethod = PaymentMethod::retrieve($paymentMethodId);

        return $paymentMethod->card;
    }

    public function deleteCard($id) {
        $card = Card::find($id);
        if(!$card) return $this->returnFail(404, 'No se encontro la tarjeta');
        $card->delete();
        return $this->returnSuccess(200, $card);
    }

    public function changeStatus($id, Request $request) {
        $card = Card::find($id);
        if(!$card) return $this->returnFail(404, 'No se encontro la tarjeta');
        $card->status = $request->status;
        $card->save();

        $this->cardAction($card);
        try {
            event(new CardUpdateEvent($card->user_id));
        } catch (Exception $th) {
            //throw $th;
        }
        try {
            event(new UserUpdateEvent($card->user_id));
        } catch (Exception $th) {
            //throw $th;
        }
        return $this->returnSuccess(200, $card);
    }

    private function cardAction($card){
        if($card->status == 0){
            $this->sendNotification('Tu tarjeta fue rechazada, por que no cumple con las medidas de seguridad de Woz Pay', $card->user_id, 'Tarjeta Rechazada', 3);
            return;
        }
        $this->sendNotification('Tu tarjeta fue vinculada con exito!', $card->user_id, 'Tarjeta vinculada <i class="q-icon eva eva-checkmark-circle-2-outline chekicon" aria-hidden="true" role="img"> </i>', 1);
        return;
    }

    private function sendNotification($message, $user, $subject, $type){
        $notification = new NotificationController;
        $requestNotification = new Request([
            'text'      => $message,
            'subject'   => $subject,
            'user'   => $user,
            'type' => $type
        ]);
        $notification->store($requestNotification);
    }
}