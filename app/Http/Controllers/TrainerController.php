<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrainerController extends Controller
{
    // ----- C R E A T E -----
    public function create()
    {
        $nonTrainerUsers = User::whereDoesntHave('trainer')->get();

        $trainersData = $nonTrainerUsers->map(function ($user) {
            return [
                'user_id' => $user->id,
                'username' => $user->name,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        return view('entities.trainer.new-trainer', ['trainers' => $trainersData]);
    }

    public function processForm(Request $request)
    {
        $user_id = $request->input('user_id');
        $newTrainer = Trainer::create([
            'user_id' => $user_id,
            'trainer_id',
        ]);

        return redirect()->route('trainers');
    }


    // ----- R E A D -----
    public function index()
    {
        // Eager load the related User data
        $trainers = Trainer::with('user')->get();
        $fillableAttributes = (new Trainer())->getFillable();

        // Transform the data for display in the Blade view
        $trainersData = $trainers->map(function ($trainer) {
            return [
                'trainer_id' => $trainer->trainer_id,
                'user_id' => $trainer->user->id,
                'username' => $trainer->user->name,  // get data from relationship with User
                'created_at' => $trainer->created_at,
                'updated_at' => $trainer->updated_at,
            ];
        });

        return view('entities.trainer.trainer', [
            'trainers' => $trainersData,
            'fillableAttributes' => $fillableAttributes,
        ]);
    }

    public function index_admin()
    {
        $trainers = Trainer::all();
        $fillableAttributes = (new Trainer())->getFillable();




        return view('entities.trainer.trainer', ['trainers' => $trainers, 'fillableAttributes' => $fillableAttributes]);
    }

    // ----- U P D A T E -----
    public function edit($id)
    {
        $trainer = Trainer::where('trainer_id', $id)->first();

        if (!$trainer) {
            abort(404); // or handle the case where the trainer is not found
        }

        // get the user info of this trainer
        $trainerInfos = DB::table('users')
            ->where('id', $trainer->user_id)
            ->join('trainer', 'users.id', '=', 'trainer.user_id')
            ->select('users.id', 'users.name')
            ->distinct()
            ->get();

        // get the activities of this trainer
        $activities = DB::table('activity_trainer')
            ->where('trainer_id', $id)
            ->join('activity', 'activity_trainer.activity_id', '=', 'activity.id')
            ->select('activity.id', 'activity.title')
            ->get();

        // get all activities that are still available to this trainer
        $availableActivities = DB::table('activity')
            ->leftJoin('activity_trainer', function ($join) use ($id) {
                $join->on('activity.id', '=', 'activity_trainer.activity_id')
                    ->where('activity_trainer.trainer_id', '=', $id);
            })
            ->whereNull('activity_trainer.trainer_id')
            ->select('activity.id', 'activity.title')
            ->get();

        return view('entities.trainer.edit-trainer', [
            'trainer' => $trainer,
            'activities' => $activities,
            'trainerInfos' => $trainerInfos,
            'availableActivities' => $availableActivities,
        ]);
    }


    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'trainer_id' => 'required',
            'user_id' => 'required',
            // Add other validation rules for your fields here
        ]);

        $trainer = Trainer::findOrFail($id);
        $trainer->update($validatedData);

        return redirect()->route('trainer')->with('success', 'Trainer updated successfully.');
    }




    // ----- D E L E T E -----
    public function destroy($id)
    {
        $trainer = Trainer::find($id);

        if ($trainer) {
            $user = User::find($trainer->user_id);
            if ($user) {
                $user->role = 'user';
                $user->save();
            }

            $trainer->delete();

            return redirect()->route('trainers')->with('success', 'Trainer deleted successfully');
        }

        return redirect()->route('trainers')->with('error', 'Trainer not found');
    }

    // ----- F U N C T I O N S -----
    public function addActivity($id, Request $request)
    {
        $trainer = Trainer::find($id);
        $activity = $request->input('activity_id');

        if (!$trainer || !$activity) {
            abort(404); // or handle the case where the trainer is not found
        }

        $newActivityTrainer = DB::table('activity_trainer')->insert([
            'activity_id' => $activity,
            'trainer_id' => $trainer->trainer_id,
        ]);

        if ($newActivityTrainer) {
            return redirect()->route('edit-trainer', $trainer->trainer_id)->with('success', 'Activity added to trainer successfully.');
        } else {
            return redirect()->route('edit-trainer', $trainer->trainer_id)->with('error', 'Failed to add activity to trainer.');
        }
    }

}
