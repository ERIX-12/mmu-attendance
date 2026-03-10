
import 'package:http/http.dart' as http;

void main() async {
  final url = 'https://mmu-attendance.onrender.com/api/auth/token/'; // Login endpoint usually exists
  print('Testing connection to $url...');
  try {
    final response = await http.post(
      Uri.parse(url),
      body: {'username': 'test', 'password': 'test'},
    );
    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');
    if (response.statusCode != 404) {
      print('✅ Backend is reachable!');
    } else {
      print('❌ Backend returned 404. Check the URL.');
    }
  } catch (e) {
    print('❌ Connection failed: $e');
  }
}
