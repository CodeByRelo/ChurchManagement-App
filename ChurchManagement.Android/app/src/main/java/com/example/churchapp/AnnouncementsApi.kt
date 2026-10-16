
package com.example.churchapp

import android.content.Context
import retrofit2.Response
import retrofit2.http.GET

interface AnnouncementsApi {
    @GET("api/Announcements/Published")
    suspend fun getAnnouncements(): Response<List<Announcement>>
}

suspend fun fetchAnnouncements(
    context: Context
): Response<List<Announcement>> {
    return ApiClient
        .getAuthenticatedClient(context)
        .create(AnnouncementsApi::class.java)
        .getAnnouncements()
}
