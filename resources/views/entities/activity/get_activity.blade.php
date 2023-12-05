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
                    Back to Activities
                </button>
            </a>
        </div>

        <br>

        <div>
            <h3>Details</h3>
            <i>created at {{ $activity->created_at }}</i>
            <br>
            <i>last modified on {{ $activity->updated_at }}</i>
            <br>
            <br>
            <p>{{ json_decode($activity->description) }}</p>
        </div>

        <div>
            <h3>Participants</h3>
            <table>
                <tr>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                </tr>
                <tr>
                    <td>a</td>
                    <td>b</td>
                    <td>c</td>
                </tr>
            </table>
        </div>

    </div>


</x-app-layout>
