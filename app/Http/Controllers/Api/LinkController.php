<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Coin;
use App\Models\Link;
use App\Models\Wallet;
use App\Models\PayLink;
use Illuminate\Http\Request;
use App\Events\UserUpdateEvent;
use App\Http\Controllers\Controller;
use App\Models\DropshippingLink;
use App\Models\ProductsDropshippingLink;

class LinkController extends Controller
{
    /**
     * Display a listing of the resource by Id.
     */
    public function getByUserLast5($id)
    {
        //
        $links = Link::with('coin')->where('user_id', $id)->orderBy('id', 'desc')->take(5)->get();
        return $this->returnSuccess(200, $links);
    }
    public function getByUser($id)
    {
        //
        $links = Link::with('coin')->where('user_id', $id)->orderBy('id', 'desc')->get();
        return $this->returnSuccess(200, $links);
    }
    

    /**
     * Show the form for creating a new resource.
     */
    public function getById($id)
    {
        //
        $link = Link::with('user', 'pay', 'coin')->find($id);
        return $this->returnSuccess(200, $link);
    }
    public function getDropshippingLinkById($id){
        $link = DropshippingLink::with('user', 'pay', 'productsInLink', 'coin')->find($id);
        return $this->returnSuccess(200, $link);

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        date_default_timezone_set('America/Asuncion');

        $code = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 8);
        $rate = Coin::find($request->coin)->rate;

        $link = Link::create([
            'url'               => config('app.url').'v1/pay/link/'.$code ,
            'code'              => $code,
            'title'             => $request->title,
            'note'              => $request->note,
            'amount'            => $request->amount,
            'amount_to_client'  => $request->amount_to_client,
            'coin_id'           => $request->coin,
            'rate_amount'       => $rate,
            'is_recurring'      => $request->type == 2 ? 'yes' : 'no',
            'recurring_day'     => $request->recurring_day ?? null,
            'init_day'          => $request->type == 2 ? date('Y-m-d',strtotime($request->init_day)) : null,
            'for_month'         => $request->for_month ?? null,
            'status'            => 1,
            'pay_status'        => 1,
            'isWatch'           => 0,
            'categorie'         => intval($request->categorie),
            'type'              => $request->type,
            'user_id'           => $request->user()->id,
            // 'due_time'          => date('Y-m-d H:i:s', time() + 7200)
        ]);
        return $this->returnSuccess(200, $link);
    }
    public function createLinkDropshipping(Request $request){
        date_default_timezone_set('America/Asuncion');

        $code = 'dr_'.substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 8);
        $rate = Coin::find($request->coin)->rate;

        $link = DropshippingLink::create([
            'url'               => config('app.url').'v1/pay/dropshipping/link/'.$code ,
            'code'              => $code,
            'amount'            => $request->amount,
            'amount_to_client'  => $request->amount_to_client,
            'coin_id'           => $request->coin,
            'rate_amount'       => $rate,
            'status'            => 1,
            'pay_status'        => 0,
            'user_id'           => $request->user()->id,
            'products'          => $request->products,
            // 'due_date'          => date('Y-m-d H:i:s', time() + 7200)
        ]);

        $this->setProductInLink(json_decode($request->products, true), $link->id);
        return $this->returnSuccess(200, $link);
    }

    public function getByCode($code){
        $link = Link::with('user', 'pay', 'coin')->where('code', $code)->first();
        return $this->returnSuccess(200, $link);
    }
    public function getDropshippingLinkByCode($code){
        $link = DropshippingLink::with('user', 'pay', 'productsInLink', 'coin')->where('code', $code)->first();
        return $this->returnSuccess(200, $link);
    }
    public function setPayStatus(Request $request)
    {
        //.3
        $pay = PayLink::find($request->payId);
        $link = Link::with(['user', 'pay', 'coin'])->find($pay->link_id);


        if($request->status == 3){
            $pay->status = 2;
            $link->pay_status = $request->status;
            $link->status = 2;
            $this->updateWallet($link);
            $this->sendNotification(
                'El pago del link #'.$link->code.' fue aprobado de forma exitosa', $link->user_id, 
                'Pago de link aprobado', 1);
        }
        
        if($request->status == 0){
            $pay->status = $request->status;
            $link->pay_status = 4;
            $link->status = 1;
            $this->sendNotification(
                'El pago realizado por el link #'.$link->code.' fue rechazado por que no cumple con nuestras normativas de seguridad ', $link->user_id, 'Pago de link rechazado', 3);
            
        }
        $pay->save();
        $link->save();
        event(new UserUpdateEvent($link->user_id));

        return $this->returnSuccess(200, $link);
    }
    private function updateWallet($link)
    {
        $wallet = Wallet::where('user_id', $link->user_id)->where('type', '2')->first();
        
        $link->coin->id == 1
        ? $wallet->balance += $link->amount_to_client
        : $wallet->balance_dolar += $link->amount_to_client/$link->rate_amount;


        $wallet->save();
    }
    private function sendNotification($message, $user, $subject, $type)
    {
        $notification = new NotificationController;
        $requestNotification = new Request([
            'text'      => $message,
            'subject'   => $subject,
            'user'   => $user,
            'sender' => 'Woz Pay informa',
            'type' => $type,
        ]);
        try {
            $notification->storeNotification($requestNotification);
        } catch (Exception $th) {
            //throw $th;
        }
    }
    private function setProductInLink($products, $link){
        foreach ($products as $product ) {
            ProductsDropshippingLink::create([
                'dropshipping_link_id' => $link,
                'product_id' => $product['id'],
                'dropper_price' => $product['dropper_price'],
                'quantity' => $product['quantityOrder'],

            ]);
        }
    }
}
