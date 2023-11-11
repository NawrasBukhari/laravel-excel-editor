<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Excel
 *
 * @method static \Illuminate\Database\Eloquent\Builder|Excel getContent()
 * @method static \Illuminate\Database\Eloquent\Builder|Excel newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Excel newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Excel query()
 * @mixin \Eloquent
 */
class Excel extends Model
{
    use HasFactory;

    protected $table = 'excel';

    protected $fillable = [
        'file_name',
        'sheets',
        'data_keys',
        'data_values',
    ];

    protected $casts = [
        'data_values' => 'object',
        'sheets' => 'object'
    ];

    public static function scopeGetContent($data_keys): Excel
    {
        return Excel::where('data_keys', $data_keys);
    }
}


