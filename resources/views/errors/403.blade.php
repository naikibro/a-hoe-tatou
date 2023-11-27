<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/png" href="{{ asset('img/ressources/icon.png') }}">

    <title>Access forbidden</title>

    <style>
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            background: linear-gradient(to bottom, cyan, #00a5de);
            margin: 0;
            padding: 0;
        }

        .center {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        img {
            margin-bottom: 20px;
            border: #f7d78a 4px solid;
            border-radius: 20px;
            max-width: 100%;
            height: auto;
        }

        .error-info {
            text-align: center;
        }

        /* Style for the link with contrasting text and background */
        .contrast-link {
            color: rgb(86, 72, 66);
            background-color: rgb(245, 213, 137);
            padding: 8px 12px;
            text-decoration: none;
            display: inline-block;
            border-radius: 4px;
            margin-top: 10px;
            transition: background-color 0.3s, color 0.3s;
        }

        .contrast-link:hover {
            background-color: rgb(96, 165, 59);
            color: rgb(245, 213, 137);
        }
    </style>
</head>

<body class="antialiased">
<div class="center">
    <img src="{{ asset('img/404.gif') }}" alt="404 Image">

    <div class="error-info">
        <div>
            <h1>Error 403</h1>
            <p style="color:#564842;">You should not stay here too long <b>( shark spotted )...</b></p>
            <a class="contrast-link" href="{{ url('/') }}">Go to Landing Page</a>
        </div>
    </div>
</div>
</body>

</html>
