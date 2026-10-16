package com.example.churchapp

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SessionManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val preferences = EncryptedSharedPreferences.create(
        context,
        "church_secure_session",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveSession(
        accessToken: String,
        refreshToken: String,
        expiresAt: String
    ) {
        preferences.edit()
            .putString("access_token", accessToken)
            .putString("refresh_token", refreshToken)
            .putString("expires_at", expiresAt)
            .apply()
    }

    fun getAccessToken(): String? =
        preferences.getString("access_token", null)

    fun getRefreshToken(): String? =
        preferences.getString("refresh_token", null)

    fun getExpiresAt(): String? =
        preferences.getString("expires_at", null)

    fun clearSession() {
        preferences.edit().clear().apply()
    }
}