<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index()
    {
        $activities = Activity::all();
        $fillableAttributes = (new Activity())->getFillable();

        return view('entities.activity', ['activities' => $activities, 'fillableAttributes' => $fillableAttributes]);
    }
}
