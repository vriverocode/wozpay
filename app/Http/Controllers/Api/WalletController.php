<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Pay;
use App\Models\Loan;
use App\Models\User;
use App\Models\Quota;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Events\UserUpdateEvent;
use App\Http\Controllers\Controller;
use App\Models\Plan;

class WalletController extends Controller
{
    public function getWalletByNumber($wallet, Request $request){
        $wallet = Wallet::with('user')->where('number', $wallet)->first();
        
        if(!$wallet) return $this->returnFail(400, 'Cuenta no existe.');
        if($wallet->user->id == $request->user()->id) return $this->returnFail(400, 'No puedes realizar trasferencia a tu misma cuenta.');

        return $this->returnSuccess(200, $wallet);
    }
    private function activateLinkWallet(Request $request){
        $wallet = Wallet::create([
            'number'    => '918' . $request->user()->dni,
            'balance'   => 0,
            'type'      => 2,
            'status'    => 2,
            'user_id'   => $request->user()->id,
        ]);
        
        try {
            event(new UserUpdateEvent($wallet->user_id));
            
        } catch (Exception $th) {
            //throw $th;
        }
        return  $wallet;
    }

    public function setPlan(Request $request){
        try {
            $plan = $this->getPlansID($request->plan_code);
            $wallet = $this->activateLinkWallet($request);
            $user = User::find($request->user()->id)->update([
                'plan_id' => $plan ? $plan->id : $request->plan_id,
                'plan_expiration_date' => $this->expirationDatePlan($plan->id, $request->payment_type),
            ]);

            $this->sendNotification(
            'Felicidades, haz pagado el plan "'.$plan->name.'" para hacer cobros por links o qr',
             $request->user()->id, 
            'Subcripción exitosa', 1);
        } catch (Exception $th) {
            return $this->returnFail(400, $th->getMessage());
        }

        return self::returnSuccess(200, 'OK');
    }
    public function allBalances($id) {
        $wallet = Wallet::where('user_id', $id)->where('type', 1)->first();
        $wallet_link = Wallet::where('user_id', $id)->where('type', 2)->first();

        if(!$wallet) return $this->returnFail(400, 'Cuenta no existe.');
        $loansBalances = $this->allLoansAmount();
        $paysAndProfit = $this->allPays();
        $paysPending =  $this->paysPeding();

        return $this->returnSuccess(200, $id == 1 
        ? [
            'wallet'        => round($wallet->balance),
            'loans'         => round($loansBalances['amount']),
            'toRecieve'     => round($loansBalances['amountToRecive']),
            'toPay'         => round($this->allQuotasToRecive()),
            'paysRecieve'   => round($paysAndProfit['pays']),
            'subscriptions' => round($paysAndProfit['subscriptions']),
            'paysPeding'    => round($paysPending) 
        ]
        : [
            'wallet'        => $wallet->balance,
            'loans'         => $loansBalances['amount'],
            'toRecieve'     => $loansBalances['amountToRecive'],
            'paysRecieve'   => $paysAndProfit['pays'],
            'wallet_link'   => $wallet_link ? round($wallet_link->balance) : 0,
            'wallet_dolar'  => $wallet_link ? round($wallet_link->balance_dolar) : 0,
        ]);
    }
    public function incrementsWallet($id, Request $request) {
        $wallet = Wallet::where('user_id', $id)->where('type', $request->type)->first();
        
        if(!$wallet) return $this->returnFail(404, 'Wallet no encontrada');

        $wallet->balance +=  $request->amount;
        $wallet->balance -=  $request->amountLess;

        $wallet->save();
        try {
            event(new UserUpdateEvent($id));
        } catch (Exception $th) {
            //throw $th;
        }

        return $this->returnSuccess(200, $wallet);
    }
    public function setNewAdminCapital(Request $request) {
        $wallet = Wallet::where('user_id', 1)->where('type', 1)->first();

        $wallet->balance =  $request->amount;
        $wallet->save();
        event(new UserUpdateEvent(1));

        return $this->returnSuccess(200, $wallet);
    }
    public function setStatus(Request $request){
        $wallet = Wallet::where('user_id', $request->user)->where('type', 2)->first();

        $wallet->status =  $request->status;
        $wallet->save();
        event(new UserUpdateEvent(1));

        return $this->returnSuccess(200, $wallet);
    }
    private function allLoansAmount() {
        $amount = 0;
        $amounToRecive = 0 ;
        $loans = Loan::where('status','!=' ,'1' )->where('status','!=' ,'0' )->get();
        
        
        foreach ($loans as $loan) {
            $amount += $loan->amount;
            $amounToRecive += $loan->amount_to_pay;
        }

        return [
            'amount' => $amount,
            'amountToRecive' => $amounToRecive,
        ];

    }
    private function allQuotasToRecive() {
        $amount = 0;
        $amounDelay = 0 ;
        $quotas = Quota::where('status', '1' )->get();
        $quotasDelay = Quota::with('loan')->where('status', '3' )->get();
        
        
        foreach ($quotas as $quota) {
            $amount += $quota->amount;
        }
        foreach ($quotasDelay as $quota) {
            $amount += ( $quota->amount + ($quota->amount * $quota->loan->interest_for_delay)/100) ;
        }
        return $amount;

    }
    private function allPays() {
        $forSubscriptions = 0;
        $paysRecieve = 0 ;
        $pays = Pay::where('status', '2' )->get();
        $subscriptions = (Loan::where('status', '2' )->where('isRekutu', 0)->count() * 150000) + (Loan::where('status', '3' )->where('isRekutu', 0)->count() *150000) + (Loan::where('status', '4' )->count() *150000);

        if($pays) 
            foreach ($pays as $pay) {
                $paysRecieve += $pay->amount;
            }   

        return [
            'pays' => $paysRecieve,
            'subscriptions' => $subscriptions,
        ];

    }
    private function paysPeding() {
        return  Pay::where('status', '1' )->where('type', '3' )->count();
    }
    private function expirationDatePlan($id, $paymentType)
    {
        if($id == 1){
            return date('Y-m-d',strtotime('+100 year', time()));
        }
        if ($paymentType== 1) {
            return date('Y-m-d',strtotime('+1 year', time()));
        }
        if ($paymentType == 2) {
            return date('Y-m-d',strtotime('+30 days', time()));
        }
    }
    private function getPlansID($code)
    {
        return Plan::where('code', $code)->first();
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
}
