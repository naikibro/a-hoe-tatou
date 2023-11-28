<x-app-layout>

    <x-slot name="style">
        <link href="{{ asset('css/common.css') }}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

        <style>
            body > div {
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
            {{ __('Edit activity') }}
        </h2>

        <div class="arriane">
            <a href="{{ route('activity') }}">Activity</a>
            <p> > </p>
            <a href="{{ route('edit-activity', ['id' => $activity->id]) }}">Edit Activity</a>
        </div>
    </x-slot>

    <form class="editForm" method="POST" action="{{ route('update-activity', ['id' => $activity->id]) }}">
        @csrf <!-- CSRF protection -->
        @method('PUT') <!-- Use PUT method for updating -->

        <div class="titleBox">
            <h1>Edit activity</h1>
            <a href="{{route('activity')}}">
                <button type="button">
                    <i class="fas fa-arrow-left"></i>
                    Back to activities
                </button>
            </a>
        </div>

        <label for="title">Title</label>
        <br>
        <input name="title" type="text" required value="{{ $activity->title }}">

        <br>

        <label for="description">Description</label><br>
        <textarea rows="4" name="description" required>{{ $activity->description }}</textarea><br>

        <br>

        <label for="type">Type</label><br>
        <select name="type" required>
            @foreach($activityTypes as $type)
                <option value="{{ $type }}" {{ $activity->type == $type ? 'selected' : '' }}>
                    {{ ucfirst($type) }}
                </option>
            @endforeach
        </select><br>

        <br>

        <label for="duration">Duration</label><br>
        <input name="duration" type="time" required value="{{ $activity->duration }}"><br>

        <br>
        <button class="mx-auto" type="submit">Update activity</button>
    </form>
</x-app-layout>
