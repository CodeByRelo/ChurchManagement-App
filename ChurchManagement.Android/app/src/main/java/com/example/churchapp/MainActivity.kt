package com.example.churchapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.churchapp.ui.theme.ChurchAppTheme
import androidx.compose.foundation.clickable
import android.content.Intent
import android.net.Uri
import androidx.compose.ui.platform.LocalContext
import androidx.compose.material3.OutlinedTextField
import androidx.compose.runtime.mutableStateOf
import androidx.compose.material3.Button
import android.content.Context
import androidx.compose.material.icons.filled.Campaign
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import android.util.Log
import androidx.compose.material.icons.filled.GroupWork
import kotlinx.coroutines.withContext
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.material.icons.filled.Groups

val Context.profileDataStore by preferencesDataStore(
    name = "profile_preferences"
)

val PROFILE_NAME = stringPreferencesKey("profile_name")
val PROFILE_EMAIL = stringPreferencesKey("profile_email")
val PROFILE_PHONE = stringPreferencesKey("profile_phone")

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            ChurchAppTheme {
                ChurchApp()
            }
        }
    }
}

@Composable
fun ChurchApp() {

    var loggedIn by remember {
        mutableStateOf(false)
    }

    var authScreen by remember {
        mutableStateOf("login")
    }

    if (!loggedIn) {
        when (authScreen) {
            "signup" -> SignUpScreen(
                onBackToLogin = {
                    authScreen = "login"
                }
            )

            "forgot" -> ForgotPasswordScreen(
                onBackToLogin = {
                    authScreen = "login"
                }
            )

            else -> LoginScreen(
                onLogin = {
                    loggedIn = true
                },
                onSignUp = {
                    authScreen = "signup"
                },
                onForgotPassword = {
                    authScreen = "forgot"
                }
            )
        }
    } else {

        var selectedItem by remember {
            mutableIntStateOf(0)
        }

        val navigationItems = listOf(
            "Home", "Sermons",
            "Events", "Announcements", "Prayer",
            "Ministries", "Profile"
        )
        val navigationIcons = listOf(
            Icons.Default.Home,
            Icons.Default.MenuBook,
            Icons.Default.CalendarMonth,
            Icons.Default.Campaign,
            Icons.Default.VolunteerActivism,
            Icons.Default.GroupWork,
            Icons.Default.Person

        )

        Scaffold(
            bottomBar = {

                NavigationBar {

                    navigationItems.forEachIndexed { index, item ->

                        NavigationBarItem(
                            selected = selectedItem == index,

                            onClick = {
                                selectedItem = index
                            },

                            icon = {
                                Icon(
                                    imageVector = navigationIcons[index],
                                    contentDescription = item
                                )
                            },

                            label = {
                                Text(item)
                            }
                        )
                    }
                }
            }
        ) { innerPadding ->

            when (selectedItem) {
                0 -> HomeScreen(
                    modifier = Modifier.padding(innerPadding)
                )
                1-> SermonsScreen(
                    modifier = Modifier.padding(innerPadding)
                )
                2 -> EventsScreen(
                    modifier = Modifier.padding(innerPadding)
                )
                3 -> AnnouncementsScreen(
                    modifier = Modifier.padding(innerPadding)
                )
                4 -> PrayerScreen(
                    modifier = Modifier.padding(innerPadding)
                )
                5 -> MinistriesScreen(
                    modifier = Modifier.padding(innerPadding)
                )
                6-> ProfileScreen(
                    modifier = Modifier.padding(innerPadding)
                )
            }
        }
    }
}

