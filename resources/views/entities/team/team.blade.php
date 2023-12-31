<x-app-layout>

    <x-slot name="style">
        <link href="{{ asset('css/common.css') }}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

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
            {{ __('Teams') }}
        </h2>
    </x-slot>

    <x-slot name="slot">

        @if(auth()->user() && ( auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') )

            <div class="flex justify-end mb-4">
                <a href="{{ route('new-team') }}" class="globalLinks text-white font-bold py-2 px-4 rounded">
                    Create new team
                </a>
            </div>
        @endif

        <div class="table-responsive">
            <table class="crudtable table">
                <thead>
                <tr>
                    <th>Team</th>
                    <th>description</th>
                    @if(auth()->user() && ( auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') )
                        <th>Actions</th>
                    @endif
                </tr>
                </thead>
                <tbody>

                @foreach($teams as $team)
                    <tr>
                        <td>{{ $team->name }}</td>
                        <td>
                            <button onclick="showDetailsModal('{{ $team->id }}', '{{ $team->name }}', '{{ json_encode($team->description) }}')" class="modalLinks">see details</button>
                        </td>

                        @if(auth()->user() && auth()->user()->getRole() === 'admin')

                            <td class="action-buttons">

                                <form action="{{ route('view-team', ['id' => $team->id]) }}" method="get">
                                    @csrf
                                    @method('get')
                                    <button type="submit" class="crudIconView  crudIcon text-white font-bold rounded">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </form>

                                <form action="{{ route('edit-team', ['id' => $team->id]) }}" method="post">
                                    @csrf
                                    @method('PUT')
                                    <button type="submit" class="crudIconEdit crudIcon text-white font-bold rounded">
                                        <i class="fas fa-edit"></i> edit
                                    </button>
                                </form>

                                <form action="{{ route('delete-team', $team->id) }}" method='post' onsubmit="return confirm('Are you sure you want to delete this Team ?')">
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
                </tbody>
            </table>
        </div>
            <!-- Modal HTML -->
            <div id="detailsModal" class="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 hidden">
                <div class="modal-container flex items-center justify-center h-screen">
                    <div class="modal-content bg-white shadow-md p-6 m-4 max-w-2xl">
                        <h2 id="modalActivityTitle" class="text-xl font-bold mb-4"></h2>
                        <p><span id="modalActivityDescription"></span></p>
                        <button onclick="closeDetailsModal()" class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Close</button>
                    </div>
                </div>
            </div>

            <script>
                function showDetailsModal(activityId, title, description) {

                    document.getElementById('modalActivityTitle').innerText = title;
                    document.getElementById('modalActivityDescription').innerText = JSON.parse(description);
                    document.getElementById('detailsModal').classList.remove('hidden');
                }

                function closeDetailsModal() {
                    document.getElementById('detailsModal').classList.add('hidden');
                }
            </script>
    </x-slot>




</x-app-layout>
