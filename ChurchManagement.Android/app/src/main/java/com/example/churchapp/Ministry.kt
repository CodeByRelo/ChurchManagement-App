package com.example.churchapp

data class Ministry(
    val ministryId: Int,
    val name: String,
    val description: String,
    val leaderId: Int?,
    val leaderName: String?,
    val memberCount: Int,
    val createdAt: String?,
    val updatedAt: String?
)