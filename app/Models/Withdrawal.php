<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Withdrawal extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'amount',
        'type',
        'status',
        'method',
        'comision_by_type',
        'comision_fixed',
        'operation_id',
        'bank_id',
        'pay_date',
        'user_id',
        'withdrawal_id',
        'account_bank_id'
    ];
    protected $appends = ['status_label', 'method_label', 'comision_type_label'];

    public function getStatusLabelAttribute()
    {
        $status = [
            'Rechazada',
            'Pendiente',
            'Aprobada'
        ];
        return $status[$this->status];
    }
    public function getMethodLabelAttribute()
    {
        $payMethods = [
            'S/N',
            'Transferencia bancaria',
            'Pago en tarjeta',
            'Gift card',
            'Efectivo'
        ];
        return $payMethods[$this->method];
    }
    public function getComisionTypeLabelAttribute()
    {
        $typeComision = [
            '',
            15,
            10,
            8,
            3.9
        ];
        return $typeComision[$this->type];
    }

    public function accountBank()
    {
        return $this->belongsTo(AccountBank::class, 'account_bank_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
