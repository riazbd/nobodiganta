<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $staffRoles = ['reporter', 'section_editor', 'photographer', 'seo_manager'];
        $readerRole = 'user'; // General reader role

        // Ensure 'user' role exists if not already in RolePermissionSeeder
        $userRoleModel = Role::firstOrCreate(
            ['name' => 'user'],
            ['label_en' => 'Reader', 'label_bn' => 'পাঠক', 'level' => 0]
        );

        // Seed 10 Staff members
        for ($i = 1; $i <= 10; $i++) {
            $roleName = $staffRoles[array_rand($staffRoles)];
            $role = Role::where('name', $roleName)->first();
            
            User::create([
                'name' => 'Staff Member ' . $i,
                'email' => 'staff' . $i . '@provati.com',
                'password' => Hash::make('password'),
                'role' => $roleName,
                'role_id' => $role?->id,
                'email_verified_at' => now(),
            ]);
        }

        // Seed 20 General Readers
        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'name' => 'Reader User ' . $i,
                'email' => 'reader' . $i . '@example.com',
                'password' => Hash::make('password'),
                'role' => $readerRole,
                'role_id' => $userRoleModel->id,
                'email_verified_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        $this->command->info('Created 10 staff and 20 reader users.');
    }
}
