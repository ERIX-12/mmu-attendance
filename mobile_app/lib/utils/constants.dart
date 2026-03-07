import 'package:flutter/material.dart';

class AppConstants {
  // Change this to your backend URL when running on a real device
  // For emulator: use http://10.0.2.2:8000
  // For physical device on same WiFi: use http://YOUR_PC_IP:8000
  static const String baseUrl = 'http://localhost:8000';
  static const String apiUrl = '$baseUrl/api';

  // Auth endpoints
  static const String loginUrl = '$apiUrl/auth/token/';
  static const String registerUrl = '$apiUrl/auth/register/';
  static const String refreshTokenUrl = '$apiUrl/auth/token/refresh/';
  static const String logoutUrl = '$apiUrl/auth/logout/';
  static const String userProfileUrl = '$apiUrl/auth/users/me/';

  // Course endpoints
  static const String coursesUrl = '$apiUrl/courses/';

  // Session endpoints
  static const String sessionsUrl = '$apiUrl/sessions/';
  static const String attendanceSummaryUrl = '$apiUrl/sessions/attendance/summary/';
  static const String markAttendanceUrl = '$apiUrl/sessions/attendance/mark/';
  static const String attendanceRecordsUrl = '$apiUrl/sessions/attendance/records/';

  // App info
  static const String appName = 'MMU Attendance';
  static const String appVersion = '1.0.0';
  static const String universityName = 'Multimedia University';
}

class AppColors {
  static const Color primary = Color(0xFF1565C0);
  static const Color primaryLight = Color(0xFF1E88E5);
  static const Color primaryDark = Color(0xFF0D47A1);
  static const Color secondary = Color(0xFF00ACC1);
  static const Color accent = Color(0xFF00B0FF);
  static const Color background = Color(0xFFF0F4FF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardBg = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF1A237E);
  static const Color textSecondary = Color(0xFF5C6BC0);
  static const Color textMuted = Color(0xFF9FA8DA);
  static const Color success = Color(0xFF43A047);
  static const Color warning = Color(0xFFFFB300);
  static const Color error = Color(0xFFE53935);
  static const Color divider = Color(0xFFE8EAF6);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF1565C0), Color(0xFF1E88E5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1565C0), Color(0xFF0D47A1)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF43A047), Color(0xFF66BB6A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warningGradient = LinearGradient(
    colors: [Color(0xFFFF8F00), Color(0xFFFFB300)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
