<?php

namespace App\Services;

use PragmaRX\Google2FA\Google2FA;

class TOTPService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
        // Set the window to 1. This allows a drift of ±1 interval (30 seconds before/after)
        // to account for clock skew on offline devices.
        $this->google2fa->setWindow(1);
    }

    /**
     * Generate a cryptographically secure RFC 6238 compliant base32 seed.
     */
    public function generateSeed(int $length = 32): string
    {
        return $this->google2fa->generateSecretKey($length);
    }

    /**
     * Generate the otpauth URI for rendering as a QR code.
     */
    public function generateOtpAuthUrl(string $company, string $holder, string $secret): string
    {
        return $this->google2fa->getQRCodeUrl(
            $company,
            $holder,
            $secret
        );
    }

    /**
     * Verify a given 6-digit TOTP code against the secret.
     */
    public function verify(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }
}
