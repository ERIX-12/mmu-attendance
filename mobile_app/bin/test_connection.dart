import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

void main() async {
  const baseUrl = 'https://mmu-attendance.onrender.com';
  const apiUrl = '$baseUrl/api';
  const registerUrl = '$apiUrl/auth/register/';

  stderr.writeln('Testing connection to $registerUrl...');
  try {
    final response = await http.post(
      Uri.parse(registerUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': 'test',
        'email': 'test@test.com',
        'password': 'test',
        'confirm_password': 'test'
      }),
    );
    stderr.writeln('Status: ${response.statusCode}');
    stderr.writeln('Body: ${response.body}');
  } catch (e) {
    stderr.writeln('❌ FAILED: $e');
  }
}

