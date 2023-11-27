<x-app-layout>

    <x-slot name="style">
        <link href="{{asset('css/common.css')}}" rel="stylesheet">
    </x-slot>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('My activities') }}
        </h2>
    </x-slot>

    <x-slot name="slot">
        <div class="crudzone">
            <table class="crudtable">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Duration</th>
                </tr>
                </thead>
                <tbody>
                @foreach($activities as $activity)
                    <tr>
                        <td>{{ $activity->id }}</td>
                        <td>{{ $activity->title }}</td>
                        <td>{{ $activity->description }}</td>
                        <td>{{ $activity->type }}</td>
                        <td>{{ $activity->duration->format('H:i:s') }}</td>

                        <?php
                            // TODO : add crud actions for admin only
                            // TODO : add crud actions for trainers ( with proper restrictions )
                            // TODO : add inscriptions actions for Users
                        ?>

                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </x-slot>


</x-app-layout>
