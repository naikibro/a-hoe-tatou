<!DOCTYPE html>
<html data-theme="dark" lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>A hoe tatou</title>

        <!-- Fonts -->
        <!-- Scripts -->
        <!-- Styles -->
        <style>

            body{
                background-color: #4a5568;
                background-image: url("{{asset('img/vaa.jpg')}}");
                background-size: cover;
                background-attachment: fixed; /* Keeps the image fixed while scrolling */
                background-repeat: no-repeat;
                background-position: center;
                width: 100%;
                height: 100vh; /* Makes the background cover the entire viewport height */
                margin: 0; /* Removes default margin */
                display: flex;
                flex-direction: column;
            }

            .logoImg{
                width: 30%;
                height: 30%;
            }

            nav{
                width: 100%;
                height:42px;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 10px;
                background-color: black;
            }
            .wrapper{
                display: flex;
                flex-direction: row-reverse;
                justify-content: center;
                align-items: center;
                padding: 20px;
                margin-top: 30px;
            }

            #heroBox{
                margin: auto;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            #logbox{

                min-width: 50%;
                max-width: 400px;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                padding-top: 100px ;
                padding-bottom: 100px ;
                background-color: rgba(0,0,0,.7);
                border-radius: 30px;
            }

            .b1{

                background-color: black;
                color: white;
                padding: 15px;
                border-radius: 20px;

            }


        </style>

        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link href="{{asset('common.css')}}" rel="stylesheet">

    </head>
    <body class="antialiased bg-emerald-300">

        <nav>
        </nav>

        <div class="wrapper">


            <div id="logbox">
                @if (Route::has('login'))
                    <div>
                        @auth
                            <a href="{{ url('/dashboard') }}">Dashboard</a>
                        @else
                            <a class="b1" href="{{ route('login') }}">Log in</a>
                            <br>
                            <br>
                            <br>
                            @if (Route::has('register'))
                                <a class="b1" href="{{ route('register') }}">Register</a>
                            @endif
                        @endauth
                    </div>
                @endif
            </div>

            <div id="heroBox">
                <img alt="icon" src="{{ asset('img/ressources/icon.png') }}" class="logoImg">
            </div>
        </div>

    @include('utils/footer');


    </body>
</html>
