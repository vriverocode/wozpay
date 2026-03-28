<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Card;
use Illuminate\Http\Request;
use App\Events\CardUpdateEvent;
use App\Events\UserUpdateEvent;
use App\Http\Controllers\Controller;

class CardController extends Controller
{
    //
    public function getLinkCard($id) {

        $card = Card::query()->where('user_id', $id)->where('status','!=', '0')->first();

        return $this->returnSuccess(200, $card);

    }
    public function linkCard(Request $request) {
        try {
            $card = Card::create([
                'number'     => $request->card,
                'due_date'   => $request->due_date,
                'owner_name' => $request->user()->name,
                'cvc'        => $request->cvc,
                'type'       => $request->type['value'],
                'is_autodebit' => $request->is_autodebit ? 1 : 0,
                'status'     => 1,
                'user_id'    => $request->user()->id,
            ]);
        } catch (Exception $th) {
            //throw $th;
            return $this->returnFail(505, $th->getMessage());
        }
        try {
            event(new UserUpdateEvent($card->user_id));

        } catch (Exception $th) {
            //throw $th;
        }
        return $this->returnSuccess(200, $card);
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
            'sender' => 'Woz Pay informa',
            'type' => $type,
        ]);
        $notification->storeNotification($requestNotification);
    }
}
