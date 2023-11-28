<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Mail;
use App\Mail\HelloWorldMail;

class MailController extends Controller
{
    public function sendHelloWorldEmail()
    {
        $destinationMail = "naikibro@gmail.com";
        Mail::to($destinationMail)->send(new HelloWorldMail());

        return 'Mail sent!';
    }
}
