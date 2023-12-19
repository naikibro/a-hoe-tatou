<x-app-layout>

    <x-slot name="style">
        <link href="{{ asset('css/common.css') }}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

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
            {{ __('My activities') }}
        </h2>
    </x-slot>

    <x-slot name="slot">

        @if(auth()->user() && ( auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') )

        <div class="flex justify-end mb-4">
            <a href="{{ route('new-activity') }}" class="globalLinks text-white font-bold py-2 px-4 rounded">
                Create new activity
            </a>
        </div>
        @endif

        <div class="table-responsive">
            <table class="crudtable table">
                <thead>
                <tr>
                    @if($activities && $firstActivity = $activities->first())
                        @foreach($firstActivity->getAttributes() as $key => $value)
                            @if(!in_array($key, ['id', 'created_at', 'updated_at']))
                                <th>{{ ucfirst($key) }}</th>
                            @endif
                        @endforeach

                        @if(auth()->user() && ( auth()->user()->getRole() === 'admin' || auth()->user()->getRole() === 'trainer') )
                            <th>Actions</th>
                        @endif
                    @endif
                </tr>
                </thead>
                <tbody>
                @if($activities)
                    @foreach($activities as $activity)
                        <tr>
                            <td>{{ $activity->title }}</td>
                            <td>
                                <button onclick="showDetailsModal('{{ $activity->id }}', {{ json_encode($activity->title) }}, {{ json_encode($activity->description) }})" class="modalLinks">see details</button>
                            </td>
                            <td>{{ $activity->type }}</td>
                            <td>{{ $activity->duration->format('H:i:s') }}</td>
                            @if(auth()->user() && auth()->user()->getRole() === 'admin')

                                <td class="action-buttons">

                                    <form action="{{ route('view-activity', ['id' => $activity->id]) }}" method="get">
                                        @csrf
                                        @method('get')
                                        <button type="submit" class="crudIconView  crudIcon text-white font-bold rounded">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                    </form>

                                    <form action="{{ route('edit-activity', ['id' => $activity->id]) }}" method="post">
                                        @csrf
                                        @method('PUT')
                                        <button type="submit" class="crudIconEdit crudIcon text-white font-bold rounded">
                                            <i class="fas fa-edit"></i> edit
                                        </button>
                                    </form>

                                    <form action="{{ route('delete-activity', $activity->id) }}" method="post" onsubmit="return confirm('Are you sure you want to delete this activity?')">
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
                @endif
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
