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
                height: 100vh; /* 100% of the viewport height */
            }
        </style>

    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Rowers') }}
        </h2>
    </x-slot>


    <div class="getZone">
        <div class="titleBox">
            <h1>{{ $rower->name }}</h1>
            <a href="{{route('activities')}}">
                <button type="button">
                    <i class="fas fa-arrow-left"></i>
                    Back to Rowers
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
        </div>

        <div id="detailsDiv">
            <i>created at {{ $rower->created_at }}</i>
            <br>
            <i>last modified on {{ $rower->updated_at }}</i>
            <br>
        </div>

        <div id="activitiesDiv" hidden>
            <table class="getTable">
                <tr>
                    <th>Role</th>
                </tr>
                @foreach($activities as $activity)
                    <tr>
                        <td>{{ $activity->title }}</td>
                    </tr>
                @endforeach
            </table>
        </div>
    </div>

    <script>
        function showDetails() {
            document.getElementById('detailsDiv').hidden = false;
            document.getElementById('activitiesDiv').hidden = true;
        }

        function showActivities() {
            document.getElementById('detailsDiv').hidden = true;
            document.getElementById('activitiesDiv').hidden = false;
        }
    </script>

</x-app-layout>
