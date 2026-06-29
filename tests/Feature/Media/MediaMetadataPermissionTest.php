<?php

namespace Tests\Feature\Media;

use App\Models\Media;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MediaMetadataPermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::where('name', $roleName)->firstOrFail();
        return User::factory()->create(['role' => $roleName, 'role_id' => $role->id]);
    }

    private function media(int $userId): Media
    {
        return Media::create([
            'user_id'       => $userId,
            'original_name' => 'photo.webp',
            'file_name'     => 'photo.webp',
            'file_path'     => 'media/photo.webp',
            'mime_type'     => 'image/webp',
            'file_size'     => 1024,
            'license_type'  => 'internal',
            'edition'       => 'both',
        ]);
    }

    private function metadataPayload(): array
    {
        return [
            'alt_text_bn'  => 'বিকল্প টেক্সট',
            'caption_bn'   => 'ছবির ক্যাপশন',
            'license_type' => 'internal',
            'edition'      => 'both',
        ];
    }

    public function test_reporter_can_edit_metadata_of_own_media(): void
    {
        $reporter = $this->userWithRole('reporter');
        $media = $this->media($reporter->id);

        $this->actingAs($reporter)
            ->putJson(route('admin.media.update', ['media' => $media->id]), $this->metadataPayload())
            ->assertOk();

        $this->assertDatabaseHas('media', [
            'id'          => $media->id,
            'alt_text_bn' => 'বিকল্প টেক্সট',
            'caption_bn'  => 'ছবির ক্যাপশন',
        ]);
    }

    public function test_reporter_cannot_edit_metadata_of_others_media(): void
    {
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');
        $media    = $this->media($other->id);

        $this->actingAs($reporter)
            ->putJson(route('admin.media.update', ['media' => $media->id]), $this->metadataPayload())
            ->assertForbidden();

        $this->assertDatabaseMissing('media', ['id' => $media->id, 'alt_text_bn' => 'বিকল্প টেক্সট']);
    }

    public function test_editor_can_edit_metadata_of_any_media(): void
    {
        $owner  = $this->userWithRole('reporter');
        $editor = $this->userWithRole('section_editor'); // has media.edit
        $media  = $this->media($owner->id);

        $this->actingAs($editor)
            ->putJson(route('admin.media.update', ['media' => $media->id]), $this->metadataPayload())
            ->assertOk();
    }
}
