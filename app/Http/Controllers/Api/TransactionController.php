<?php

namespace App\Http\Controllers\Api;

use DateTime;
use App\Models\Pay;
use App\Models\Link;
use App\Models\Loan;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Transfer;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;
use App\Models\DropshippingPay;
use App\Models\PayLink;
use App\Models\Withdrawal;
use Illuminate\Contracts\Database\Eloquent\Builder;

class TransactionController extends Controller
{
    //
    public function getTrasactionByUser($userId, Request $request) {
        $user =  User::with(['successPays' => function (Builder $query) use ($request) { 
            $query->where('type','!=',11)->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year);
        }, 'wallet'])->find($userId);

        $send =  Wallet::with(['transferSend' => function (Builder $query) use ($request) { 
            $query->with('user_to.user')->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year);
        }])->find($user->wallet->id);

        $recept =  Wallet::with(['transferRecept' => function (Builder $query) use ($request) { 
            $query->with('user_from.user')->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year);
        }] )->find($user->wallet->id);
        $activationPay = Pay::with('user')->where('user_id',$userId)->where('type',5)->where('status', '2')->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year)->get();
        $activationPayDrop = Pay::with('user')->where('user_id',$userId)->where('type',11)->where('status', '2')->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year)->get();

        $packagePay = Pay::with('user', 'package')->where('user_id',$userId)->where('type',6)
        ->where('status', '2')
        ->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year)->get();


        $withdrawal = Withdrawal::with(['user', 'accountBank'])->where('user_id',$userId)->where('status', '2')
        ->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year)->get();
        
        
        // $paysLink = PayLink::with('links')->whereHas('links', function (Builder $query) use ($userId){
        //     $query->where('user_id',  $userId);
        // })->where('status', 2)->whereMonth('created_at',$request->month+1)->whereYear('created_at', $request->year)->get();
        
        $loans = Loan::where('status', '!=','1')
        ->where('status', '!=','0')
        ->where('isRekutu', 0)
        ->whereMonth('created_at',$request->month+1)
        ->whereYear('created_at', $request->year)
        ->where('user_id', $userId)->get();

        $links = Link::with(['coin'])->where('status', '!=','0')->whereMonth('created_at',$request->month+1)
        ->whereYear('created_at', $request->year)
        ->where('user_id', $userId)->get();
        
        $all = [
            ...$user->successPays ?? [], 
            ...$this->tagTransfer($recept->transferRecept ?? [],4), 
            ...$this->tagTransfer($send->transferSend ?? [],5) ,
            ...$this->tagTransfer($loans ?? [],6) ,
            ...$this->tagTransfer($links ?? [],7) ,
            ...$this->tagTransfer($withdrawal ?? [],12) ,
            // ...$activationPay,
            ...$packagePay,
            ...$activationPayDrop,

        ];
        
        usort($all, $this->object_sorter('created_at', 'DESC'));

        $allFormated = array_chunk($all, 6);
        
        return $this->returnSuccess(200,[ 
          'transactions' =>  $allFormated[$request->page - 1] ?? [],
          'countAllPages' =>  ceil(count($all)/6),
        ]);
    }
    public function getTrasactionByType($type, $id){
        return $this->returnSuccess(200,$this->trasactionByType($type, $id)) ;
    }
    public function printTransaction($type, $id)
    {
        $transaction = $this->trasactionByType($type, $id);
        $pdf = Pdf::loadView('recipeTemplate', [
            'transaction' =>  $this->formatRecipePrint($type, $transaction),
            'title' => $this->getTitleByType($type) ]);

         return $pdf->stream('Comprobante');

        
        return view('recipeTemplate', [
            'transaction' =>  $this->formatRecipePrint($type, $transaction),
            'title' => $this->getTitleByType($type) ]);

    }
    private function trasactionByType($type, $id){
        if($type == 1 ){
            return  Pay::with('user.card')->find($id);

        }
        if($type == 2 || $type == 3){
            return  Pay::with('loan', 'user.card')->find($id);
        }

        if($type == 4 || $type == 5 ){
            return  Transfer::with('user_from.user', 'user_to.user')->find($id);
        }
        if($type == 6){
            return  Loan::with('user')->find($id);
        }
        if($type == 7){
            return  Link::with('user', 'coin')->find($id);
        }
        if($type == 8){
            return Pay::with('user')->find($id);

        }
        if($type == 9){
            return Pay::with('user', 'package')->find($id);
        }
        if($type == 10){
            return PayLink::with('links', 'coin')->find($id);
        }
        if($type == 11){
            return Pay::with('user')->where('type', 11)->find($id);
        }
        if($type == 12){
            return Withdrawal::with('user', 'accountBank.bank')->find($id);
        }
        if($type == 15){
            return DropshippingPay::with('link.user', 'coin')->find($id);
        }
    }
    private function object_sorter($clave,$orden=null) {
        return function ($a, $b) use ($clave,$orden) {
            $result=  ($orden=="DESC") ? strnatcmp($b->$clave, $a->$clave) :  strnatcmp($a->$clave, $b->$clave);
            return $result;
        };
    }
    private function tagTransfer($transfer, $tag){
        if(count($transfer) == 0) return [];
        
        foreach ($transfer as $key) {
            $key->transaction = $tag;
            if($tag==6){
                $key->amount = 212000;
            }
        }
        return $transfer;
    }
    private function getTitleByType($type){
        $types = [
            '',
            'Comprobante de carga de saldo',
            'Comprobante de pago con Tpago',
            'Comprobante de pago con transferencia bancaria',
            'Comprobante de transferencia interna recibida',
            'Comprobante de transferencia interna realizada',
            'Comprobante de descuento automático',
            'Link de pago',
            'Activación cuenta internacional',
            'Comprobante de pago de paquetes',
            'Comprobante de pago',
            'Pago de activación de cuenta Woz Dropshipping',
            'Retiro instantaneo'
        ];

        return $types[$type];
    }
    private function formatRecipePrint($type, $transaction){
        $lines = [];

        $lines[0] = [

            'title' =>'Monto',
            'text' => $type == 10 && $transaction->coin_id == 2 ? 'Cantidad de dinero en dólares':'Cantidad de dinero en Guaranies',
            'value' =>$type == 10 && $transaction->coin_id == 2
            ? $transaction->coin->code .' '. number_format($transaction->amount/$transaction->rate_amount, 0, ',', '.')
            : 'Gs. '.number_format($transaction->amount, 0, ',', '.'),
        ];

        
        if($type == 1) {

            $lines[1] = [
            'title' =>  'Carga de saldo',
            'text'  =>  'Titular Woz Pay',
            'value'   => $transaction->user->name,
            ];
            $lines[2] = [
            'title' =>  'Caja de ahorro N°',
            'text'  =>  'Documento de identificación',
            'value'   => '916-'.$transaction->user->dni,
            ];
            $lines[3] = [
            'title' =>  'Referencia',
            'text'  =>  'Referencia de transacción',
            'value'   => $transaction->operation_id,
            ];
        }

        if($type == 2 || $type == 3) {
            $lines[1] = [
            'title' =>  'Pago de prestamo',
            'text'  =>  $transaction->concept,
            ];
            $lines[2] = [
            'title' =>  'Tipo de pago',
            'text'  =>  $type == 3 ? 'Transeferencia' : 'Tarjeta mediante Tpago',
            ];
            $lines[3] = [
            'title' =>  'Referencia',
            'text'  =>  'Referencia de prestamo',
            'value'   => '619-'.$transaction->loan->loan_number,
            ];
        }

        if($type == 4 || $type == 5)  {
            $lines[1] = [
            'title' =>  $type == 4 ? 'Recibido de' : 'Enviado a',
            'text'  =>  'Titular Woz Pay',
            'value'   => $type == 4 ? $transaction->user_from->user->name : $transaction->user_to->user->name,

            ];
            $lines[2] = [
            'title' =>  'Documentación',
            'text'  =>  'Documento de identificación',
            'value'   => $type == 4 ? number_format($transaction->user_from->user->dni, 0, ',', '.') : number_format($transaction->user_to->user->dni, 0, ',', '.'),

            ];
            $lines[3] = [
            'title' =>  'Concepto',
            'text'  =>  'Motivo del envío',
            'value'   => $transaction->concept,
            ];
        }

        if($type == 6)  {
            $lines[1] = [
            'title' => 'Debito automatico',
            'text'  =>'Woz Payments',
            ];
            $lines[2] = [
            'title' => 'Tipo de debito',
            'text'  => $transaction->user->card->type ==  1 ? 'Debito tarjeta de crédito' : 'Debito tarjeta de débito',
            ];
            $lines[3] = [
            'title' => 'Referencia',
            'text'  =>'619 5556668745',
            ];
        }
        if($type == 7)  {
            $lines[1] = [
            'title' => 'Titulo del producto',
            'value'  => $transaction->title,
            ];
            $lines[2] = [
            'title' => 'URL',
            'value'  => $transaction->url
            ];
            $lines[3] = [
            'title' => 'Referencia',
            'value'  => $transaction->code,
            ];
        }
        if($type == 8)  {
            $lines[1] = [
                'title' =>'Titulo del producto',
                'text' => 'Activación de cuenta internacional',
            ];
            $lines[2] = [
                'title' => 'Referencia',
                'value' => $transaction->operation_id,
            ];
            $lines[3] = [
                'title' => 'Metodo de pago',
                'value' => $transaction->method == 1 ? 'Transferencia' : 'Tarjeta',
            ];
        }
        if($type == 9)  {
            $lines[1] = [
                'title' => 'Titulo del producto',
                'text' => $transaction->package->title,
            ];
            $lines[2] = [
                'title' => 'Referencia',
                'value' => $transaction->operation_id,
            ];
            $lines[3] = [
                'title' => 'Metodo de pago',
                'value' => 'Transferencia',
            ];
        }
        if($type == 10)  {
            $lines[1] = [
                'title' => 'Titulo del producto',
                'text' => $transaction->links->title,
            ];
            $lines[2] = [
                'title' => 'Moneda',
                'value' => $transaction->coin->name,
            ];
            $lines[3] = [
                'title' => 'Referencia',
                'value' => '#'.$transaction->operation_id,
            ];
            $lines[4] = [
                'title' => 'Descripción',
                'text' => $transaction->concept,
            ];
            $lines[5] = [
                'title' => 'Metódo de pago',
                'value' => 'Tarjeta',
            ];
        }
        if($type == 11)  {
            $lines[1] = [
                'title' =>'Titulo del producto',
                'text' => 'Activación de cuenta dropshipping',
            ];
            $lines[2] = [
                'title' => 'Referencia',
                'value' => $transaction->operation_id,
            ];
            $lines[3] = [
                'title' => 'Metodo de pago',
                'value' => $transaction->method == 1 ? 'Transferencia' : 'Tarjeta',
            ];
            $lines[3] = [
                'title' => 'Concepto',
                'value' => $transaction->concept,
            ];
        }
         if($type == 12)  {
            $lines[1] = [
                'title' =>'Cuenta de banco',
                'value' => $transaction->account_bank->account_number,
            ];
            $lines[2] = [
                'title' => 'Referencia',
                'value' => $transaction->operation_id,
            ];
            $lines[3] = [
                'title' => 'Metodo de pago',
                'value' => $transaction->method_label,
            ];
            $lines[3] = [
                'title' => 'Comisión',
                'value' => $transaction->comision_type_label,
            ];
            $lines[4] = [
                'title' => 'Comisión fija',
                'value' => 7500,
            ];
        }

        array_push($lines,[
            'date'  => date("d/m/Y", strtotime($transaction->created_at)),
            'hour'  => date(" H:i", strtotime($transaction->created_at)) .' hs',
        ]);

        return  $lines;
    
    }

}
