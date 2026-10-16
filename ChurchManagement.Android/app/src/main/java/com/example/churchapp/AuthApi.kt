package com.example.churchapp

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresAt: String,
    val userId: Int,
    val username: String,
    val email: String,
    val role: String
)

interface AuthApi {
    @POST("api/Auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): LoginResponse
}


object ApiClient {
    private const val BASE_URL =
        "https://churchmanagementapi.azurewebsites.net/"

    @Volatile
    private var authenticatedClient: retrofit2.Retrofit? = null

    fun getAuthenticatedClient(context: android.content.Context): retrofit2.Retrofit {
        return authenticatedClient ?: synchronized(this) {
            authenticatedClient ?: run {
                val client = okhttp3.OkHttpClient.Builder()
                    .addInterceptor(AuthInterceptor(context.applicationContext))
                    .build()

                retrofit2.Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(
                        retrofit2.converter.gson.GsonConverterFactory.create()
                    )
                    .build()
                    .also { authenticatedClient = it }
            }
        }
    }

    val authApi: AuthApi by lazy {
        retrofit2.Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(
                retrofit2.converter.gson.GsonConverterFactory.create()
            )
            .build()
            .create(AuthApi::class.java)
    }
}