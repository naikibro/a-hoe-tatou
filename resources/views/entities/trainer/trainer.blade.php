<x-app-layout>

    <x-slot name="style">
        <link href="{{ asset('css/common.css') }}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

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
            {{ __('Trainers') }}
        </h2>
    </x-slot>

    <x-slot name="slot">

        @if(auth()->user() && ( auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') )

            <div class="flex justify-end mb-4">
                <a href="{{ route('new-trainer') }}" class="globalLinks text-white font-bold py-2 px-4 rounded">
                    Create new trainer
                </a>
            </div>
        @endif

        <div class="table-responsive">
            <table class="crudtable table">
                <thead>
                <tr>
                    @foreach($fillableAttributes as $attribute)
                        @if(!in_array($attribute, ['id', 'created_at', 'updated_at']))
                            <th>{{ ucfirst($attribute) }}</th>
                        @endif
                    @endforeach

                    <th>Username</th>

                    @if(auth()->user() && ( auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') )
                        <th>Actions</th>
                    @endif
                </tr>
                </thead>
                <tbody>

                @forelse($trainers as $trainer)
                    <tr>
                        @foreach($fillableAttributes as $attribute)
                            @if(!in_array($attribute, ['id', 'created_at', 'updated_at']))
                                <td>{{ $trainer[$attribute] }}</td>
                            @endif
                        @endforeach

                        <td>{{ $trainer['username'] }}</td>

                        @if(auth()->user() && (auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer'))
                            <td class="action-buttons">
                                <form action="{{ route('edit-trainer', ['id' => $trainer['trainer_id']]) }}" method="post">
                                    @csrf
                                    @method('PUT')
                                    <button type="submit" class="crudIconEdit text-white font-bold py-2 px-4 rounded">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                </form>

                                <form action="{{ route('delete-trainer', $trainer['trainer_id']) }}" method="post" onsubmit="return confirm('Are you sure you want to delete this trainer?')">
                                    @csrf
                                    @method('delete')
                                    <button type="submit" class="crudIconDelete text-white font-bold py-2 px-4 rounded">
                                        <i class="fas fa-trash"></i> delete
                                    </button>
                                </form>
                            </td>
                        @endif
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ count($fillableAttributes) + (auth()->user() && (auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') ? 1 : 0) }}">No trainers found</td>
                    </tr>
                @endforelse


                </tbody>
            </table>
        </div>
    </x-slot>

</x-app-layout>
