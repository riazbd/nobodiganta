<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * All permissions grouped by group (mirrors frontend).
     */
    private const PERMISSIONS = [
        'news' => [
            'news.view', 'news.view.own', 'news.create', 'news.edit', 'news.edit.own',
            'news.delete', 'news.delete.own', 'news.submit', 'news.review',
            'news.approve', 'news.publish', 'news.schedule', 'news.archive',
            'news.update.published', 'news.breaking', 'news.correct',
            'news.template.use', 'news.template.create', 'news.live.create',
            'news.version.view', 'news.version.restore',
        ],
        'opinion' => [
            'opinion.view', 'opinion.create', 'opinion.edit', 'opinion.delete', 'opinion.publish',
        ],
        'video' => [
            'video.view', 'video.create', 'video.edit', 'video.delete',
        ],
        'workflow' => [
            'workflow.assign', 'workflow.pipeline.view', 'workflow.deadline.set',
            'workflow.pitch.create', 'workflow.pitch.approve', 'workflow.note.add',
            'workflow.checklist.configure', 'workflow.approve.own',
        ],
        'category' => [
            'category.view', 'category.create', 'category.edit',
            'category.delete', 'category.assign',
        ],
        'media' => [
            'media.view', 'media.upload', 'media.delete', 'media.edit',
            'media.gallery.manage', 'media.license.manage', 'media.bulk.upload',
        ],
        'reporter' => [
            'reporter.view', 'reporter.create', 'reporter.edit', 'reporter.delete',
        ],
        'comment' => [
            'comment.view', 'comment.approve', 'comment.reject', 'comment.reply',
        ],
        'user' => [
            'user.view', 'user.create', 'user.edit', 'user.delete', 'user.role.assign', 'user.role.manage',
        ],
        'analytics' => [
            'analytics.view', 'analytics.view.own', 'analytics.view.section',
            'analytics.export', 'analytics.behavioral.view', 'analytics.revenue.view',
        ],
        'seo' => [
            'seo.view', 'seo.edit', 'seo.audit',
        ],
        'social' => [
            'social.schedule', 'social.publish', 'social.analytics.view',
        ],
        'homepage' => [
            'homepage.edit', 'homepage.layout.edit', 'homepage.feature.manage', 'homepage.ab.test',
        ],
        'system' => [
            'system.settings', 'system.audit.view', 'system.backup',
            'system.maintenance', 'system.api.manage',
        ],
        'business' => [
            'business.ads.view', 'business.ads.manage', 'business.subscriptions.view',
            'business.subscriptions.manage', 'business.revenue.view',
        ],
        'email' => [
            'email.send', 'email.templates', 'newsletter.create', 'newsletter.send',
        ],
        'push' => [
            'push.send', 'push.schedule',
        ],
        'moderate' => [
            'moderate.comments', 'moderate.users',
        ],
        'epaper' => [
            'epaper.view', 'epaper.manage', 'epaper.publish',
        ],
        'api' => [
            'api.keys.view', 'api.keys.manage', 'webhooks.manage',
        ],
        'backup' => [
            'backup.create', 'backup.restore', 'maintenance.mode',
        ],
        'widgets' => [
            'widgets.stocks.manage', 'widgets.cricket.manage', 'widgets.prices.manage',
            'widgets.polls.manage', 'widgets.weather.manage', 'widgets.horoscope.manage',
            'widgets.prayer_times.manage',
        ],
    ];

    private const ROLE_PERMS = [
        'supreme_admin' => 'all',
        'super_admin' => 'all',

        'editor_in_chief' => [
            'news.view', 'news.create', 'news.edit', 'news.submit', 'news.review',
            'news.approve', 'news.publish', 'news.schedule', 'news.archive',
            'news.update.published', 'news.breaking', 'news.correct',
            'news.template.use', 'news.template.create', 'news.live.create', 'news.version.view', 'news.version.restore',
            'opinion.view', 'opinion.create', 'opinion.edit', 'opinion.delete', 'opinion.publish',
            'video.view', 'video.create', 'video.edit', 'video.delete',
            'workflow.assign', 'workflow.pipeline.view', 'workflow.deadline.set',
            'workflow.pitch.approve', 'workflow.note.add', 'workflow.checklist.configure', 'workflow.approve.own',
            'category.view', 'category.create', 'category.edit', 'category.delete', 'category.assign',
            'media.view', 'media.upload', 'media.delete', 'media.edit', 'media.gallery.manage', 'media.license.manage', 'media.bulk.upload',
            'reporter.view', 'reporter.create', 'reporter.edit', 'reporter.delete',
            'comment.view', 'comment.approve', 'comment.reject', 'comment.reply',
            'user.view', 'user.create', 'user.edit', 'user.delete', 'user.role.assign', 'user.role.manage',
            'analytics.view', 'analytics.export', 'analytics.behavioral.view', 'analytics.revenue.view',
            'seo.view', 'seo.edit', 'seo.audit',
            'social.schedule', 'social.publish', 'social.analytics.view',
            'homepage.edit', 'homepage.layout.edit', 'homepage.feature.manage', 'homepage.ab.test',
            'system.settings', 'system.audit.view',
            'business.ads.view', 'business.ads.manage', 'business.subscriptions.view', 'business.subscriptions.manage', 'business.revenue.view',
            'email.send', 'email.templates', 'newsletter.create', 'newsletter.send',
            'push.send', 'push.schedule',
            'moderate.comments', 'moderate.users',
            'epaper.view', 'epaper.manage', 'epaper.publish',
            'widgets.stocks.manage', 'widgets.cricket.manage', 'widgets.prices.manage',
            'widgets.polls.manage', 'widgets.weather.manage', 'widgets.horoscope.manage',
            'widgets.prayer_times.manage',
        ],

        'managing_editor' => [
            'news.view', 'news.create', 'news.edit', 'news.submit', 'news.review',
            'news.approve', 'news.publish', 'news.schedule', 'news.archive',
            'news.update.published', 'news.breaking', 'news.correct',
            'news.template.use', 'news.template.create', 'news.live.create', 'news.version.view', 'news.version.restore',
            'opinion.view', 'opinion.create', 'opinion.edit', 'opinion.delete', 'opinion.publish',
            'video.view', 'video.create', 'video.edit', 'video.delete',
            'workflow.assign', 'workflow.pipeline.view', 'workflow.deadline.set',
            'workflow.pitch.approve', 'workflow.note.add', 'workflow.checklist.configure', 'workflow.approve.own',
            'category.view', 'category.create', 'category.edit', 'category.assign',
            'media.view', 'media.upload', 'media.delete', 'media.edit', 'media.gallery.manage', 'media.license.manage', 'media.bulk.upload',
            'reporter.view', 'reporter.create', 'reporter.edit', 'reporter.delete',
            'comment.view', 'comment.approve', 'comment.reject', 'comment.reply',
            'user.view', 'user.edit', 'user.delete',
            'analytics.view', 'analytics.export', 'analytics.behavioral.view', 'analytics.revenue.view',
            'seo.view', 'seo.edit', 'seo.audit',
            'social.schedule', 'social.publish', 'social.analytics.view',
            'homepage.edit', 'homepage.layout.edit', 'homepage.feature.manage', 'homepage.ab.test',
            'system.settings',
            'business.ads.view', 'business.ads.manage', 'business.subscriptions.view', 'business.subscriptions.manage', 'business.revenue.view',
            'email.send', 'email.templates', 'newsletter.create', 'newsletter.send',
            'push.send', 'push.schedule',
            'moderate.comments', 'moderate.users',
            'epaper.view', 'epaper.manage', 'epaper.publish',
            'widgets.stocks.manage', 'widgets.cricket.manage', 'widgets.prices.manage',
            'widgets.polls.manage', 'widgets.weather.manage', 'widgets.horoscope.manage',
            'widgets.prayer_times.manage',
        ],

        'section_editor' => [
            'news.view', 'news.create', 'news.edit', 'news.submit', 'news.review',
            'news.approve', 'news.publish', 'news.schedule', 'news.template.use', 'news.template.create', 'news.live.create', 'news.version.view',
            'opinion.view', 'opinion.create', 'opinion.edit', 'opinion.publish',
            'video.view', 'video.create', 'video.edit',
            'workflow.assign', 'workflow.pipeline.view', 'workflow.deadline.set', 'workflow.note.add', 'workflow.approve.own',
            'category.view', 'category.assign',
            'media.view', 'media.upload', 'media.edit', 'media.gallery.manage', 'media.bulk.upload',
            'reporter.view',
            'comment.view', 'comment.approve', 'comment.reject', 'comment.reply',
            'analytics.view.section', 'analytics.view.own',
            'seo.view', 'seo.edit',
            'social.schedule', 'social.publish',
            'homepage.edit',
            'push.send', 'push.schedule',
            'widgets.stocks.manage', 'widgets.cricket.manage', 'widgets.prices.manage',
            'widgets.polls.manage', 'widgets.weather.manage', 'widgets.horoscope.manage',
            'widgets.prayer_times.manage',
        ],

        'reporter' => [
            'news.view', 'news.view.own', 'news.create', 'news.edit.own', 'news.delete.own', 'news.submit',
            'news.template.use', 'news.version.view',
            'opinion.view', 'opinion.create',
            'workflow.pitch.create', 'workflow.note.add',
            'media.view', 'media.upload',
            'comment.reply',
            'analytics.view.own',
        ],

        'photographer' => [
            'news.view', 'news.view.own',
            'media.view', 'media.upload', 'media.delete', 'media.edit',
            'media.gallery.manage', 'media.bulk.upload', 'media.license.manage',
            'analytics.view.own',
        ],

        'seo_manager' => [
            'news.view', 'news.version.view',
            'analytics.view', 'analytics.export', 'analytics.behavioral.view',
            'seo.view', 'seo.edit', 'seo.audit',
            'social.schedule', 'social.publish', 'social.analytics.view',
            'newsletter.create', 'newsletter.send',
        ],
    ];

    public function run(): void
    {
        // 1. Create all permissions
        $permMap = []; // name => Permission model
        foreach (self::PERMISSIONS as $group => $perms) {
            foreach ($perms as $name) {
                $permMap[$name] = Permission::firstOrCreate(
                    ['name' => $name],
                    ['group' => $group]
                );
            }
        }

        // 2. Create roles
        $roles = [
            ['name' => 'supreme_admin', 'label_en' => 'Supreme Admin', 'label_bn' => 'সুপ্রিম অ্যাডমিন', 'level' => 8],
            ['name' => 'super_admin', 'label_en' => 'Super Admin', 'label_bn' => 'সুপার অ্যাডমিন', 'level' => 7],
            ['name' => 'editor_in_chief', 'label_en' => 'Editor-in-Chief', 'label_bn' => 'প্রধান সম্পাদক', 'level' => 6],
            ['name' => 'managing_editor', 'label_en' => 'Managing Editor', 'label_bn' => 'ব্যবস্থাপনা সম্পাদক', 'level' => 5],
            ['name' => 'section_editor', 'label_en' => 'Section Editor', 'label_bn' => 'বিভাগীয় সম্পাদক', 'level' => 4],
            ['name' => 'seo_manager', 'label_en' => 'SEO Manager', 'label_bn' => 'এসইও ম্যানেজার', 'level' => 3],
            ['name' => 'photographer', 'label_en' => 'Photographer', 'label_bn' => 'ফটোগ্রাফার', 'level' => 2],
            ['name' => 'reporter', 'label_en' => 'Reporter', 'label_bn' => 'সাংবাদিক', 'level' => 1],
        ];

        foreach ($roles as $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );

            $perms = self::ROLE_PERMS[$roleData['name']] ?? [];

            if ($perms === 'all') {
                // Super admin gets all permissions
                $role->permissions()->sync(Permission::pluck('id')->toArray());
            } else {
                $permIds = collect($perms)
                    ->map(fn($p) => $permMap[$p]->id ?? null)
                    ->filter()
                    ->toArray();
                $role->permissions()->sync($permIds);
            }
        }

        // 3. Create or update the default super_admin user
        $superAdminRole = Role::where('name', 'super_admin')->first();

        $user = User::updateOrCreate(
            ['email' => 'admin@nobodigonto.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'role_id' => $superAdminRole?->id,
                'email_verified_at' => now(),
                'profile_photo_path' => null,
            ]
        );

        $supremeAdminRole = Role::where('name', 'supreme_admin')->first();

        User::updateOrCreate(
            ['email' => 'supreme@nobodigonto.com'],
            [
                'name' => 'Supreme Admin',
                'password' => Hash::make('password'),
                'role' => 'supreme_admin',
                'role_id' => $supremeAdminRole?->id,
                'email_verified_at' => now(),
                'profile_photo_path' => null,
            ]
        );

        // 4. Sync all existing users to their role records
        User::all()->each(function ($user) {
            if ($user->role) {
                $role = Role::where('name', $user->role)->first();
                if ($role && $user->role_id !== $role->id) {
                    $user->update(['role_id' => $role->id]);
                }
            }
        });
    }
}
