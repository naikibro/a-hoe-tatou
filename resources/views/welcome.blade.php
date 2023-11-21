<!DOCTYPE html>
<html data-theme="dark" lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>A hoe tatou</title>
        <link rel="icon" type="image/png" href="{{ asset('img/ressources/icon.png') }}">

        <style>
            body{
                background-image: url("{{asset('img/vaa.jpg')}}");
            }

            .application-logo{
                width: 32px;
                height: 32px;
            }
        </style>

        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link href="{{asset('common.css')}}" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">


    </head>
    <body>

        <nav>
        </nav>

        <div class="wrapper">
            <div id="logbox">
                @if (Route::has('login'))
                    <div>
                        @auth
                            <a href="{{ url('/dashboard') }}">Dashboard</a>
                        @else
                            @include('utils/auth-naked')
                            <br>
                            <hr>
                            <br>
                            @if (Route::has('register'))
                                <a class="inline-flex items-center px-4 py-2 bg-green-500 dark:bg-green-200 border border-transparent rounded-md font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-green-600 dark:hover:bg-white focus:bg-green-600 dark:focus:bg-white active:bg-green-700 dark:active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150 w-full mt-1 flex items-center justify-center" href="{{ route('register') }}">Register</a>
                            @endif
                        @endauth
                    </div>
                @endif
            </div>

            <div id="heroBox" class="mt-4 sm:mt-8 md:mt-12 lg:mt-16 xl:mt-20">
                <a href="#">
                    <img alt="icon" src="{{ asset('img/ressources/icon.png') }}" class="logoImg">
                </a>
            </div>
        </div>

    @include('utils/footer')


    </body>
</html>
