<?php
// Trainer.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Trainer extends Model
{
    use HasFactory;

    protected $table = 'trainer';
    protected $primaryKey = 'trainer_id';
    protected $fillable = ['user_id', 'trainer_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function activities()
    {
        return $this->belongsToMany(Activity::class, 'activity_trainer', 'trainer_id', 'activity_id');
    }

    // ----- F U N C T I O N S -----
    public function linkToActivity($id)
    {
        $trainer = Trainer::find($id);

        if ($trainer) {
            $newActivityTrainer = DB::table('activity_trainer')->insert([
                'activity_id' => $id,
                'trainer_id' => $this->trainer_id,
            ]);

            if ($newActivityTrainer) {
                return redirect()->route('trainers')->with('success', 'Trainer linked to activity successfully.');
            } else {
                return redirect()->route('trainers')->with('error', 'Failed to link trainer to activity.');
            }
        }

        return redirect()->route('trainers')->with('error', 'Trainer not found');
    }
}