@Composable
fun HomeScreen(
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(20.dp),

        verticalArrangement = Arrangement.Top
    ) {

        Text(
            text = "Jesus Is Able Ministries",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(8.dp)
        )

        Text(
            text = "Welcome 👋",
            fontSize = 20.sp
        )

        Text(
            text = "We're glad you're here.",
            fontSize = 16.sp
        )

        val context = LocalContext.current
        val scope = rememberCoroutineScope()

        Button(
            onClick = {
                scope.launch {
                    testMembersApi(context)
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {

        }

        Spacer(
            modifier = Modifier.height(24.dp)
        )

        Text(
            text = "Latest Sermon",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(10.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),

            shape = RoundedCornerShape(16.dp)
        ) {

            Column(
                modifier = Modifier.padding(20.dp)
            ) {

                Text(
                    text = "Walking By Faith",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(
                    modifier = Modifier.height(6.dp)
                )

                Text(
                    text = "Sunday Service"
                )

                Spacer(
                    modifier = Modifier.height(16.dp)
                )

                Text(
                    text = "▶  Watch Sermon",
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Spacer(
            modifier = Modifier.height(24.dp)
        )

        Text(
            text = "Upcoming Event",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(10.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),

            shape = RoundedCornerShape(16.dp)
        ) {

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),

                verticalAlignment = Alignment.CenterVertically
            ) {

                Column(
                    modifier = Modifier.weight(1f)
                ) {

                    Text(
                        text = "Sunday Service",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = "Sunday • 10:00 AM"
                    )
                }

                Text(
                    text = "📅",
                    fontSize = 28.sp
                )
            }
        }
    }
}

@Composable
fun SimpleScreen(
    title: String,
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier.fillMaxSize(),

        horizontalAlignment = Alignment.CenterHorizontally,

        verticalArrangement = Arrangement.Center
    ) {

        Text(
            text = title,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun SermonsScreen(
    modifier : Modifier = Modifier
) {
    val context = LocalContext.current

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(20.dp),

        verticalArrangement = Arrangement.Top
    ) {

        Text(
            text = "Sermons",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        Text(
            text = "Latest Sermons",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {

            Column(
                modifier = Modifier.padding(20.dp)
            ) {

                Text(
                    text = "Walking By Faith",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(
                    modifier = Modifier.height(6.dp)
                )

                Text(
                    text = "Sunday Service"
                )

                Spacer(
                    modifier = Modifier.height(6.dp)
                )

                Text(
                    text = "Pastor • Jesus Is Able Ministries"
                )

                Spacer(
                    modifier = Modifier.height(16.dp)
                )

                Text(
                    text = "▶  Watch Sermon",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.clickable {
                        val intent = Intent(
                            Intent.ACTION_VIEW,
                            Uri.parse("https://www.youtube.com/")
                        )
                        context.startActivity(intent)
                    }
                )
            }
        }
    }
}
@Composable
fun EventsScreen(
    modifier: Modifier = Modifier
) {

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(20.dp),

        verticalArrangement = Arrangement.Top
    ) {

        Text(
            text = "Events",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        Text(
            text = "Upcoming Events",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {

            Column(
                modifier = Modifier.padding(20.dp)
            ) {

                Text(
                    text = "Sunday Service",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(
                    modifier = Modifier.height(6.dp)
                )

                Text(
                    text = "Sunday • 10:00 AM"
                )

                Spacer(
                    modifier = Modifier.height(6.dp)
                )

                Text(
                    text = "Jesus Is Able Ministries"
                )
            }
        }
    }
}

@Composable
fun PrayerScreen(
    modifier: Modifier = Modifier
) {
    var prayerRequest by remember {
        mutableStateOf("")
    }
    var submitted by remember {
        mutableStateOf(false)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(20.dp),

        verticalArrangement = Arrangement.Top
    ) {

        Text(
            text = "Prayer",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(12.dp)
        )

        Text(
            text = "How can we pray for you?",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(16.dp)
        )

        Text(
            text = "Submit your prayer request and our church family will pray with you."
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {

            Column(
                modifier = Modifier.padding(20.dp)
            ) {

                Text(
                    text = "Prayer Request",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(
                    modifier = Modifier.height(12.dp)
                )

                OutlinedTextField(
                    value = prayerRequest,
                    onValueChange = {
                        prayerRequest = it
                    },
                    modifier = Modifier.fillMaxWidth(),
                    label = {
                        Text("Prayer request")
                    },
                    placeholder = {
                        Text("Write your prayer request...")
                    },
                    minLines = 5
                )

                Spacer(
                    modifier = Modifier.height(16.dp)
                )
                Button(
                    onClick = {
                        if (prayerRequest.isNotBlank()) {
                            submitted = true
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Submit Prayer Request")
                }

                if (submitted) {

                    Spacer(
                        modifier = Modifier.height(12.dp)
                    )

                    Text(
                        text = "Your prayer request has been submitted. 🙏",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}
@Composable
fun ProfileScreen(
    modifier: Modifier = Modifier
) {
    var editing by remember {
        mutableStateOf(false)
    }

    var name by remember {
        mutableStateOf("Guest Member")
    }

    var email by remember {
        mutableStateOf("guest@example.com")
    }

    var phone by remember {
        mutableStateOf("")

    }

    val context = LocalContext.current

    LaunchedEffect(Unit) {

        val preferences = context.profileDataStore.data.first()

        name = preferences[PROFILE_NAME] ?: "Guest Member"
        email = preferences[PROFILE_EMAIL] ?: "guest@example.com"
        phone = preferences[PROFILE_PHONE] ?: ""
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(20.dp),

        verticalArrangement = Arrangement.Top
    ) {

        Text(
            text = "Profile",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(
            modifier = Modifier.height(20.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        ) {

            Column(
                modifier = Modifier.padding(20.dp)
            ) {

                Text(
                    text = "Jesus Is Able Ministries",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(
                    modifier = Modifier.height(8.dp)
                )

                if (editing) {

                    OutlinedTextField(
                        value = name,
                        onValueChange = {
                            name = it
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = {
                            Text("Name")
                        }
                    )

                    Spacer(
                        modifier = Modifier.height(12.dp)
                    )

                    OutlinedTextField(
                        value = email,
                        onValueChange = {
                            email = it
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = {
                            Text("Email")
                        }
                    )

                    Spacer(
                        modifier = Modifier.height(12.dp)
                    )

                    OutlinedTextField(
                        value = phone,
                        onValueChange = {
                            phone = it
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = {
                            Text("Phone")
                        }
                    )

                    Spacer(
                        modifier = Modifier.height(16.dp)
                    )

                    Button(
                        onClick = {

                            CoroutineScope(Dispatchers.IO).launch {

                                context.profileDataStore.edit { preferences ->
                                    preferences[PROFILE_NAME] = name
                                    preferences[PROFILE_EMAIL] = email
                                    preferences[PROFILE_PHONE] = phone
                                }
                            }

                            editing = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Save Profile")
                    }

                    Button(
                        onClick = {
                            editing = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Cancel")
                    }

                    Spacer(
                        modifier = Modifier.height(16.dp)
                    )
                }

                Text(
                    text = "Member Information",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(
                    modifier = Modifier.height(16.dp)
                )

                Text(
                    text = "Name: $name"
                )

                Spacer(
                    modifier = Modifier.height(8.dp)
                )

                Text(
                    text = "Email: $email"
                )

                Spacer(
                    modifier = Modifier.height(8.dp)
                )

                Text(
                    text = "Phone: ${if (phone.isBlank()) "Not provided" else phone}"
                )

                Button(
                    onClick = {
                        editing = true
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Edit Profile")
                }
            }
        }
    }
}



suspend fun testMembersApi(context: Context) {
    withContext(Dispatchers.IO) {
        try {
            val response = fetchMembers(context)

            Log.d("MembersApiTest", "Response body: ${response.body()}")

            Log.d(
                "MembersApiTest",
                "HTTP status: ${response.code()}, successful: ${response.isSuccessful}"
            )

            if (response.isSuccessful) {
                Log.d(
                    "MembersApiTest",
                    "Members returned: ${response.body()?.size ?: 0}"
                )
            } else {
                Log.e("MembersApiTest", "Request failed: HTTP ${response.code()}")
            }
        } catch (e: Exception) {
            Log.e("MembersApiTest", "Request failed", e)
        }
    }
}