
package com.example.churchapp

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun MembersScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    var members by remember { mutableStateOf<List<Member>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf("") }

    suspend fun loadMembers() {
        isLoading = true
        errorMessage = ""

        try {
            val response = withContext(Dispatchers.IO) {
                fetchMembers(context)
            }

            if (response.isSuccessful) {
                members = response.body().orEmpty()
            } else {
                errorMessage = "Could not load members. HTTP ${response.code()}"
            }
        } catch (e: Exception) {
            errorMessage = "Unable to load members. Check your connection and try again."
        } finally {
            isLoading = false
        }
    }

    LaunchedEffect(Unit) {
        loadMembers()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Church Members",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        when {
            isLoading -> {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                )
            }

            errorMessage.isNotBlank() -> {
                Text(text = errorMessage)

                Button(onClick = {
                    // Reloading is handled in the next step if needed.
                }) {
                    Text("Retry")
                }
            }

            members.isEmpty() -> {
                Text("No members found.")
            }

            else -> {
                Text("Total members: ${members.size}")

                Spacer(modifier = Modifier.height(8.dp))

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(members, key = { it.memberId }) { member ->
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Text(
                                    text = "${member.firstName} ${member.lastName}",
                                    style = MaterialTheme.typography.titleMedium
                                )

                                Text(
                                    text = "Family: ${member.familyName ?: "Not assigned"}"
                                )

                                Text(
                                    text = "Status: ${member.membershipStatus}"
                                )

                                Text(text = "Email: ${member.email}")
                                Text(text = "Phone: ${member.phone}")
                            }
                        }
                    }
                }
            }
        }
    }
}