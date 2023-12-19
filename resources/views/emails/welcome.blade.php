<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to A Hoe Tatou App</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;

        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #1f2937;
            background-image: url("https://cdn.dribbble.com/users/737003/screenshots/2006131/media/4d2b522e5f03bc441861b1adcb76876d.gif");
            width: 800px; /* Set to 100% to make sure it spans the whole width */
            height: 600px; /* Set to 100vh for full viewport height */
            background-size: cover; /* Ensure the background image covers the entire body */
            background-position: center; /* Center the background image */
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 40px;

        }

        h1 {
            color: #4e4e52;
        }

        p, li, strong {
            color: #ffffff;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            color: #10bed8;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>Welcome to A Hoe Tatou App!</h1>
    <p>Dear {{$name}},</p>
    <p>We are thrilled to welcome you to A Hoe Tatou App, where the spirit of unity and teamwork thrives. Get ready to paddle together and experience the journey of a Polynesian va'a.</p>
    <p>Here are a few key terms to familiarize yourself with:</p>
    <ul>
        <li><strong>Hoe:</strong> To paddle</li>
        <li><strong>Ho'e:</strong> One, unified</li>
        <li><strong>Tahoe</strong> Team spirit</li>
    </ul>
    <p>Feel free to explore the app and join the crew for an amazing experience. If you have any questions or need assistance, don't hesitate to reach out.</p>
    <div class="footer">
        <p>A Hoe Tatou App Team</p>
    </div>
</div>
</body>
</html>

