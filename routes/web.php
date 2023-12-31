<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RowerController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TrainerController;
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
Route::middleware('guest')->group(function () {
    Route::get('/welcome', function () {
        return view('welcome');
    })->name('welcome');

    Route::get('', function () {
        return view('welcome');
    })->name('welcome');

    Route::get('/login', function () {
        return view('auth.login');
    })->name('login');

    Route::get('/register', function () {
        return view('auth.register');
    })->name('register');

    Route::get('/about-data-protection', function () {
        return view('auth.about');
    })->name('about-data-protection');
});

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
    Route::get('/activity/{id}', [ActivityController::class, 'view'])->name('view-activity');
    Route::get('/trainers', [TrainerController::class, 'index'])->name('trainers');
    Route::get('/trainer', [TrainerController::class, 'index'])->name('trainer');
    Route::get('/rower', [RowerController::class, 'index'])->name('rower');
    Route::get('/rowers', [RowerController::class, 'index'])->name('rowers');
    Route::get('/rower/{id}', [RowerController::class, 'view'])->name('view-rower');
    Route::get('/team', [TeamController::class, 'index'])->name('team');
    Route::get('/team/{id}', [TeamController::class, 'view'])->name('view-team');


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

        Route::get('/send-mail', [MailController::class, 'welcomeMail']);
        Route::get('/send-mail/{id}', [MailController::class, 'welcomeMail']);

        Route::get('/activities', [ActivityController::class, 'index_admin'])->name('activities');
        Route::get('/activity', [ActivityController::class, 'index_admin'])->name('activity');
        Route::get('/new-activity', [ActivityController::class, 'create'])->name('new-activity');
        Route::post('/new-activity', [ActivityController::class, 'processForm']);
        Route::delete('/delete-activity/{id}', [ActivityController::class, 'destroy'])->name('delete-activity');
        Route::get('/edit-activity/{id}', [ActivityController::class, 'edit'])->name('edit-activity');
        Route::put('/edit-activity/{id}', [ActivityController::class, 'edit'])->name('edit-activity');
        Route::put('/update-activity/{id}', [ActivityController::class, 'update'])->name('update-activity');

        Route::get('/new-trainer', [TrainerController::class, 'create'])->name('new-trainer');
        Route::post('/new-trainer', [TrainerController::class, 'processForm'])->name('new-trainer');
        Route::get('/edit-trainer/{id}', [TrainerController::class, 'edit'])->name('edit-trainer');
        Route::put('/edit-trainer/{id}', [TrainerController::class, 'edit'])->name('edit-trainer');
        Route::put('/update-trainer/{id}', [TrainerController::class, 'update'])->name('update-trainer');
        Route::delete('/delete-trainer/{id}', [TrainerController::class, 'destroy'])->name('delete-trainer');
            Route::put('/trainer/add-activity/{id}', [TrainerController::class, 'addActivity'])->name('trainer-add-activity');

        Route::get('/new-rower', [RowerController::class, 'create'])->name('new-rower');
        Route::post('/new-rower', [RowerController::class, 'processForm'])->name('new-rower');
        Route::get('/edit-rower/{id}', [RowerController::class, 'edit'])->name('edit-rower');
        Route::put('/edit-rower/{id}', [RowerController::class, 'edit'])->name('edit-rower');
        Route::put('/update-rower/{id}', [RowerController::class, 'update'])->name('update-rower');
        Route::delete('/delete-rower/{id}', [RowerController::class, 'destroy'])->name('delete-rower');
        
            Route::put('/rower/add-activity/{id}', [RowerController::class, 'addActivity'])->name('rower-add-activity');

        Route::get('/team', [TeamController::class, 'index_admin'])->name('team');
        Route::get('/teams', [TeamController::class, 'index_admin'])->name('teams');

        Route::get('/new-team', [TeamController::class, 'create'])->name('new-team');
        Route::post('/new-team', [TeamController::class, 'processForm'])->name('new-team');
        Route::get('/edit-team/{id}', [TeamController::class, 'edit'])->name('edit-team');
        Route::put('/edit-team/{id}', [TeamController::class, 'edit'])->name('edit-team');
        Route::put('/update-team/{id}', [TeamController::class, 'update'])->name('update-team');
        Route::delete('/delete-team/{id}', [TeamController::class, 'destroy'])->name('delete-team');

            Route::put('/team/add-trainer/{id}', [TeamController::class, 'addTrainer'])->name('team-add-trainer');
            Route::put('/team/add-member/{id}', [TeamController::class, 'addMember'])->name('team-add-member');
            Route::delete('/team/delete-member/{id}', [TeamController::class, 'deleteMember'])->name('team-delete-member');

    });
});

require __DIR__.'/auth.php';
