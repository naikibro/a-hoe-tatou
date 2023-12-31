<x-app-layout>

    <x-slot name="style">
        <link href="{{ asset('css/common.css') }}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

        <style>
            body > div{
                margin: 0;
                padding: 0;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-image: url("{{asset('img/team.jpg')}}");
                height: 100vh; /* 100% of the viewport height */
            }
        </style>

    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Teams') }}
        </h2>
    </x-slot>


    <div class="getZone">
        <div class="titleBox">
            <h1>{{ $team[0]->name }}</h1>
            <a href="{{route('teams')}}">
                <button type="button">
                    <i class="fas fa-arrow-left"></i>
                    Back to Teams
                </button>
            </a>
        </div>

        <br>
        <hr>
        <br>

        <div class="active-content-data">
            <a class="trigger-data" onclick="showDetails()">
                Show details
            </a>

            <a class="trigger-data" onclick="showActivities()">
                Activities
            </a>

            <a class="trigger-data" onclick="showTrainers()">
                Trainers
            </a>

            <a class="trigger-data" onclick="showRowers()">
                Rowers
            </a>
        </div>

        <div id="detailsDiv">
            <i>created at {{ $team[0]->created_at }}</i>
            <br>
            <i>last modified on {{ $team[0]->updated_at }}</i>
            <br>
            <br>
            <p>{{$team[0]->description}}
        </div>

        <div id="activitiesDiv" hidden>
            <table class="getTable">
                <tr>
                    <th>Activities</th>
                </tr>
                @foreach($activities as $activity)
                    <tr>
                        <td>{{ $activity->title }}</td>
                    </tr>
                @endforeach
            </table>
        </div>

        <div id="trainersDiv" hidden>
            <table class="getTable">
                <tr>
                    <th colspan="2">Trainers</th>
                </tr>
                @foreach($trainers as $trainer)
                    <tr>
                        <td>{{ $trainer->name }}</td>
                    </tr>
                @endforeach
            </table>
        </div>

        <div id="rowersDiv" hidden>
            <table class="getTable">
                <tr>
                    <th colspan="2">Rowers</th>
                </tr>
                @foreach($members as $member)
                    <tr>
                        <td>{{ $member->name }}</td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <script>
        function showDetails() {
            document.getElementById('detailsDiv').hidden = false;
            document.getElementById('activitiesDiv').hidden = true;
            document.getElementById('rowersDiv').hidden = true;
            document.getElementById('trainersDiv').hidden = true;
        }

        function showActivities() {
            document.getElementById('detailsDiv').hidden = true;
            document.getElementById('activitiesDiv').hidden = false;
            document.getElementById('rowersDiv').hidden = true;
            document.getElementById('trainersDiv').hidden = true;
        }

        function showRowers() {
            document.getElementById('detailsDiv').hidden = true;
            document.getElementById('activitiesDiv').hidden = true;
            document.getElementById('rowersDiv').hidden = false;
            document.getElementById('trainersDiv').hidden = true;
        }

        function showTrainers() {
            document.getElementById('detailsDiv').hidden = true;
            document.getElementById('activitiesDiv').hidden = true;
            document.getElementById('rowersDiv').hidden = true;
            document.getElementById('trainersDiv').hidden = false;
        }
    </script>

</x-app-layout>
