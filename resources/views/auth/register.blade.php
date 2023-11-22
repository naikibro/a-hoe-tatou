<!DOCTYPE html>
<html data-theme="dark" lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>A hoe tatou</title>
    <link rel="icon" type="image/png" href="{{ asset('img/ressources/icon.png') }}">

    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="{{asset('css/register.css')}}" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>
<body class="bg-cover bg-center flex items-center min-h-screen" style="background-image: url('{{ asset('img/vaa.jpg') }}')">

<nav>
</nav>

<a class="mt-4" href="{{ route('welcome') }}">
    <img alt="icon" src="{{ asset('img/ressources/icon.png') }}" class="logoImg">
</a>

<form method="POST" action="{{ route('register') }}" class="bg-white dark:bg-gray-800 p-8 rounded-md shadow-md max-w-md w-full mx-auto mt-4">
    @csrf

    <h2 class="mb-4">Create a new account</h2>
    <!-- Name -->
    <div class="mb-4">
        <x-input-label for="name" :value="__('Name')" />
        <x-text-input id="name" class="block mt-1 w-full placeholder-opacity-75 text-gray-700" type="text" name="name" :value="old('name')" required autofocus autocomplete="name" />
        <x-input-error :messages="$errors->get('name')" class="mt-2" />
    </div>

    <!-- Email Address -->
    <div class="mb-4">
        <x-input-label for="email" :value="__('Email')" />
        <x-text-input id="email" class="block mt-1 w-full placeholder-opacity-75 text-gray-700" type="email" name="email" :value="old('email')" required autocomplete="username" />
        <x-input-error :messages="$errors->get('email')" class="mt-2" />
    </div>

    <!-- Password -->
    <div class="mb-4">
        <x-input-label for="password" :value="__('Password')" />
        <x-text-input id="password" class="block mt-1 w-full placeholder-opacity-75 text-gray-700" type="password" name="password" required autocomplete="new-password" />
        <x-input-error :messages="$errors->get('password')" class="mt-2" />
    </div>

    <!-- Confirm Password -->
    <div class="mb-4">
        <x-input-label for="password_confirmation" :value="__('Confirm Password')" />
        <x-text-input id="password_confirmation" class="block mt-1 w-full placeholder-opacity-75 text-gray-700" type="password" name="password_confirmation" required autocomplete="new-password" />
        <x-input-error :messages="$errors->get('password_confirmation')" class="mt-2" />
    </div>


    <div class="flex items-center justify-between mt-4">
        <a class="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" href="{{ route('login') }}">
            {{ __('Already registered?') }}
        </a>

        <x-primary-button>
            {{ __('Register') }}
        </x-primary-button>
    </div>
</form>

</body>
</html>
