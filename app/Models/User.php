<?php
// User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function trainer()
    {
        return $this->hasOne(Trainer::class, 'user_id', 'id');
    }

    public function rower()
    {
        return $this->hasOne(Rower::class, 'user_id', 'id');
    }

    public function getRole()
    {
        return $this->role;
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
