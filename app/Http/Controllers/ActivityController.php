<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityController extends Controller
{

    // ----- C R E A T E -----

    public function create()
    {
        $activityTypes = Activity::getPossibleEnumValues('activity', 'type');

        return view('entities.activity.new_activity', ['activityTypes' => $activityTypes]);
    }

    public function processForm(Request $request)
    {
        $newActivity = new Activity();
        $newActivity->title = $request->input('title');
        $newActivity->description = $request->input('description');
        $newActivity->type = $request->input('type');
        $newActivity->duration = $request->input('duration');
        $newActivity->save();

        return redirect()->route('new-activity');
    }

    // ----- R E A D -----

    public function index()
    {
        $activities = Activity::all();
        $fillableAttributes = (new Activity())->getFillable();

        return view('entities.activity.activity', ['activities' => $activities, 'fillableAttributes' => $fillableAttributes]);
    }

    public function index_admin()
    {
        $activities = Activity::all();
        $fillableAttributes = (new Activity())->getFillable();

        return view('entities.activity.activity', ['activities' => $activities, 'fillableAttributes' => $fillableAttributes]);
    }

    // ----- U P D A T E -----
    public function edit($id)
    {
        $activity = Activity::findOrFail($id);
        $activityTypes = Activity::getPossibleEnumValues('activity', 'type'); // Assuming you have a method to get enum values

        return view('entities.activity.edit_activity', compact('activity', 'activityTypes'));
    }

    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $activityTypes = Activity::getPossibleEnumValues('activity', 'type');
        $typeRule = 'required|in:' . implode(',', $activityTypes);

        $validatedData = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'type' => $typeRule,
            'duration' => 'required|date_format:H:i',
        ]);

        $activity->update($validatedData);

        return redirect()->route('activity')->with('success', 'Activity updated successfully.');
    }

    // ----- D E L E T E -----
    public function destroy($id)
    {
        $activity = Activity::find($id);

        if ($activity) {
            $activity->delete();
            return redirect()->route('activity')->with('success', 'Activity deleted successfully');
        }

        return redirect()->route('activity')->with('error', 'Activity not found');
    }
}
