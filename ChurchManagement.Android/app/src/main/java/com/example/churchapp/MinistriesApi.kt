
package com.example.churchapp

import android.content.Context
import retrofit2.Response
import retrofit2.http.GET

interface MinistriesApi {
    @GET("api/Ministries")
    suspend fun getMinistries(): Response<List<Ministry>>
}

suspend fun fetchMinistries(
    context: Context
): Response<List<Ministry>> {
    return ApiClient
        .getAuthenticatedClient(context)
        .create(MinistriesApi::class.java)
        .getMinistries()
}
