<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    // TODO: ----- C R E A T E -----
    public function create()
    {
        // TODO: add required select trainer
        return view('entities.team.new_team');
    }

    public function processForm(Request $request)
    {
        $newTeam = new Team();
        $newTeam->name = $request->input('name');
        $newTeam->description = $request->input('description');
        $newTeam->save();

        return redirect()->route('teams');
    }
    
    // ----- R E A D -----

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
        $team = DB::table('teams')
        ->where('id', $id)
        ->select('id', 'name', 'description', 'created_at', 'updated_at')
        ->get();

        // get all the activities of the Team
        $actvities = DB::table('team_activities')
            ->where('team_id', $id)
            ->join('activity', 'activity.id', '=', "team_activities.activity_id")
            ->select('team_id', 'activity_id', 'activity.title')
            ->get();

        // get all the members of the Team
        $members = DB::table('team_rowers')
            ->where('team_id', $id)
            ->join('rowers', 'rowers.rower_id', '=',  'team_rowers.rower_id')
            ->join('users', 'users.id', '=', 'rowers.user_id')
            ->select('users.name')
            ->get();

        $trainers = DB::table('team_trainers')
        ->where('team_id', $id)
        ->join("users", 'users.id', '=', 'team_trainers.id')
        ->select('users.name', 'users.id')
        ->get();

        return view('entities.team.get_team', [
            'team' => $team,
            'trainers' => $trainers,
            'members' => $members,
            'activities' => $actvities,
        ]);
    }

    // TODO: ----- U P D A T E -----
    public function edit($id)
    {
        $team = DB::table('teams')
        ->where('id', $id)
        ->select('id', 'name', 'description', 'created_at', 'updated_at')
        ->get();

        $trainers = DB::table('team_trainers')
        ->where('team_id', $id)
        ->join("users", 'users.id', '=', 'team_trainers.id')
        ->select('users.name', 'users.id')
        ->get();

        $members = DB::table('team_rowers')
        ->where('team_id', $id)
        ->join('rowers', 'rowers.rower_id', '=',  'team_rowers.rower_id')
        ->join('users', 'users.id', '=', 'rowers.user_id')
        ->select('users.name')
        ->get();

        $availableMembers = DB::table('users')
        ->leftJoin('team_rowers', function ($join) use ($id) {
            $join->on('users.id', '=', 'team_rowers.rower_id')
                ->where('team_rowers.team_id', '=', $id);
        })
        ->whereNull('team_rowers.rower_id')
        ->select('users.name', 'users.id')
        ->get();

       $actvities = DB::table('team_activities')
       ->where('team_id', $id)
       ->join('activity', 'activity.id', '=', "team_activities.activity_id")
       ->select('team_id', 'activity_id', 'activity.title')
       ->get();


        // TODO: add:
        // - adding trainers
        // - adding members
        // - adding activities
        // - adding trainings

        return view('entities.team.edit_team', [
            'team' => $team,
            'trainers' => $trainers,
            'members' => $members,
            'availableMembers' => $availableMembers,
            'activities' => $actvities,
        ]);
    }


    public function update(Request $request, $id)
    {
        $team = Team::where('id', $id);

        $validatedData = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
        ]);

        $team->update($validatedData);

        return redirect()->route('team')->with('success', 'Team updated successfully.');
    }
    
    // ----- D E L E T E -----

    public function destroy($id)
    {
        $team = Team::where('id', $id);
    
        if (!$team) {
            return redirect()->route('teams')->with('error', 'Team not found');
        }
    
        $team->delete();
    
        return redirect()->route('teams')->with('success', 'Team deleted successfully');
    }
    
    // ----- R E L A T I O N S -----

    public function addMember($id, Request $request) 
    {
        $team = DB::table('teams')
        ->where('id', $id)
        ->select('id')
        ->get();

        $memberId = $request->input('trainer');

        if( !$team || !$memberId) {
            abort(404);
        }

        // TODO: ensure that user is a rower, if not create rower
        $existingRower = DB::table('rowers')
        ->where('user_id', $memberId)
        ->first();
        
        if (!$existingRower) {
            $newRower = DB::table('rowers')->insert([
                'user_id' => $memberId,
                'rower_id' => $memberId,
            ]);    
        }
        
        $newTeamMember = DB::table('team_rowers')->insert([
            'team_id' => $team[0]->id,
            'rower_id' => intval($memberId),
        ]);

        if($newTeamMember) {
            return redirect()->route('edit-team', $team[0]->id)->with('success', 'Activity added to trainer successfully.');            
        } else {
            return redirect()->route('edit-team', $team[0]->id)->with('error', 'Failed to add activity to trainer.');          
        }
    }

    public function deleteMember($id)
    {    
        $memberToDelete = DB::table('team_rowers')
        ->where('rower_id', $id)
        ->select('rower_id', 'team_id')
        ->first();
    
        if (!$memberToDelete) {
            return redirect()->route('edit-team', $memberToDelete->team_id)->with('error', 'Team member not found');
        }
    
        DB::table('team_rowers')->where('id', $id)->delete();
    
        return redirect()->route('edit-team', $memberToDelete->team_id)->with('success', 'Team member removed successfully');
    }
    

}
