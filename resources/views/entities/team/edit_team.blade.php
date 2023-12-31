<x-app-layout>

    <x-slot name="style">
        <link href="{{ asset('css/common.css') }}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

        <style>
            body > div {
                margin: 0;
                padding: 0;
                background-color:red;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                height: 100vh; /* 100% of the viewport height */
            }
        </style>

    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Edit teazm') }}
        </h2>

        <div class="arriane">
            <a href="{{ route('team') }}">Team</a>
            <p> > </p>
            <a href="{{ route('edit-team', ['id' => $team[0]->id]) }}">Edit Team</a>
        </div>
    </x-slot>

    <form class="editForm" method="POST" action="{{ route('update-team', ['id' => $team[0]->id]) }}">
        @csrf <!-- CSRF protection -->
        @method('PUT') <!-- Use PUT method for updating -->

        <div class="titleBox">
            <h1>Edit team</h1>
            <a href="{{route('team')}}">
                <button type="button">
                    <i class="fas fa-arrow-left"></i>
                    Back to teams
                </button>
            </a>
        </div>

        <label for='name'>Name</label>
        <br>
        <input type='text' name='name' required value='{{ $team[0]->name }}'>
        <br>

        <label for='description'>Description</label>
        <br>
        <textarea rows="4" name="description" required >{{ $team[0]->description }}</textarea><br>

        <br>
        <hr>
        <br>

        <button class="mx-auto" type="submit">Update activity</button>
    </form>

    <div class="editForm">
        <h2>Manage members of {{ $team[0]->name}}</h2>
            <table class="getTable">
                <tr>
                    <th colspan="2">Rowers</th>
                </tr>
                @foreach($members as $member)
                    <tr>
                        <td>{{ $member->name }}</td>
                        <td>
                            <form action="{{ route('team-delete-member', ['id' => $team[0]->id]) }}" method='POST' onsubmit="return confirm('Are you sure you want to remove this rower from the {{$team[0]->name}} ?')">
                                @csrf
                                @method('delete')
                                <button type="submit" class="editIconDelete text-white font-bold rounded">
                                    <i class="fas fa-trash"></i> delete
                                </button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </table>
    
        <form  name="editForm" id="editForm" action="{{ route('team-add-member', ['id' => $team[0]->id]) }}" method="POST">
            @csrf
            @method('PUT')
    
            
            <br>
            <label for="trainer">add a member</label>
            <select name="trainer">
                <option selected></option>
    
                @foreach($availableMembers as $availableMember)
                    <option value="{{ $availableMember->id }}">{{ $availableMember->name }}</option>
                @endforeach
            </select>
    
            <button form="editForm" type="submit"  class="mx-auto" type="submit">Add member</button>
        </form>
    
    </div>

</x-app-layout>
