<?php

namespace Database\Seeders;

use App\Models\Rower;
use App\Models\Team;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class  UserbaseDev extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Create an admin user using environment variables
        $adminEmail = env('ADMIN_EMAIL', 'admin@example.com');
        $adminPassword = env('ADMIN_PASSWORD', 'password');
        DB::table('users')->insert([
            'name' => 'Admin User',
            'email' => $adminEmail,
            'password' => Hash::make($adminPassword),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create 5 trainer users
        for ($i = 1; $i <= 5; $i++) {
            $user = User::create([
                'name' => $faker->name,
                'email' => "trainer{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'trainer',
            ]);

            Trainer::create(['user_id' => $user->id]);
        }

        // Create 14 default users
        for ($i = 1; $i <= 14; $i++) {
            DB::table('users')->insert([
                'name' => $faker->name,
                'email' => "user{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'rower',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Rower::create(['user_id' => $i]);
        }

        // Create 7 default activities
        $activity_titles = [
            'Réparation du Va\'a',
            'Observation des étoiles',
            'Balayer le rangement à gilets',
            'Ahima\'a du coeur',
            'Vente de gâteaux',
            'Nettoyage du littoral',
            'Replanter les coraux'
        ];

        $activity_descriptions = [
            'Le va\'a a besoin d\'un petit coup de neuf !',
            'Nous allons apprendre les noms et positions des étoiles du ciel Ma\'ohi',
            'Tout est dans le titre',
            'La Team organise un ahima\'a gratuit pour les quartiers du district',
            'Nous allons vendre des gateaux pour financer notre voyage à Molokai',
            'La plage a besoin de nous !',
            'Les coraux ont besoin de nous !',
        ];

        $defaultDuration = '01:00:00';

        $i = 0;
        foreach ($activity_titles as $activity_title)
        {
            DB::table('activity')->insert([
                'title' => $activity_title,
                'description' => json_encode($activity_descriptions[$i]),
                'type' => 'special',
                'duration' => $defaultDuration,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $i++;
        }

        // Link trainers to activities
        for($i = 1; $i < 4; $i++){
            for($j = 1; $j < 4; $j++) {
                DB::table('activity_trainer')->insert(['trainer_id' => $i, 'activity_id' => $j + $i]);
            }
        }

        // Link rowers to activities
        for($i = 1; $i < 4; $i++){
            for($j = 1; $j < 4; $j++) {
                DB::table('activity_rower')->insert(['rower_id' => $i, 'activity_id' => $j + $i + 1]);
            }
        }

        // create 5 teams
        for ($i = 1; $i <= 5; $i++) {
            $team = Team::create([
                'id' => $i,
                'name' => $faker->word . ' Team',
                'description' => $faker->sentence,
            ]);

            // Link 6 already existing rowers to each team
            $rowers = Rower::inRandomOrder()->limit(6)->get();
            foreach ($rowers as $rower)
            {
                DB::table('team_rowers')->insert([
                        'rower_id' => $rower['rower_id'],
                        'team_id' => $i,
                ]);
            }

            // Link 2 already existing trainers to each team
            $trainers = Trainer::inRandomOrder()->limit(2)->get();
            foreach ($trainers as $trainer)
            {
                DB::table('team_trainers')->insert([
                        'trainer_id' => $trainer['trainer_id'],
                        'team_id' => $i,
                ]);
            }
        }
    }
}
