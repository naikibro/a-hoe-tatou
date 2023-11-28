<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// ----- G U E S T -----

Route::get('/welcome', function () {
    return view('welcome');
})->name('welcome');

Route::get('', function () {
    return view('welcome');
})->name('welcome');

Route::get('/login', function () {
    return view('auth.login');
})->middleware('guest')->name('login');

Route::get('/register', function () {
    return view('auth.register');
})->middleware('guest')->name('register');

Route::get('/about-data-protection', function () {
    return view('auth.about');
})->name('about-data-protection');

// ----- C O N N E C T E D - U S E R -----
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->middleware('verified')->name('dashboard');

    Route::get('', function () {
        return view('dashboard');
    })->name('lost');

    // Common dashboard links

    // Common Cruds
    Route::get('/activities', [ActivityController::class, 'index'])->name('activities');
    Route::get('/activity', [ActivityController::class, 'index'])->name('activity');



    // Profile CRUD
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User specific
    Route::middleware('role:user')->group(function (){
        Route::get('/u-activities', [ActivityController::class, 'index'])->name('u-activities');
        Route::get('/u-activity', [ActivityController::class, 'index'])->name('u-activity');

    });

    // Admin specific
    Route::middleware('role:admin')->group(function () {

        Route::get('/send-mail', [MailController::class, 'sendHelloWorldEmail']);

        Route::get('/activities', [ActivityController::class, 'index_admin'])->name('activities');
        Route::get('/activity', [ActivityController::class, 'index_admin'])->name('activity');

        Route::get('/new-activity', [ActivityController::class, 'create'])->name('new-activity');
        Route::post('/new-activity', [ActivityController::class, 'processForm']);
        Route::delete('/delete-activity/{id}', [ActivityController::class, 'destroy'])->name('delete-activity');

        Route::get('/edit-activity/{id}', [ActivityController::class, 'edit'])->name('edit-activity');
        Route::put('/edit-activity/{id}', [ActivityController::class, 'edit'])->name('edit-activity');
        Route::put('/update-activity/{id}', [ActivityController::class, 'update'])->name('update-activity');

    });
});

require __DIR__.'/auth.php';
