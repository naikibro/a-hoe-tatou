<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use function Termwind\render;

class RowerController extends Controller
{
    //
    public function index()
    {
        // get all the Rower informations
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

        return view('entities.rower.get_rower', [
            'rower' => $rower,
            'activities' => $actvities,
        ]);

    }

    public function create(){}
    public function processForm(){}
    public function edit(){}
    public function update(){}
    public function destroy(){}
    public function add_activity(){}
    public function become_trainer(){}
}
