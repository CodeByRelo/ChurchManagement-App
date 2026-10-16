package com.example.churchapp

data class Member(
    val memberId: Int,
    val userId: Int?,
    val familyId: Int?,
    val familyName: String?,
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val dateOfBirth: String,
    val membershipStatus: String,
    val createdAt: String,
    val updatedAt: String
)