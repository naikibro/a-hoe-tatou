<x-app-layout>

    <x-slot name="style">
        <link href="{{asset('css/common.css')}}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
            body > div{
                margin: 0;
                padding: 0;
                background-color: red;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                height: 100vh; /* 100% of the viewport height */
            }
        </style>
    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Create a new activity') }}
        </h2>

        <div class="arriane">
            <a href="{{route('activity')}}">Activity</a>
            <p> > </p>
            <a href="{{route('new-activity')}}">New Activity</a>
        </div>
    </x-slot>



    <form class="newForm" method="POST" action="">
        @csrf <!-- CSRF protection -->

        <div class="titleBox">
            <h1>Create a new Team</h1>
            <a href="{{route('team')}}">
                <button type="button">
                    <i class="fas fa-arrow-left"></i>
                    Back to teams
                </button>
            </a>
        </div>
        <br>

        <label for='name'>Name</label>
        <br>
        <input type='text' name='name' required>
        <br>

        <label for='description'>Description</label>
        <br>
        <textarea rows="4" name="description" required></textarea><br>
        <br>

        <label for='trainer'>Trainer</label>
        <br>
        <select name="trainer">
            <option>hello</option>
            <option>hello</option>
            <option>hello</option>
            <option>hello</option>
        </select>

        <hr>
        <button class="mx-auto" type="submit">
            Create new team
            <i class="far fa-plus-square"></i>
        </button>
    </form>
</x-app-layout>
