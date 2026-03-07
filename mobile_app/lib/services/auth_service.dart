// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
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
    final response = await http.post(
      Uri.parse(AppConstants.loginUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

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
        if (data['non_field_errors'] != null && data['non_field_errors'] is List) {
          errorMessage = data['non_field_errors'].first.toString();
        } else if (data['detail'] != null) {
          errorMessage = data['detail'].toString();
        } else if (data['error'] != null) {
          errorMessage = data['error'].toString();
        }
      }
      return {'success': false, 'error': errorMessage};
    }
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await http.post(
      Uri.parse(AppConstants.registerUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(userData),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode == 201) {
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
      // Django returns errors as {field: [message1, message2], ...}
      String errorMessage = 'Registration failed';
      if (data is Map) {
        final errors = <String>[];
        data.forEach((key, value) {
          if (value is List && value.isNotEmpty) {
            final fieldName = key.toString().replaceAll('_', ' ');
            final capitalizedField = fieldName[0].toUpperCase() + fieldName.substring(1);
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
    final response = await http.get(
      Uri.parse(AppConstants.userProfileUrl),
      headers: authHeaders,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _currentUser = UserModel.fromJson(data);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userKey, jsonEncode(data));
      return {'success': true, 'user': _currentUser};
    }
    return {'success': false, 'error': 'Failed to load profile'};
  }
}
