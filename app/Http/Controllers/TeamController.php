<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    //
    public function index_admin()
    {
        $teams = DB::table('teams')
        ->select('id', 'name', 'description')
        ->get();

        return view('entities.team.team', ['teams' => $teams]);
    }


    public function view($id)
    {
        // get all the Team infos
        $team = Team::findOrFail($id);

        // get all the activities of the Team
        $actvities = DB::table('team_activities')
            ->where('team_id', $id)
            ->join('activity', 'activity.id', '=', "team_activities.activity_id")
            ->select('team_id', 'activity_id', 'activity.title')
            ->get();

        // get all the members of the Team
        $members = DB::table('team_rowers')
            ->where('team_id', $id)
            ->join('rowers', 'rowers.id', '=',  'team_rowers.rower_id')
            ->select('rower.name')
            ->get();

        return view('entities.team.get_team', [
            'team' => $team,
            'members' => $members,
            'activities' => $actvities,
        ]);
    }
}
