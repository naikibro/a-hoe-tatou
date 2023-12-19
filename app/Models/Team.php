<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $table = 'teams';

    // should be unique
    protected $primaryKey = 'name';
    protected $fillable = ['name', 'description', 'trainer'];

    public function trainers()
    {
        return $this->belongsToMany(Trainer::class, 'team_trainers', 'trainer_id', 'id');
    }

    public function users()
    {
        return $this->belongsToMany(Rower::class, 'team_rowers', 'rower_id', 'id');
    }
}
