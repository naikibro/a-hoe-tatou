<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About your data</title>
    <link rel="icon" type="image/png" href="{{ asset('img/ressources/icon.png') }}">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

    <style>
        .logoImg:hover{
            transform: scale(1.05);
            opacity: .8;

        }

    </style>

</head>

<body class="bg-gray-300">

<div class="bg-gray-900 text-white p-4 flex flex-col items-center justify-between">
    <a href="{{ route('welcome') }}" class="flex items-center cursor-pointer">
        <img alt="icon" src="{{ asset('img/ressources/icon.png') }}" class="logoImg w-16 h-16">
    </a>
    <header class="text-center mt-4 ml-2">
        <h1 class="text-3xl font-bold">About Us</h1>
    </header>
</div>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">Who We Are</h2>
    <p>
        Welcome to A hoe tatou, where we strive to provide a secure and enjoyable experience for our users.
    </p>
</section>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">Our Commitment to Privacy</h2>
    <p>
        At A hoe tatou, we are committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
    </p>
</section>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">What Information We Collect</h2>
    <p>
        We collect and process personal information that you provide voluntarily when using our services. This may include, but is not limited to, your name, email address, and any other information you choose to share.
    </p>
</section>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">How We Use Your Information</h2>
    <p>
        We use the information we collect to provide, maintain, and improve our services. Your data may be used for account creation, communication, and to enhance your overall experience with our platform.
    </p>
</section>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">Your Rights</h2>
    <p>
        Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, or erase your personal data. If you have any questions or concerns about your data, please contact us at
        <a href="mailto:ahoetatou.webmaster@gmail.com" class="text-blue-500">ahoetatou.webmaster@gmail.com</a>.
    </p>
</section>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">Security Measures</h2>
    <p>
        We take the security of your data seriously. We implement various security measures to protect your personal information from unauthorized access or disclosure.
    </p>
</section>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">Cookies</h2>
    <p>
        We use cookies to enhance your browsing experience. You can control cookies through your browser settings.
    </p>
</section>

<section class="mt-6 mx-4">
    <h2 class="text-xl font-bold mb-2">Changes to This Privacy Policy</h2>
    <p>
        We may update our Privacy Policy from time to time. Any changes will be posted on this page, and we encourage you to review this Privacy Policy periodically.
    </p>
</section>

<footer class="mt-6 mx-4 text-center">
    <b>
        Thank you for choosing A hoe tatou . <i class="fas fa-hand-holding-heart"></i>
    </b>
    <br>
    <p>    If you have any questions or concerns about our Privacy Policy, please contact us at <a href="mailto:ahoetatou.webmaster@gmail.com" class="text-blue-500">ahoetatou.webmaster@gmail.com</a>.
    </p>
</footer>

</body>

</html>
