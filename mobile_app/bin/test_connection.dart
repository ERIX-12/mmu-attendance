
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final baseUrl = 'https://mmu-attendance.onrender.com';
  final apiUrl = '$baseUrl/api';
  final registerUrl = '$apiUrl/auth/register/';
  
  print('Testing connection to $registerUrl...');
  try {
    final response = await http.post(
      Uri.parse(registerUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': 'test','email': 'test@test.com','password': 'test','confirm_password': 'test'}),
    );
    print('Status: ${response.statusCode}');
    print('Body: ${response.body}');
  } catch (e) {
    print('❌ FAILED: $e');
  }
}
