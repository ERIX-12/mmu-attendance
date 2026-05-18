import 'dart:io';

import 'package:http/http.dart' as http;

void main() async {
  const url =
      'https://mmu-attendance.onrender.com/api/auth/token/'; // Login endpoint usually exists
  stderr.writeln('Testing connection to $url...');
  try {
    final response = await http.post(
      Uri.parse(url),
      body: {'username': 'test', 'password': 'test'},
    );
    stderr.writeln('Response status: ${response.statusCode}');
    stderr.writeln('Response body: ${response.body}');
    if (response.statusCode != 404) {
      stderr.writeln('✅ Backend is reachable!');
    } else {
      stderr.writeln('❌ Backend returned 404. Check the URL.');
    }
  } catch (e) {
    stderr.writeln('❌ Connection failed: $e');
  }
}

