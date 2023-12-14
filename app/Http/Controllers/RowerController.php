<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Rower;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use function Termwind\render;

class RowerController extends Controller
{
    //
    public function index()
    {
        $rowers = User::all();

        return view('entities.rower.rower', ['rowers' => $rowers]);
    }

    public function view($id){

        // get all user info of Rower with $id
        $rower = User::findOrfail($id);

        // get all relations of this rower

        // get all activities as rower
        $actvities = DB::table('activity_rower')
        ->where('rower_id', $id)
        ->join('activity', 'activity.id', '=', "activity_rower.activity_id")
        ->select('rower_id', 'activity_id', 'activity.title')
        ->get();

        // get all teams as rower
        $teams = DB::table('team_rowers')
        ->where('rower_id', $id)
        ->join('teams', 'teams.id', '=', "team_rowers.team_id")
        ->select('rower_id', 'team_rowers.team_id', 'teams.name', 'teams.description')
        ->get();

        return view('entities.rower.get_rower', [
            'rower' => $rower,
            'activities' => $actvities,
            'teams' => $teams,
        ]);
    }

    public function create(){}

    public function processForm(){}
    public function edit($id)
    {
        $rower = Rower::where('rower_id', $id)->first();

        if (!$rower) {
            abort(404); // or handle the case where the rower is not found
        }

        // get the user info of this rower
        $rowerInfos = DB::table('users')
            ->where('id', $rower->user_id)
            ->join('rowers', 'users.id', '=', 'rowers.user_id')
            ->select('users.id', 'users.name')
            ->distinct()
            ->get();

        // get the activities of this rower
        $activities = DB::table('activity_rower')
            ->where('rower_id', $id)
            ->join('activity', 'activity_rower.activity_id', '=', 'activity.id')
            ->select('activity.id', 'activity.title')
            ->get();

        // get all activities that are still available to this rower
        $availableActivities = DB::table('activity')
            ->leftJoin('activity_rower', function ($join) use ($id) {
                $join->on('activity.id', '=', 'activity_rower.activity_id')
                    ->where('activity_rower.rower_id', '=', $id);
            })
            ->whereNull('activity_rower.rower_id')
            ->select('activity.id', 'activity.title')
            ->get();

        // TODO : get all teams that are still available to this rower

        return view('entities.rower.edit_rower', [
            'rower' => $rower,
            'activities' => $activities,
            'rowerInfos' => $rowerInfos,
            'availableActivities' => $availableActivities,
        ]);
    }
    public function update(){}
    public function destroy(){}
    // ----- F U N C T I O N S -----
    public function addActivity($id, Request $request)
    {
        $rower = Rower::find($id);
        $activity = $request->input('activity_id');

        if (!$rower || !$activity) {
            abort(404); // or handle the case where the rower is not found
        }

        $newActivityTrainer = DB::table('activity_rower')->insert([
            'activity_id' => $activity,
            'rower_id' => $rower->rower_id,
        ]);

        if ($newActivityTrainer) {
            return redirect()->route('edit-rower', $rower->rower_id)->with('success', 'Activity added to rower successfully.');
        } else {
            return redirect()->route('edit-rower', $rower->rower_id)->with('error', 'Failed to add activity to rower.');
        }
    }
    public function become_trainer(){}
}
