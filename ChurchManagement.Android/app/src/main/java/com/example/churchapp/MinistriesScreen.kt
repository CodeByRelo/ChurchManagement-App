
package com.example.churchapp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun MinistriesScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var ministries by remember {
        mutableStateOf<List<Ministry>>(emptyList())
    }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val response = fetchMinistries(context)

                if (response.isSuccessful) {
                    ministries = response.body() ?: emptyList()
                    errorMessage = null
                } else {
                    errorMessage =
                        "Could not load ministries. Error: ${response.code()}"
                }
            } catch (e: Exception) {
                errorMessage = "Could not connect to the server."
            } finally {
                isLoading = false
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Our Ministries",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        when {
            isLoading -> CircularProgressIndicator()

            errorMessage != null -> Text(
                text = errorMessage!!,
                color = MaterialTheme.colorScheme.error
            )

            ministries.isEmpty() -> Text("No ministries available.")

            else -> LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(
                    items = ministries,
                    key = { it.ministryId }
                ) { ministry ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(
                            defaultElevation = 4.dp
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = ministry.name,
                                style = MaterialTheme.typography.titleLarge,
                                color = MaterialTheme.colorScheme.primary
                            )

                            Spacer(modifier = Modifier.height(8.dp))

                            Text(text = ministry.description)

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = "Leader: ${ministry.leaderName ?: "Not assigned"}",
                                style = MaterialTheme.typography.bodyMedium
                            )

                            Text(
                                text = "Members: ${ministry.memberCount}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
            }
        }
    }
}
