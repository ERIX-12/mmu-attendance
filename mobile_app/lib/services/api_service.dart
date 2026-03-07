// lib/services/api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/course_model.dart';
import '../utils/constants.dart';
import 'auth_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final AuthService _auth = AuthService();

  Map<String, String> get _headers => _auth.authHeaders;

  // ─── HTTP helpers ────────────────────────────────────────────────────────────

  Future<http.Response> _get(String url) async {
    final response = await http.get(Uri.parse(url), headers: _headers);
    if (response.statusCode == 401) {
      final refreshed = await _auth.refreshToken();
      if (refreshed) {
        return http.get(Uri.parse(url), headers: _headers);
      }
    }
    return response;
  }

  Future<http.Response> _post(String url, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse(url),
      headers: _headers,
      body: jsonEncode(body),
    );
    if (response.statusCode == 401) {
      final refreshed = await _auth.refreshToken();
      if (refreshed) {
        return http.post(Uri.parse(url), headers: _headers, body: jsonEncode(body));
      }
    }
    return response;
  }

  Future<http.Response> _patch(String url, Map<String, dynamic> body) async {
    final response = await http.patch(
      Uri.parse(url),
      headers: _headers,
      body: jsonEncode(body),
    );
    return response;
  }

  // ─── Courses ─────────────────────────────────────────────────────────────────

  Future<List<CourseModel>> getCourses() async {
    final response = await _get(AppConstants.coursesUrl);
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((e) => CourseModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load courses: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> enrollCourse(int courseId) async {
    final url = '${AppConstants.coursesUrl}$courseId/enroll/';
    final response = await _post(url, {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200 || response.statusCode == 201) {
      return {'success': true, 'message': data['message'] ?? 'Enrolled successfully'};
    }
    return {'success': false, 'error': data['error'] ?? data['detail'] ?? 'Failed to enroll'};
  }

  Future<Map<String, dynamic>> unenrollCourse(int courseId) async {
    final url = '${AppConstants.coursesUrl}$courseId/unenroll/';
    final response = await _post(url, {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'success': true, 'message': data['message'] ?? 'Unenrolled successfully'};
    }
    return {'success': false, 'error': data['error'] ?? 'Failed to unenroll'};
  }

  // ─── Sessions ────────────────────────────────────────────────────────────────

  Future<List<AttendanceSessionModel>> getSessions({String? status, int? courseId}) async {
    String url = AppConstants.sessionsUrl;
    final params = <String, String>{};
    if (status != null) params['status'] = status;
    if (courseId != null) params['course'] = courseId.toString();
    if (params.isNotEmpty) {
      url += '?${params.entries.map((e) => '${e.key}=${e.value}').join('&')}';
    }
    final response = await _get(url);
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((e) => AttendanceSessionModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load sessions');
  }

  Future<Map<String, dynamic>> createSession(Map<String, dynamic> sessionData) async {
    final response = await _post(AppConstants.sessionsUrl, sessionData);
    final data = jsonDecode(response.body);
    if (response.statusCode == 201) {
      return {'success': true, 'session': AttendanceSessionModel.fromJson(data)};
    }
    return {'success': false, 'error': data['detail'] ?? data.toString()};
  }

  Future<Map<String, dynamic>> activateSession(String sessionId) async {
    final url = '${AppConstants.sessionsUrl}$sessionId/activate/';
    final response = await _post(url, {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'success': true, 'session': AttendanceSessionModel.fromJson(data)};
    }
    return {'success': false, 'error': data['error'] ?? 'Failed to activate session'};
  }

  Future<Map<String, dynamic>> deactivateSession(String sessionId) async {
    final url = '${AppConstants.sessionsUrl}$sessionId/deactivate/';
    final response = await _post(url, {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'success': true, 'session': AttendanceSessionModel.fromJson(data)};
    }
    return {'success': false, 'error': data['error'] ?? 'Failed to deactivate session'};
  }

  Future<Map<String, dynamic>> refreshQrCode(String sessionId) async {
    final url = '${AppConstants.sessionsUrl}$sessionId/refresh-qr/';
    final response = await _post(url, {});
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'success': true, 'session': AttendanceSessionModel.fromJson(data)};
    }
    return {'success': false, 'error': data['error'] ?? 'Failed to refresh QR'};
  }

  Future<Map<String, dynamic>> markAttendance(String sessionId, String qrSecret) async {
    final response = await _post(AppConstants.markAttendanceUrl, {
      'session_id': sessionId,
      'qr_secret': qrSecret,
    });
    final data = jsonDecode(response.body);
    if (response.statusCode == 201 || response.statusCode == 200) {
      return {'success': true, 'message': data['message'] ?? 'Attendance marked!'};
    }
    return {'success': false, 'error': data['error'] ?? 'Failed to mark attendance'};
  }

  // ─── Attendance Records ──────────────────────────────────────────────────────

  Future<List<AttendanceSummaryModel>> getAttendanceSummary() async {
    final response = await _get(AppConstants.attendanceSummaryUrl);
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((e) => AttendanceSummaryModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load attendance summary');
  }

  Future<List<AttendanceRecordModel>> getAttendanceRecords() async {
    final response = await _get(AppConstants.attendanceRecordsUrl);
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((e) => AttendanceRecordModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load attendance records');
  }

  Future<List<Map<String, dynamic>>> getSessionAttendance(String sessionId) async {
    final url = '${AppConstants.sessionsUrl}$sessionId/attendance/';
    final response = await _get(url);
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.cast<Map<String, dynamic>>();
    }
    throw Exception('Failed to load session attendance');
  }
}
