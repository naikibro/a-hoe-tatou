<x-app-layout>

    <x-slot name="style">
        <link href="{{asset('css/common.css')}}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
            body > div{
                margin: 0;
                padding: 0;
                background-image: url("{{ asset('img/activity.jpg') }}");
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                height: 100vh; /* 100% of the viewport height */
            }
        </style>
    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __( $activity->title ) }}
        </h2>

        <div class="arriane">
            <a href="{{route('activities')}}">Activities</a>
        </div>
    </x-slot>

    <div class="getZone">
        <div class="titleBox">
            <h1>{{ $activity->title }}</h1>
            <a href="{{route('activities')}}">
                <button type="button">
                    <i class="fas fa-arrow-left"></i>
                    Back to Trainers
                </button>
            </a>
        </div>

        <br>
        <hr>
        <br>

        {{-- TODO : when i click on trigger-data buttons, show one of the two divs hidden, then hide the other--}}
        <div class="active-content-data">
            <a class="trigger-data" onclick="showDetails()">
                Show details
            </a>
            <a class="trigger-data" onclick="showTrainers()">
                Participants
            </a>
        </div>

        <hr>
        <br>

        <div id="detailsDiv">
            <i>created at {{ $activity->created_at }}</i>
            <br>
            <i>last modified on {{ $activity->updated_at }}</i>
            <br>
            <br>
            <p>{{ json_decode($activity->description) }}</p>
        </div>

        <div id="trainersDiv" hidden>
            <table class="getTable">
                <tr>
                    <th>Participants</th>
                </tr>
                @foreach($trainers as $trainer)
                    <tr>
                        <td>{{ $trainer->name }}</td>
                    </tr>
                @endforeach
            </table>
        </div>

    </div>

    <script>
        function showDetails() {
            document.getElementById('detailsDiv').hidden = false;
            document.getElementById('trainersDiv').hidden = true;
        }

        function showTrainers() {
            document.getElementById('detailsDiv').hidden = true;
            document.getElementById('trainersDiv').hidden = false;
        }
    </script>


</x-app-layout>
