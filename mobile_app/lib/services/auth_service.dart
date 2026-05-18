// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../utils/constants.dart';

class AuthService {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userKey = 'user_data';

  // Singleton
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  String? _accessToken;
  UserModel? _currentUser;

  String? get accessToken => _accessToken;
  UserModel? get currentUser => _currentUser;

  bool get isLoggedIn => _accessToken != null && _currentUser != null;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _accessToken = prefs.getString(_accessTokenKey);
    final userData = prefs.getString(_userKey);
    if (userData != null) {
      try {
        _currentUser = UserModel.fromJson(jsonDecode(userData));
      } catch (_) {}
    }
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    if (kDebugMode) {
      print('Starting login for $username at ${AppConstants.loginUrl}...');
    }
    try {
      final response = await http
          .post(
            Uri.parse(AppConstants.loginUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'username': username, 'password': password}),
          )
          .timeout(const Duration(seconds: 45));

      if (kDebugMode) {
        print('Login status: ${response.statusCode}');
      }
      if (kDebugMode) {
        print('Login body: ${response.body}');
      }

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _accessToken = data['access'];
        final userJson = data['user'];
        _currentUser = UserModel.fromJson(userJson);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_accessTokenKey, data['access']);
        await prefs.setString(_refreshTokenKey, data['refresh']);
        await prefs.setString(_userKey, jsonEncode(userJson));

        return {'success': true, 'user': _currentUser};
      } else {
        // Parse Django validation errors into user-friendly messages
        String errorMessage = 'Invalid credentials';
        if (data is Map) {
          if (data['non_field_errors'] != null &&
              data['non_field_errors'] is List) {
            errorMessage = data['non_field_errors'].first.toString();
          } else if (data['detail'] != null) {
            errorMessage = data['detail'].toString();
          } else if (data['error'] != null) {
            errorMessage = data['error'].toString();
          }
        }
        return {'success': false, 'error': errorMessage};
      }
    } catch (e) {
      if (kDebugMode) {
        print('Login error exception: $e');
      }
      return {
        'success': false,
        'error':
            'Connection failed ($e). Check internet or try again in a minute.'
      };
    }
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    try {
      final response = await http
          .post(
            Uri.parse(AppConstants.registerUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(userData),
          )
          .timeout(const Duration(seconds: 45));

      if (kDebugMode) {
        print('Registration status: ${response.statusCode}');
      }
      if (kDebugMode) {
        print('Registration body: ${response.body}');
      }

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // Backend no longer returns tokens on registration to enforce login step
        return {
          'success': true,
          'message': data['message'] ?? 'Registration successful'
        };
      } else {
        // Parse Django validation errors into user-friendly messages
        String errorMessage = 'Registration failed';
        if (data is Map) {
          final errors = <String>[];
          data.forEach((key, value) {
            if (value is List && value.isNotEmpty) {
              final fieldName = key.toString().replaceAll('_', ' ');
              final capitalizedField =
                  fieldName[0].toUpperCase() + fieldName.substring(1);
              errors.add('$capitalizedField: ${value.first}');
            } else if (value is String) {
              errors.add(value);
            }
          });
          if (errors.isNotEmpty) {
            errorMessage = errors.join('\n');
          }
        }
        return {'success': false, 'error': errorMessage};
      }
    } catch (e) {
      if (kDebugMode) {
        print('Registration error exception: $e');
      }
      return {
        'success': false,
        'error':
            'Connection failed ($e). Check internet or try again in a minute.'
      };
    }
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refresh = prefs.getString(_refreshTokenKey);
      if (refresh != null && _accessToken != null) {
        await http.post(
          Uri.parse(AppConstants.logoutUrl),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_accessToken',
          },
          body: jsonEncode({'refresh': refresh}),
        );
      }
    } catch (_) {}

    _accessToken = null;
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessTokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_userKey);
  }

  Future<bool> refreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final refresh = prefs.getString(_refreshTokenKey);
      if (refresh == null) return false;

      final response = await http.post(
        Uri.parse(AppConstants.refreshTokenUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refresh': refresh}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _accessToken = data['access'];
        await prefs.setString(_accessTokenKey, _accessToken!);
        return true;
      }
    } catch (_) {}
    return false;
  }

  Map<String, String> get authHeaders => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${_accessToken ?? ''}',
      };

  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final response = await http
          .get(
            Uri.parse(AppConstants.userProfileUrl),
            headers: authHeaders,
          )
          .timeout(const Duration(seconds: 45));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _currentUser = UserModel.fromJson(data);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_userKey, jsonEncode(data));
        return {'success': true, 'user': _currentUser};
      }
      return {
        'success': false,
        'error': 'Failed to load profile (${response.statusCode})'
      };
    } catch (e) {
      if (kDebugMode) {
        print('Profile error exception: $e');
      }
      return {'success': false, 'error': 'Connection failed ($e)'};
    }
  }

  Future<Map<String, dynamic>> resetPassword({String? username, String? email}) async {
    try {
      final body = <String, String>{};
      if (username != null) body['username'] = username;
      if (email != null) body['email'] = email;

      final response = await http
          .post(
            Uri.parse(AppConstants.resetPasswordUrl),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 45));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': data['message'] ?? 'Password reset successfully',
          'temp_password': data['temp_password'],
          'note': data['note'],
        };
      } else {
        return {
          'success': false,
          'error': data['error'] ?? 'Failed to reset password',
        };
      }
    } catch (e) {
      if (kDebugMode) {
        print('Reset password error exception: $e');
      }
      return {
        'success': false,
        'error': 'Connection failed ($e). Check internet or try again.'
      };
    }
  }
}
