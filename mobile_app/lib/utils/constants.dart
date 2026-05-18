import 'package:flutter/material.dart';

class AppConstants {
  // Production backend on Render
  static const String baseUrl = 'https://mmu-attendance-backend.onrender.com';
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

  // Notification endpoints
  static const String notificationsUrl = '$apiUrl/auth/notifications/';
  static const String readNotificationUrl = '$apiUrl/auth/notifications/';

  // App info
  static const String appName = 'MMU Attendance';
  static const String appVersion = '1.0.0';
  static const String universityName = 'Mountains of the Moon University';
}

class AppColors {
  // Brand Colors
  static const Color primary = Color(0xFF1E3A8A); // Slate Blue
  static const Color primaryLight = Color(0xFF3B82F6); // Bright Blue
  static const Color primaryDark = Color(0xFF1E3A8A); 
  static const Color secondary = Color(0xFF10B981); // Emerald
  static const Color accent = Color(0xFF8B5CF6); // Violet
  
  // Neutral Colors
  static const Color background = Color(0xFFF8FAFC); 
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardBg = Color(0xFFFFFFFF);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); 
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  static const Color divider = Color(0xFFE2E8F0);

  // Modern Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF1E3A8A), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient blueGradient = LinearGradient(
    colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF10B981)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF8B5CF6)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static List<BoxShadow> softShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.04),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.02),
      blurRadius: 2,
      offset: const Offset(0, 1),
    ),
  ];
  
  static List<BoxShadow> mediumShadow = [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
  ];
}
