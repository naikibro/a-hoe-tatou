<x-app-layout>

    <x-slot name="style">
        <link href="{{asset('css/common.css')}}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
            body > div{
                margin: 0;
                padding: 0;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                height: 100vh; /* 100% of the viewport height */
            }
        </style>
    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Edit Rower') }}
        </h2>

        <div class="arriane">
            <a href="{{route('rowers')}}">Rowers</a>
            <p> > </p>
            <a href="{{route('edit-rower', ['id' => $rower['rower_id']])}}">Edit Rower</a>
        </div>
    </x-slot>

    <div class="container">
        <div class="editForm">


            <div class="titleBox">
                <h1>{{ $rowerInfos[0]->name }}</h1>
                <a href="{{route('rowers')}}">
                    <button type="button">
                        <i class="fas fa-arrow-left"></i>
                        Back to Trainers
                    </button>
                </a>
            </div>

            <br>
            <hr>
            <br>

            @if($activities)
                <br>
                <h1 class="mb-2">Activities</h1>
                <table class="getTable">
                    @foreach($activities as $activity)
                        <tr>
                            <td>{{ $activity->title }}</td>
                            <td><a href="{{route('view-activity', $activity->id)}}"><i class="fas fa-eye"></i> See</a></td>
                        </tr>
                    @endforeach
                </table>
            @endif

            <br>
            <form action="{{ route('rower-add-activity', ['id' => $rower['rower_id']]) }}" method="POST">
                @csrf
                @method('PUT')
                <label for="activityToAdd">Add activities</label>
                <select class="activitiesSelect" name="activity_id">

                    @if($availableActivities)
                        @foreach($availableActivities as $a)
                            <option value="{{$a->id}}">{{$a->title}}</option>
                        @endforeach
                    @endif
                </select>
                <button type="submit">Add <i class="fas fa-plus-circle"></i></button>
            </form>


            <br>
            <br>

        </div>
    </div>

    {{--TODO : add relations to activity, as collections--}}
</x-app-layout>
