<?php

namespace App\Http\Controllers;
use App\Mail\HelloWorldMail;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class MailController extends Controller
{
    public function sendHelloWorldEmail()
    {
        $destinationMail = "naikibro@gmail.com";
        Mail::to($destinationMail)->send(new HelloWorldMail());

        return 'Mail sent!';
    }

    public function sendMail($mail, $mailForm, $options = null)
    {
        Mail::to($mail)->send(new $mailForm($options));

    }

    public function welcomeMail($id, $mail = 'ahoetatou.webmaster@gmail.com')
    {
        if(isset($id))
        {
            $request = User::where('id', $id)->get()[0];
            $user = $request->getName();
            $mail = $request->getMail();
        }
        else{
            $user = User::where('email', $mail)->get()[0]->getName();
        }

        Mail::to($mail)->send(new WelcomeMail($user));

        return 'Mail sent!';

    }
}
