<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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

    /**
     * Indica si el usuario autenticado tiene retiros en estado pendiente (status = 1).
     */
    public function hasPending(Request $request)
    {
        try {
            $userId = $request->user()->id;
            $pending = Withdrawal::with(['accountBank.bank'])->where('user_id', $userId)
                ->where('status', 1)
                ->first();
            $pendingCount = Withdrawal::where('user_id', $userId)
                ->where('status', 1)
                ->count();
        } catch (Exception $th) {
            return $this->returnFail(400, $th->getMessage());
        }

        return $this->returnSuccess(200, [
            'has_pending' => $pendingCount > 0,
            'pending_count' => $pendingCount,
            'withdrawalOrder' => $pending,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateFieldsFromInput($request->all());
        
        if (count($validated) > 0) {
            return $this->returnFail(400, $validated);
        }

        $user = $request->user();
        $amountToWithdraw = $request->amount;
        $type = $request->type;

        $dateThreshold = $this->getDateThresholdByType($type);
        $availableLinks = $this->getAvailableLinks($user->id, $dateThreshold, $type);
        $linksToMark = $this->getLinksToCoverAmount($availableLinks, $amountToWithdraw);

        if (empty($linksToMark)) {
            return $this->returnFail(400, ['error' => 'Saldo insuficiente para este periodo']);
        }

        try {
            $this->processWithdrawalTransaction($user, $request->all(), $linksToMark);
            return $this->returnSuccess(200, ['message' => 'Retiro procesado correctamente']);
        } catch (Exception $e) {
            return $this->returnFail(500, $e->getMessage());
        }
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
                        ->whereNull('withdrawal_id')
                        ->sum('amount_to_client'),

            // 10% -> Solo pagos que tengan 7 días o más de antigüedad.
            // (Los de hoy no califican).
            '10'  => Link::where('user_id', $userId)
                        ->where('pay_status', 3)
                        ->whereNull('withdrawal_id')
                        ->where('created_at', '<=', $now->copy()->subDays(7))
                        ->sum('amount_to_client'),

            // 8% -> Solo pagos que tengan 14 días o más de antigüedad.
            // (Cambio aplicado: subDays(14)).
            '8'   => Link::where('user_id', $userId)
                        ->where('pay_status', 3)
                        ->whereNull('withdrawal_id')
                        ->where('created_at', '<=', $now->copy()->subDays(14))
                        ->sum('amount_to_client'),

            // 3.9% -> El resto de pagos muy antiguos (ejemplo: 30 días o más).
            '3.9' => Link::where('user_id', $userId)
                        ->where('pay_status', 3)
                        ->whereNull('withdrawal_id')
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
    private function getDateThresholdByType($type)
    {
        $dateThreshold = Carbon::now();

        if ($type == 2) {
            return $dateThreshold->subDays(7);
        } 
        if ($type == 3) {
            return $dateThreshold->subDays(14);
        } 
        if ($type == 4) {
            return $dateThreshold->subDays(30);
        }

        return $dateThreshold;
    }

    private function getAvailableLinks($userId, $dateThreshold, $type)
    {
        $query = Link::where('user_id', $userId)
            ->where('pay_status', 3)
            ->whereNull('withdrawal_id')
            ->orderBy('created_at', 'asc');

        if ($type != 1) {
            $query->where('created_at', '<=', $dateThreshold);
        }

        return $query->get();
    }

    private function getLinksToCoverAmount($availableLinks, $amountToWithdraw)
    {
        $accumulated = 0;
        $linksToMark = [];

        foreach ($availableLinks as $link) {
            if ($accumulated < $amountToWithdraw) {
                $accumulated += $link->amount_to_client;
                $linksToMark[] = $link->id;
            } else {
                break;
            }
        }

        if ($accumulated < $amountToWithdraw) {
            return [];
        }

        return $linksToMark;
    }

    private function processWithdrawalTransaction($user, $requestData, $linksToMark)
    {
        return DB::transaction(function () use ($user, $requestData, $linksToMark) {
            $withdrawal = Withdrawal::create([
                'user_id'          => $user->id,
                'amount'           => $requestData['amount'],
                'type'             => $requestData['type'],
                'status'           => 1, 
                'method'           => $requestData['method'] ?? 1,
                'comision_by_type' => $requestData['comision_by_type'],
                'comision_fixed'   => $requestData['comision_fixed'],
                'account_bank_id'  => $requestData['account'],
            ]);

            Link::whereIn('id', $linksToMark)->update(['withdrawal_id' => $withdrawal->id]);

            $wallet = Wallet::where('user_id', $user->id)->first();
            if ($wallet) {
                $wallet->decrement('balance', $requestData['amount']);
            }

            return $withdrawal;
        });
    }
}
