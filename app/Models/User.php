<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'locale',
        'avatar_url',
        'is_verified',
        'is_active',
        'strike_history',
        'password',
        'date_of_birth',
        'gender',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'strike_history' => 'array',
        'date_of_birth' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function companionProfile()
    {
        return $this->hasOne(CompanionProfile::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    /**
     * Increments the user's strike count and logs the flagged words.
     * If strikes reach 3, the user is deactivated and tokens are revoked (JWT invalidation).
     */
    public function incrementStrike(array $flaggedWords, string $context = 'chat'): void
    {
        $history = $this->strike_history ?? [];
        $history[] = [
            'words' => $flaggedWords,
            'context' => $context,
            'timestamp' => now()->toIso8601String()
        ];
        
        $this->strike_history = $history;
        $this->save();

        if (count($history) >= 3) {
            $this->is_active = false;
            $this->save();
            // Invalidate all Sanctum tokens to simulate immediate JWT invalidation
            $this->tokens()->delete();
        }
    }

    public function payoutRequests()
    {
        return $this->hasMany(PayoutRequest::class);
    }

    public function kycVerifications()
    {
        return $this->hasMany(KycVerification::class);
    }

    public function companionServiceAreas()
    {
        return $this->hasMany(CompanionServiceArea::class, 'companion_id');
    }

    public function companionSchedules()
    {
        return $this->hasMany(CompanionSchedule::class, 'companion_id');
    }

    public function companionCalendarBlocks()
    {
        return $this->hasMany(CompanionCalendarBlock::class, 'companion_id');
    }
}
