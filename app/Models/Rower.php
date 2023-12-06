<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rower extends Model
{
    use HasFactory;

    protected $table = 'rowers';

    protected $primaryKey = 'rower_id';

    protected $fillable = ['user_id', 'rower_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function activities()
    {
        return $this->belongsToMany(Activity::class, 'activity_rower', 'rower_id', 'activity_id');
    }
}
