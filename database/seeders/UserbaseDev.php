<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class UserbaseDev extends Seeder
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
            DB::table('users')->insert([
                'name' => $faker->name,
                'email' => "trainer{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'trainer',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create 14 default users
        for ($i = 1; $i <= 14; $i++) {
            DB::table('users')->insert([
                'name' => $faker->name,
                'email' => "user{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'user',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
