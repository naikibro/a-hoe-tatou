<x-app-layout>

    <x-slot name="style">
        <link href="{{asset('css/common.css')}}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
            body > div{
                margin: 0;
                padding: 0;
                background-image: url("{{ asset('img/vaa.jpg') }}");
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                height: 100vh; /* 100% of the viewport height */
            }
        </style>
    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Create a new Trainer') }}
        </h2>

        <div class="arriane">
            <a href="{{route('trainers')}}">Trainers</a>
            <p> > </p>
            <a href="{{route('new-trainer')}}">New Trainer</a>
        </div>
    </x-slot>



    <form class="newForm" method="POST" action="">
        @csrf <!-- CSRF protection -->

        <div class="titleBox">
            <h1>Create a new Trainer</h1>
            <a href="{{route('trainers')}}">
                <button type="button">
                    <i class="fas fa-arrow-left"></i>
                    Back to Trainers
                </button>
            </a>
        </div>
        <br>

        <hr>
        <br>

        <select name="user_id">
            @foreach($trainers as $trainer)
                <option  value="{{$trainer['user_id']}}">{{$trainer['username']}}</option>
            @endforeach
        </select>

        <br>
        <br>
        <button class="mx-auto" type="submit">
            Create new Trainer
            <i class="far fa-plus-square"></i>
        </button>
    </form>
</x-app-layout>
