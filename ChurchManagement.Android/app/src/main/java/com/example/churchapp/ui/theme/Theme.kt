
package com.example.churchapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val ChurchLightColorScheme = lightColorScheme(
    primary = Color(0xFF174A35),
    onPrimary = Color.White,

    secondary = Color(0xFFC49A45),
    onSecondary = Color(0xFF171717),

    background = Color(0xFFFFFFFF),
    onBackground = Color(0xFF171717),

    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF171717),

    surfaceVariant = Color(0xFFF1F3F1),
    onSurfaceVariant = Color(0xFF454B47),

    outline = Color(0xFF777777),

    error = Color(0xFFB3261E),
    onError = Color.White
)

@Composable
fun ChurchAppTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = ChurchLightColorScheme,
        typography = Typography,
        content = content
    )
}
