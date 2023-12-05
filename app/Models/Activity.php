<?php

// app/Models/ActivityController.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Activity extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'activity';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['title', 'description', 'type', 'duration'];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'duration' => 'datetime:H:i:s',
    ];


    public function trainers(){
        return $this->belongsToMany(Trainer::class, 'activity_trainer', 'activity_id', 'trainer_id');
    }

    // ----- C R U D S -----

    public function assign_trainer($trainerId)
    {
        if (!$this->trainers()->where('trainer_id', $trainerId)->exists()) {
            // Attach the trainer to the activity
            $this->trainers()->attach($trainerId);
        }
    }

    // ----- M I S C - F U N C T I O N S -----

    public static function getPossibleEnumValues($tableName, $columnName)
    {
        $type = DB::select("SHOW COLUMNS FROM $tableName WHERE Field = '$columnName'")[0]->Type;

        preg_match('/^enum\((.*)\)$/', $type, $matches);

        $values = [];
        foreach (explode(',', $matches[1]) as $value) {
            $values[] = trim($value, "'");
        }

        return $values;
    }
}
