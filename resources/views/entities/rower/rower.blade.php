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

    <x-slot name="slot">

        <div class="table-responsive">
            <table class="crudtable table">

                @if($rowers && $firstRower = $rowers->first())
                    @foreach($firstRower->getAttributes() as $key => $value)
                        @if(!in_array($key, ['id', 'created_at', 'updated_at', 'email_verified_at', 'remember_token', 'password']))
                            <th>{{ ucfirst($key) }}</th>
                        @endif
                    @endforeach

                    @if(auth()->user() && ( auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') )
                        <th>Actions</th>
                    @endif
                @endif

                @foreach($rowers as $rower)
                    <tr>
                        <td>{{$rower->name}}</td>
                        <td><a href="mailto:{{$rower->email}}">{{$rower->email}}</a></td>
                        <td>{{$rower->role}}</td>

                        @if(auth()->user() && auth()->user()->getRole() === 'admin')

                            <td class="action-buttons">

                                <form action="{{ route('view-rower', ['id' => $rower->id]) }}" method="get">
                                    @csrf
                                    @method('get')
                                    <button type="submit" class="crudIconView  crudIcon text-white font-bold rounded">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </form>

                                <form action="{{ route('edit-rower', ['id' => $rower->id]) }}" method="post">
                                    @csrf
                                    @method('PUT')
                                    <button type="submit" class="crudIconEdit crudIcon text-white font-bold rounded">
                                        <i class="fas fa-edit"></i> edit
                                    </button>
                                </form>

                                <form action="{{ route('delete-rower', $rower->id) }}" method="post" onsubmit="return confirm('Are you sure you want to delete this Rower ?')">
                                    @csrf
                                    @method('delete')
                                    <button type="submit" class="crudIconDelete crudIcon text-white font-bold rounded">
                                        <i class="fas fa-trash"></i> delete
                                    </button>
                                </form>

                            </td>
                        @endif

                    </tr>


                @endforeach
            </table>
        </div>

    </x-slot>

</x-app-layout>

