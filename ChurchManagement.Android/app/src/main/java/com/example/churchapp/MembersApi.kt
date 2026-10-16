package com.example.churchapp

import android.content.Context
import retrofit2.Response
import retrofit2.http.GET

interface MembersApi {

    @GET("api/Members")
    suspend fun getMembers(): Response<List<Member>>
}

suspend fun fetchMembers(context: Context): Response<List<Member>> =
    ApiClient.getAuthenticatedClient(context)
        .create(MembersApi::class.java)
        .getMembers()