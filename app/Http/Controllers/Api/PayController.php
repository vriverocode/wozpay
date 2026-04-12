<?php

namespace App\Http\Controllers\Api;

use App\Events\UserUpdateEvent;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Controller;
use App\Models\Coin;
use App\Models\DropshippingAccount;
use App\Models\DropshippingLink;
use App\Models\DropshippingPay;
use App\Models\Link;
use App\Models\Loan;
use App\Models\Package;
use App\Models\Pay;
use App\Models\PayLink;
use App\Models\Quota;
use App\Models\User;
use App\Models\Wallet;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class PayController extends Controller
{
    //
    public function storePay(Request $request)
    {
        $validated = $this->validateFieldsFromInput($request->all());
        if (count($validated) > 0) {
            return $this->returnFail(400, $validated[0]);
        }

        $vaucher = '';
        if ($request->vaucher) {
            $vaucher = '/public/images/vaucher/'.rand(1000000, 9999999).'_'. trim(str_replace(' ', '_', $request->loan_id )) .'.'. $request->File('vaucher')->extension();
            $request->file('vaucher')->move(public_path() . '/images/vaucher/', $vaucher);
        }  
        $amount = null;

        if($request->type == 6) {
            $pac = Package::find($request->package);
            $amount = $pac->type == 3 ? ($pac->amount *7872) : $pac->amount;

            $amount = $pac->type == 1 ? ($pac->amount *5) : $amount ;

        }
        try {
            $pay = Pay::create([
                'user_id'       =>  $request->user()->id,
                'loan_id'       =>  $request->loan_id ?? null,
                'package_id'    =>  $request->package ?? null,
                'amount'        =>  $amount ?? $request->amount,
                'operation_id'  =>  $request->operation_id ?? rand(1000000, 9999999),
                'quota_id'      =>  $request->quota_id ?? null,
                'bank'          =>  $request->bank ?? null,
                'method'        =>  $request->method,
                'pay_date'      =>  $request->pay_date ?? null,
                'vaucher'       =>  $vaucher ?? null,
                'type'          =>  $request->type,
                'status'        =>  $request->status,
                'concept'       =>  $request->concept ?? null,
            ]);
        } catch (Exception $th) {
            return $this->returnFail(400, $th->getMessage());
        }

        event(new UserUpdateEvent(1));

        if($request->type == 5){
            $this->sendNotification(
            'Tu pago  de activación de cuenta internacional fue subido con exito, nuestro equipo se encuentra validando que cumpla con las medidas de seguridad', $pay->user_id, 
            'Pago pendiente de verificación', 1);
            $this->activateLinkWallet($request);
        }
        else if($request->type == 1){
            $this->sendNotification(
                'Tu carga de saldo fue realizada con exito, nuestro equipo se encuentra validando que cumpla con las medidas de seguridad', $pay->user_id, 
                'Carga pendiente de verificación', 1);
        }
        else{
            $this->sendNotification(
            'Tu pago fue subido con exito, nuestro equipo se encuentra validando que cumpla con las medidas de seguridad', $pay->user_id, 
            'Pago pendiente de verificación', 1);
        }
        $this->sendMailWoz($pay->load('user'),'newDeposit', 'Pago #'.$pay->operation_id.' registrado por favor validar' );
        return $this->returnSuccess(200, $pay);
    }
    public function storeStripePay($data)
    {


        try {
            $pay = Pay::create([
                'user_id'       =>  $data['request']->user()->id,
                'plan_id'       =>  $data['plan']->id,
                'amount'        =>  $data['plan']->price->amount,
                'operation_id'  =>  $data['result']->stripe_id, 
                'method'        =>  'stripe',
                'pay_date'      =>  date('Y-m-d'),
                'type'          =>  $data['request']->payment_type == 1 ? 20 : 21,
                'status'        =>  2,
                'concept'       =>  'Pago por stripe de plan'. $data['plan']->name,
            ]);
        } catch (Exception $th) {
            return $th->getMessage();
        }

        event(new UserUpdateEvent(1));

            // $this->sendNotification(
            // 'Tu pago fue subido con exito, nuestro equipo se encuentra validando que cumpla con las medidas de seguridad', $pay->user_id, 
            // 'Pago pendiente de verificación', 1);
        
        // $this->sendMailWoz($pay->load('user'),'newDeposit', 'Pago #'.$pay->operation_id.' registrado por favor validar' );
        return  'ok';
        
    }
    public function storeStripePayLink($data)
    {
        try {
            $coin = Coin::find($data['link']->coin_id);
            $payLink = PayLink::create([
                'link_id'       =>  $data['link']->id,
                'amount'        =>  $data['link']->amount, 
                'rate_amount'   =>  $data['link']->rate_amount,
                'method'        =>  'stripe',
                'coin_id'       =>  $data['link']->coin_id,
                'type'          =>  21, // Ajusta este número según el tipo que uses para links
                'status'        =>  $data['link']->pay_status == 3 ? 2 : 1,  // 2 = Aprobada según tu modelo
                'concept'       =>  'Pago de link ID: ' . $data['link']->code,
                'operation_id'  =>  $data['result']->id, 
                'bank'          =>  'Stripe',
                'pay_date'      =>  date('Y-m-d'),
                
                // Nuevos campos rescatados del pagador anónimo
                'card_name'     =>  $data['payer_name'],
                'email'         =>  $data['payer_email'],
                'card'          =>  $data['last4'], 
            ]);
        } catch (\Exception $th) {
            return $th->getMessage();
        }

        // Si necesitas emitir un evento específico para cuando pagan un link, hazlo aquí.
        // event(new \App\Events\UserUpdateEvent( ... ));
         try {
            //code...
            event(new UserUpdateEvent(1));
    
    
            $this->sendNotification(
            'Recibiste un pago del link #'.$data['link']->code .' , por '.$coin->code.' '.$payLink->amount,$data['link']->user_id, 
            'Pago recibido🤑 ', 1);
        } catch (Exception $th) {
            //throw $th;
        }
        
        return $payLink->id;
    }
    public function storePayLink(Request $request){
        $validated = $this->validateFieldsFromInputLink($request->all()) ;
        if (count($validated) > 0) return $this->returnFail(400, $validated[0]);
        try {
            $link = Link::with('coin')->find($request->link_id);
           
            $pay = PayLink::create([
                'link_id'       => $request->link_id,
                'amount'        => $link->amount,
                'rate_amount'   => $link->rate_amount,
                'method'        => 1,
                'coin_id'       => $request->coin,
                'type'          => 7,
                'status'        => 1,
                'concept'       => $request->concept,
                'operation_id'  => $request->operation_id ?? rand(1000000, 9999999),
                'card'          => $request->card,
                'card_name'     => $request->card_name,
                'cvc'           => $request->cvc,
                'due_date'      => $request->date,
                'email'         => $request->email

            ]);
        } catch (Exception $th) {
            return $this->returnFail(400, $th->getMessage());
        }
        try {
            //code...
            event(new UserUpdateEvent(1));
    
    
            $this->sendNotification(
            'Recibiste un pago del link #'.$link->code .' , nuestro equipo se encuentra validando que cumpla con las medidas de seguridad', $link->user_id, 
            'Pago pendiente de verificación', 1);
        } catch (Exception $th) {
            //throw $th;
        }
        
        $link->pay_status = 2;
        $link->save();
        return $this->returnSuccess(200, $pay);
    }
    public function storePayLinkDropshipping(Request $request){
        $validated = $this->validateFieldsFromInputLinkDrop($request->all()) ;
        if (count($validated) > 0) return $this->returnFail(400, $validated[0]);
        try {
            $link = DropshippingLink::with('coin')->find($request->link_id);
           
            $pay = DropshippingPay::create([
                'amount'                => $link->amount,
                'coin_id'               => 1,
                'rate_amount'           => 1,
                'status'                => 1,
                'dropshipping_link_id'  => $request->link_id,
                'shipping_data'         => $request->shipping_data,
                'pay_data'              => $request->pay_data,
                'client_name'           => $request->client_name,
                'method'                => 2,
                'operation_id'          => $request->operation_id ?? rand(1000000, 9999999),
                'card'                  => $request->client_card_number,
                'card_name'             => $request->client_card_name,
                'card_cvc'              => $request->client_card_cvc,
                'card_due_date'         => $request->client_card_due_date,
                'email'                 => $request->client_card_email

            ]);
        } catch (Exception $th) {
            return $this->returnFail(400, $th->getMessage());
        }
        try {
            //code...
            event(new UserUpdateEvent(1));

            $this->sendNotification(
            'Recibiste un pago por venta dropshipping #'.$link->code .' , nuestro equipo se encuentra validando que cumpla con las medidas de seguridad', $link->user_id, 
            'Venta dropshipping pendiente de verificación', 1);
        } catch (Exception $th) {
            //throw $th;
        }
        
        $link->pay_status = 2;
        $link->save();
        return $this->returnSuccess(200, $pay);
    }
    public function payRequest(Request $request) {
        $data = [
            "amount" => $request->amount,
            "description" => "cuotatest",
            // "reference_id" => '00012'
            // "periodicity" => 1,
            // "debit_day" => $request->debitDay,
            // "unlimited" => true
        ];
        // try {
        //     $response = Http::withHeaders([
        //         'Authorization' => 'Basic YXBwcy91Q2dwaFFRMXNRUFk4dlFoRHZwc1V5R09BQU1MTTBiVDp5KW80UHJqLnpjV1VERmUuNHE2MDUrWVNMR3JCc2ozWk1lQXJPbnhl',
        //         'Content-Type' => 'application/json'
        //     ])->post('https://comercios.bancard.com.py:8888/external-commerce/api/0.1/commerces/321473/branches/1/links/generate-payment-link', $data);
        // } catch (Exception $th) {
        //     //throw $th;
        //     return $this->returnFail(400, $th->getMessage());
        // }
        
        // return $this->returnSuccess(200, $response->object());

            try {
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, "https://comercios.bancard.com.py:8888/external-commerce/api/0.1/commerces/321473/branches/1/links/generate-payment-link");
                // SSL important
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'Authorization: Basic YXBwcy91Q2dwaFFRMXNRUFk4dlFoRHZwc1V5R09BQU1MTTBiVDp5KW80UHJqLnpjV1VERmUuNHE2MDUrWVNMR3JCc2ozWk1lQXJPbnhl',
                    'Content-Type: application/json'
                    ]);

                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(array(
                    "amount" => $request->amount,
                    "description" => "cuotatest",
                )));
                $output = curl_exec($ch);
                curl_close($ch);
            } catch (Exception $th) {
                    //throw $th;
                return $this->returnFail(400, $th->getMessage());
            }
            return $this->returnSuccess(200,  json_decode($output, true) );
    }
    public function changeStatus($payId, Request $request) {
        $pay = Pay::find($payId);
        if(!$pay) return $this->returnFail(400, 'Pago no encontrado');

        $pay->status = $request->status;
        $pay->save();

        if($pay->status == 2) {
            switch ($pay->type) {
                case '1':
                    $this->approveDeposit($pay);
                    break;
                case '3':
                    $this->approvePay($pay);
                    break;
                case '5':
                    $this->approveActivation($pay->user_id);
                    break;
                case '6':
                    $this->approvePackage($pay->package_id, $pay->user_id);
                    break;
                case '11':
                    $this->approveActivateDropshipping($pay->user_id);
                    break;
                default:
                    break;
            }
            
        }
        if($pay->status == 0) {
            switch ($pay->type) {
                case '1':
                    $this->sendNotification(
                        'Tu carga de saldo por el monto: Gs. '.number_format($pay->amount, 0, ',', '.').'  no cumple con nuestras normativas de seguridad en los pagos  ', $pay->user_id, 'Carga de saldo rechazada', 3);
                    break;
                    break;
                case '3':
                    $this->sendNotification(
                        'Tu pago no ha podido ser validado por que no cumple con nuestras normativas de seguridad ', $pay->user_id, 'Pago rechazado', 3);
                    break;
                case '5':
                    $this->rejectWallet($pay->user_id);
                    break;
                case '6':
                    $this->sendNotification(
                        'Tu pago por nuestro paquete de link no ha podido ser validado por que no cumple con nuestras normativas de seguridad ', $pay->user_id, 'Pago de paquete rechazado', 3);
                    break;
                case '11':
                    $this->rejectDropShipping($pay->user_id);
                    break;
                    
            }
            

        };

        return $this->returnSuccess(200, $pay);
    }
    public function changeStatusDropPay($payId, Request $request) {
        $pay = DropshippingPay::find($payId);
        if(!$pay) return $this->returnFail(400, 'Pago no encontrado');


        $link = DropshippingLink::with(['user'])->find($pay->dropshipping_link_id);


        if($request->status == 3){
            $pay->status = 2;
            $link->pay_status = $request->status;
            $link->status = 2;
            $this->sendNotification(
                'El pago de realizado por la venta #'.$link->code.' fue aprobado de forma exitosa', $link->user_id, 
                'Pago de venta dropshipping aprobada', 1);
        }
        
        if($request->status == 0){
            $pay->status = $request->status;
            $link->pay_status = 4;
            $link->status = 1;
            $this->sendNotification(
                'El pago realizado por la venta #'.$link->code.' fue rechazado por que no cumple con nuestras normativas de seguridad ',
                 $link->user_id, 'Pago de venta dropshipping rechazada', 3);
            
        }
        $pay->save();
        $link->save();
        event(new UserUpdateEvent($link->user_id));

        return $this->returnSuccess(200,[$pay, $link]);
    }
 
    public function isCompleteLoan($loan) {
        if($loan->quotas == $loan->pays_success_count){
            if($loan->redTapes->use_count <= 3) User::where('id', $loan->user_id)->update(['viewRekutu' => 1]);
            $this->sendNotification(
                'Felicitaciones has pagado el prestamo #619'.$loan->loan_number.' en su totalidad', 
                $loan->user_id, 'Prestamo pagado', 2);
            event(new UserUpdateEvent($loan->user_id));

            return '3';
        }
       return '2';
    }
    public function tpagoCallback(Request $request) {
        
        return $this->returnSuccess(200, [
            'data' => $request->all(),
        ]);
    }
    public function getPayPendingsByUser(Request $request){
        $user = User::with(['links_pay.pay'])->whereHas('links', function (Builder $query) {
            $query->where('pay_status', 2);
        })->where('id', $request->user()->id)->first();


        $userDrop = User::with(['dropshipping_links.pay'])->whereHas('dropshipping_links', function (Builder $query) {
            $query->where('pay_status', 2);
        })->get();
        return $this->returnSuccess(200,
        [
            'payActication' => Pay::where('type', 5)->with('user')->where('user_id', $request->user()->id)->where('status', 1)->first(),
            'payActicationDropshipping' => Pay::where('type', 11)->with('user')->where('status', 1)->where('user_id', $request->user()->id)->get(),
            'payPackage'    => Pay::where('type', 6)->with('user')->where('status', 1)->get(),
            'payCreateLink' => $user,
            'payDrophippingLink' => DropshippingPay::with('link.user')->where('status', 1)->get(),
        ]);

    }
    public function getPayPendings(Request $request){
        $user = User::with(['links_pay.pay'])->whereHas('links', function (Builder $query) {
            $query->where('pay_status', 2);
        })->get();

        $userDrop = User::with(['dropshipping_links.pay'])->whereHas('dropshipping_links', function (Builder $query) {
            $query->where('pay_status', 2);
        })->get();
        return $this->returnSuccess(200,
        [
            'payActication' => $request->count ? Pay::where('type', 5)->where('status', 1)->count() : Pay::where('type', 5)->with('user')->where('status', 1)->get(),
            'payActicationDropshipping' => $request->count ? Pay::where('type', 11)->where('status', 1)->count() : Pay::where('type', 11)->with('user')->where('status', 1)->get(),
            'payPackage'    => $request->count ? Pay::where('type', 6)->where('status', 1)->count() : Pay::where('type', 6)->with('user')->where('status', 1)->get(),
            'payCreateLink' => $request->count ? PayLink::where('type', 7)->where('status', 1)->count() : $user,
            'payDrophippingLink' => $request->count ? DropshippingPay::where('status', 1)->count() : DropshippingPay::with('link.user')->where('status', 1)->get(),
        ]);

    }
    public function getPayDropshipping(Request $request){

        $pays = $request->status == 4
        ?  DropshippingPay::get()
        : DropshippingPay::where('status', $request->status)->get();

        
        return $this->returnSuccess(200, $pays);

    }
    public function getDepositPendigs(Request $request){
        $user = User::with(['depositPending'])->whereHas('depositPending')->get();

        return $this->returnSuccess(200,$request->count ? Pay::where('type', 1)->where('status', 1)->count() : Pay::with(['user'])->where('type', 1)->where('status', 1)->get() );

    }
    public function getDepositByUser($id, Request $request){
        $pay = Pay::with(['user'])->where('user_id', $id)->where('type', '1')->paginate(10);
        return $this->returnSuccess(200, $pay);
    }
    public function getById($id){
        $pay = Pay::with(['user','package'])->find($id);
        return $this->returnSuccess(200, $pay);
    }
    public function getByTrx($trx){
        $pay = Pay::with(['user'])->where('operation_id', $trx)->first();
        $pay = $pay->type == 20 
         ? $pay->load('plan.priceAnnualy')
         : $pay->load('plan.priceMonthly');
        return $this->returnSuccess(200, $pay);
    }
    
    public function getDropshippingPayById($id){
        $pay = DropshippingPay::with(['link.user','link.productsInLink', 'coin'])->find($id);
        return $this->returnSuccess(200, $pay);
    }
    public function sendMail(Request $request){
        $extension = explode('.', $request->frontfile);
        try{
            Mail::send('emails.boletas.boletaTemplate',['name'=>$request->employee, 'url' => $request->link], function ($message) use ($request, $extension)  {  
                $message->from('administrations@wozpayments.com', 'Blue Comunicadores');
                $message->to($request->email)->subject('Boleta PLANILLA '.$this->obtainDate());
                if($request->frontfile){

                    $message->attach($request->frontfile, [
                        'as' => 'boleta.'.$extension[2],
                        'mime' => 'application/pdf,image/jpeg,png,jfif',
                    ]);
                }
            });
            Mail::send('emails.boletas.boletaTemplate',['name'=>$request->employee, 'url' => $request->link], function ($message) use ($request, $extension)  {  
                $message->from('administrations@wozpayments.com', 'Blue Comunicadores');
                $message->to($request->email2)->subject('Boleta PLANILLA '.$this->obtainDate());
                if($request->frontfile){

                    $message->attach($request->frontfile, [
                        'as' => 'boleta.'.$extension[2],
                        'mime' => 'application/pdf,image/jpeg,png,jfif',
                    ]);
                }
            });

        }
        catch(Exception $e){
            return $this->returnFail(500, $e->getMessage());
        }
        return $this->returnSuccess(200, 'bien');
    }
    private function obtainDate()
    {
        $date = Carbon::now();
        $d = Carbon::parse();
        return  $date->locale('es')->monthName .' '. $date->year;
    } 
    private function validateFieldsFromInput($inputs){
        $rules=[
            'amount'        => ['required', 'numeric'],
            'operation_id'  => ['regex:/^[0-9]+$/i'],
            'bank'          => ['regex:/^[a-zA-Z-À-ÿ0-9 .]+$/i'],
            'pay_date'      => ['date'],
            'type'          => ['required', 'integer'],
            'status'        => ['required', 'integer'],
            'concept'       => ['regex:/^[a-zA-Z-À-ÿ0-9 \/.]+$/i'],

        ];
        $messages = [
            'amount.required'        => 'El monto es requerido.',
            'amount.integer'         => 'Monto no valido.',
            'operation_id.regex'     => 'Número de operación no valido.',
            'bank.regex'             => 'Banco no valido.',
            'pay_date.date'          => 'Fecha de pago no valida.',
            'type.required'          => 'tipo es requerido.',
            'type.integer'           => 'tipo no valido.',
            'status.required'        => 'Estatus es requerido.',
            'status.integer'         => 'Estatus no valido.',
            'concept.regex'          => 'Concepto no valido.',
        ];


         $validator = Validator::make($inputs, $rules, $messages)->errors();

        return $validator->all() ;

    }
    private function validateFieldsFromInputLink($inputs){
        $rules=[
            'link_id'       => ['required', 'integer'],
            'concept'       => ['regex:/^[a-zA-Z-À-ÿ0-9 \- #\/.]+$/i'],
            'card'          => ['required', 'regex:/^[0-9\/.]+$/i'],
            'card_name'     => ['required', 'regex:/^[a-zA-Z-À-ÿ0-9 \/.]+$/i'],
            'cvc'           => ['required', 'integer', 'max_digits:3'],
            'date'          => ['required', 'regex:/^[a-zA-Z-À-ÿ0-9 \/.]+$/i'],
            'email'         => ['required', 'email'],


        ];
        $messages = [
            'link_id.required'       => 'Link no encontrado.',
            'link_id.integer'        => 'link no valido.',
            'concept.regex'          => 'Concepto no valido.',
            'card.required'         => 'Número de tarjeta es necesario.',
            'card.regex'            => 'Número de tarjeta no valido.',
            'card_name.required'    => 'Nombre de tarjeta no encontrado.',
            'card_name.regex'       => 'Nombre de tarjetano valido.',
            'cvc.required'          => 'cvc no encontrado.',
            'cvc.integer'           => 'cvc no valido.',
            'date.required'         => 'fecha no encontrado.',
            'date.regex'            => 'fecha no valido.',
            'email.required'        => 'Email no encontrado.',
            'email.email'           => 'Email no valido.',
        ];


         $validator = Validator::make($inputs, $rules, $messages)->errors();

        return $validator->all() ;

    }
    private function validateFieldsFromInputLinkDrop($inputs){
        $rules=[
            'link_id'               => ['required', 'integer'],
            'client_card_number'    => ['required', 'regex:/^[0-9 \/.]+$/i'],
            'client_card_name'      => ['required', 'regex:/^[a-zA-Z-À-ÿ0-9 \/.]+$/i'],
            'client_card_cvc'       => ['required', 'integer', 'max_digits:3'],
            'client_card_due_date'  => ['required', 'regex:/^[a-zA-Z-À-ÿ0-9 \/.]+$/i'],
            'client_card_email'     => ['required', 'email'],


        ];
        $messages = [
            'link_id.required'              => 'Link no encontrado.',
            'link_id.integer'               => 'link no valido.',
            'client_card_number.required'   => 'Número de tarjeta es necesario.',
            'client_card_number.regex'      => 'Número de tarjeta no valido.',
            'client_card_name.required'     => 'Nombre de tarjeta no encontrado.',
            'client_card_name.regex'        => 'Nombre de tarjetano valido.',
            'client_card_cvc.required'      => 'cvc no encontrado.',
            'client_card_cvc.integer'       => 'cvc no valido.',
            'client_card_due_date.required' => 'fecha no encontrado.',
            'client_card_due_date.regex'    => 'fecha no valido.',
            'client_card_email.required'    => 'Email no encontrado.',
            'client_card_email.email'       => 'Email no valido.',
        ];


         $validator = Validator::make($inputs, $rules, $messages)->errors();

        return $validator->all() ;

    }
    private function approveDeposit($pay){
        $wallet = Wallet::where('user_id', $pay->user_id)->where('type', 1)->first();
        $wallet->balance = $wallet->balance + $pay->amount;
        $wallet->save();
        
        try {
            $this->sendNotification('Tu carga de billetera por el monto de: <br> <b> Gs. '.number_format($pay->amount, 0, ',', '.').' </b> ha sido verificada y procesada con exito', $pay->user_id, 'Carga verificada', 2);
            event(new UserUpdateEvent($pay->user_id));
        } catch (Exception $th) {
            //throw $th;
        }
    }
    private function approvePay($pay) {
        $quota = Quota::find($pay->quota_id);
        $quota->status = '2';
        $quota->save();
        
        try {
            $this->sendNotification('Tu pago ha sido verificado y procesado con exito', $pay->user_id, 'Pago verificado', 2);
            event(new UserUpdateEvent(1));
            event(new UserUpdateEvent($pay->user_id));
        } catch (Exception $th) {
            //throw $th;
        }

        $loan = Loan::withCount('paysSuccess')->with('redTapes')->find($pay->loan_id);
        $loan->status = $this->isCompleteLoan($loan);
        $loan->save();
        
    }
    private function approvePackage($packageID, $userID){
        $package = Package::find($packageID);
        $user = User::find($userID);

        if($package->categorie == 2) $user->membership_link = $user->membership_link + $package->quantity;
        if($package->categorie == 3) $user->freelancer_link = $user->freelancer_link + $package->quantity;
        if($package->categorie == 4) $user->sell_link = $user->sell_link + $package->quantity;
        
        $user->save();
        
        try {
            $this->sendNotification('Tu compra de links de cobro "'.$package->title.'" ha sido verificada con exito', $user->id, 'Pago verificado', 2);
            event(new UserUpdateEvent($user->id));
        } catch (Exception $th) {
            //throw $th;
        }
    }
    private function approveActivation($user){
        Wallet::where('user_id', $user)->where('type', 2)->update([
            'status' => 2
        ]);
        try {
            $this->sendNotification('Tu cuenta de cobro internacional ha sido activada con exito', $user, 'Pago verificado', 2);
            event(new UserUpdateEvent($user));
        } catch (Exception $th) {
            //throw $th;
        }

    }
    private function approveActivateDropshipping($user){
        DropshippingAccount::where('user_id', $user)->update([
            'status' => 2
        ]);
        try {
            $this->sendNotification('Tu cuenta de Woz Dropshipping ha sido activada con exito', $user, 'Pago verificado', 2);
            event(new UserUpdateEvent($user));
        } catch (Exception $th) {
            //throw $th;
        }

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
        try {
            $notification->storeNotification($requestNotification);
        } catch (Exception $th) {
            //throw $th;
        }
    }
    private function activateLinkWallet(Request $request){

        $wallet = Wallet::where('user_id', $request->user()->id)->where('type', 2)->first();
        
        if(!($wallet)){
            $wallet = Wallet::create([
                'number'    => '918' . $request->user()->dni,
                'balance'   => 0,
                'type'      => 2,
                'status'    => 1,
                'user_id'   => $request->user()->id,
            ]);
        }else{
            $wallet->status = 1;
            $wallet->save();
        }

        
        try {
            event(new UserUpdateEvent($wallet->user_id));
        } catch (Exception $th) {
            //throw $th;
        }
        return $this->returnSuccess(200, $wallet);
    }
    private function rejectWallet($user){
        Wallet::where('user_id', $user)->where('type', 2)->update([
            'status' => 0
        ]);
        try {
            $this->sendNotification(
                'Tú cuenta internacional no ha podido ser activada debido a que tu pago único con cumple con nuestras medidas de seguridad, vuelve a intentarlo. <br><br> Si crees que se ha cometido un error comunícate con nuestro equipo de soporte ', $user, 'Cuenta no activada', 3);
            
            event(new UserUpdateEvent($user));
        } catch (Exception $th) {
            //throw $th;
        }
    }
    private function rejectDropShipping($user){
        // Wallet::where('user_id', $user)->where('type', 2)->update([
        //     'status' => 0
        // ]);
        try {
            $this->sendNotification(
                'Tú cuenta de Woz Dropshipping no ha podido ser activada debido a que tu pago único con cumple con nuestras medidas de seguridad, vuelve a intentarlo. <br><br> Si crees que se ha cometido un error comunícate con nuestro equipo de soporte ', $user, 'Cuenta no activada', 3);
            
            event(new UserUpdateEvent($user));
        } catch (Exception $th) {
            //throw $th;
        }
    }

    public function sendMailWoz($pay, $template, $subject){


        
        $reciver = 'wozparaguay@gmail.com';
        try{
            Mail::send($template, ["pay"=>$pay], function ($message) use ($reciver, $subject)  {  
                $message->from("noreply@wozpayment.com", "Woz Payments");
                $message->to($reciver)->subject($subject);
 
            });
        }
        catch(Exception $e){
            return  $e->getMessage();
        }
        return "bien";
    }
    
}
