<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use Exception;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use App\Models\Link;

class WithdrawalController extends Controller
{
    public function getAllByUser(Request $request)
    {
        try {
            $withdrawals = Withdrawal::with(['accountBank.bank'])
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'DESC')
                ->get();
        } catch (Exception $th) {
            return $this->returnFail(400, $th->getMessage());
        }
        return $this->returnSuccess(200, $withdrawals);
    }

    public function getById($id, Request $request)
    {
        try {
            $withdrawal = Withdrawal::with(['accountBank.bank'])
                ->where('id', $id)
                ->where('user_id', $request->user()->id)
                ->first();
            
            if (!$withdrawal) {
                return $this->returnFail(404, 'Retiro no encontrado');
            }
        } catch (Exception $th) {
            return $this->returnFail(400, $th->getMessage());
        }
        return $this->returnSuccess(200, $withdrawal);
    }

    public function store(Request $request)
    {
        $validated = $this->validateFieldsFromInput($request->all());
        if (count($validated) > 0) {
            return $this->returnFail(400, $validated[0]);
        }

        try {
            $withdrawal = Withdrawal::create([
                'amount'           => $request->amount,
                'type'             => $request->type,
                'status'           => 1,
                'method'           => 1,
                'comision_by_type' => $request->comision_by_type,
                'comision_fixed'   => $request->comision_fixed,
                'user_id'          => $request->user()->id,
                'account_bank_id'  => $request->account,

            ]);
        } catch (Exception $th) {
            return  $this->returnFail(500, $th->getMessage());
        }
        return $this->returnSuccess(200, 'Operation Successfully');
    }
    public function getWithdrawalData(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();

        $balances = [
            // 15% -> Retiro inmediato. No filtramos por fecha para que incluya 
            // los pagos de HOY y cualquier otro pago reciente que aún no cumpla 7 días.
            '15'  => Link::where('user_id', $userId)
                        ->where('pay_status', 3)
                        ->sum('amount_to_client'),

            // 10% -> Solo pagos que tengan 7 días o más de antigüedad.
            // (Los de hoy no califican).
            '10'  => Link::where('user_id', $userId)
                        ->where('pay_status', 3)
                        ->where('created_at', '<=', $now->copy()->subDays(7))
                        ->sum('amount_to_client'),

            // 8% -> Solo pagos que tengan 14 días o más de antigüedad.
            // (Cambio aplicado: subDays(14)).
            '8'   => Link::where('user_id', $userId)
                        ->where('pay_status', 3)
                        ->where('created_at', '<=', $now->copy()->subDays(14))
                        ->sum('amount_to_client'),

            // 3.9% -> El resto de pagos muy antiguos (ejemplo: 30 días o más).
            '3.9' => Link::where('user_id', $userId)
                        ->where('pay_status', 3)
                        ->where('created_at', '<=', $now->copy()->subDays(30))
                        ->sum('amount_to_client'),
        ];

        return $this->returnSuccess(200, $balances);
    }
    private function validateFieldsFromInput($inputs)
    {
        $rules = [
            'account'               => ['required', 'numeric'],
            'amount'                => ['required', 'numeric', 'regex:/^[0-9 .]+$/i'],
            'amount_to_transfer'    => ['required', 'numeric', 'regex:/^[0-9 .]+$/i'],
            'comision_by_type'      => ['required', 'numeric', 'regex:/^[0-9 .]+$/i'],
            'comision_fixed'        => ['required', 'numeric', 'regex:/^[0-9 .]+$/i'],
            'type'                  => ['required', 'integer'],

        ];
        $messages = [
            'account.required'            => 'Cuenta para retiro es requerida.',
            'account.numeric'             => 'Cuenta no valida.',
            'amount.required'             => 'El monto es requerido.',
            'amount.numeric'              => 'Monto no valido.',
            'amount.regex'                => 'Monto no valido.',
            'amount_to_transfer.required' => 'El monto es requerido.',
            'amount_to_transfer.numeric'  => 'Monto no valido.',
            'amount_to_transfer.regex'    => 'Monto no valido.',
            'comision_by_type.required'   => 'El comision es requerido.',
            'comision_by_type.numeric'    => 'Comision no valido.',
            'comision_by_type.regex'      => 'Comision no valido.',
            'comision_fixed.required'     => 'El comision es requerido.',
            'comision_fixed.numeric'      => 'Comision no valido.',
            'comision_fixed.regex'        => 'Comision no valido.',
            'type.required'               => 'Tipo de descuento es requerido',
            'type.integer'                => 'Tipo de descuento no valido'

        ];


         $validator = Validator::make($inputs, $rules, $messages)->errors();

        return $validator->all() ;
    }
}
