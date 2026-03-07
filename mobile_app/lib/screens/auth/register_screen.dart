// lib/screens/auth/register_screen.dart

import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../utils/constants.dart';
import '../student/student_dashboard.dart';
import '../lecturer/lecturer_dashboard.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _studentNumberController = TextEditingController();
  final _staffIdController = TextEditingController();

  String _selectedRole = 'student';
  String? _selectedFaculty;
  String? _selectedDepartment;
  int? _selectedYearOfStudy;
  bool _isLoading = false;
  String? _errorMessage;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  // Match the web frontend's faculty/department lists
  static const List<String> _faculties = [
    'FACULTY OF SCIENCE, TECHNOLOGY AND INNOVATION',
    'FACULTY OF EDUCATION',
    'FACULTY OF BUSINESS AND HUMANITIES',
    'FACULTY OF AGRICULTURE AND AGRO-ECOLOGY',
    'FACULTY OF HEALTH SCIENCES',
    'FACULTY OF ENGINEERING AND TECHNOLOGY',
  ];

  static const Map<String, List<String>> _facultyDepartments = {
    'FACULTY OF SCIENCE, TECHNOLOGY AND INNOVATION': [
      'Computer Science', 'Information Technology', 'Software Engineering',
      'Data Science', 'Cybersecurity'
    ],
    'FACULTY OF EDUCATION': [
      'Educational Foundations', 'Curriculum and Instruction',
      'Early Childhood Education', 'Special Needs Education'
    ],
    'FACULTY OF BUSINESS AND HUMANITIES': [
      'Business Administration', 'Accounting and Finance', 'Humanities', 'Economics'
    ],
    'FACULTY OF AGRICULTURE AND AGRO-ECOLOGY': [
      'Agriculture', 'Agro-Ecology', 'Agribusiness'
    ],
    'FACULTY OF HEALTH SCIENCES': [
      'Nursing', 'Public Health', 'Midwifery', 'Clinical Medicine'
    ],
    'FACULTY OF ENGINEERING AND TECHNOLOGY': [
      'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering'
    ],
  };

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _studentNumberController.dispose();
    _staffIdController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final userData = <String, dynamic>{
      'username': _usernameController.text.trim(),
      'email': _emailController.text.trim(),
      'first_name': _firstNameController.text.trim(),
      'last_name': _lastNameController.text.trim(),
      'password': _passwordController.text,
      'confirm_password': _confirmPasswordController.text,
      'role': _selectedRole,
      'faculty': _selectedFaculty ?? '',
      'department': _selectedDepartment ?? '',
    };

    // Add role-specific fields
    if (_selectedRole == 'student') {
      userData['student_number'] = _studentNumberController.text.trim();
      userData['year_of_study'] = _selectedYearOfStudy;
    } else if (_selectedRole == 'lecturer') {
      userData['staff_id'] = _staffIdController.text.trim();
    }

    try {
      final result = await AuthService().register(userData);

      if (!mounted) return;

      if (result['success'] == true) {
        final user = result['user'];
        Widget nextScreen;
        if (user.role == 'student') {
          nextScreen = const StudentDashboard();
        } else {
          nextScreen = const LecturerDashboard();
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Registration successful! Welcome to MMU Attendance.'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );

        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => nextScreen),
          (route) => false,
        );
      } else {
        setState(() {
          _errorMessage = result['error'] ?? 'Registration failed';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error. Is the server running?';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0D47A1), Color(0xFF1565C0), Color(0xFF1E88E5)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              children: [
                // Header
                const Icon(Icons.person_add_alt_1_rounded,
                    size: 48, color: Colors.white70),
                const SizedBox(height: 8),
                Text(
                  'Join MMU Attendance',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 20),
                _buildFormCard(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFormCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Error message
            if (_errorMessage != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline,
                        color: AppColors.error, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(color: AppColors.error, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),

            // --- Section: Personal Information ---
            _buildSectionLabel('Personal Information'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTextField(
                    controller: _firstNameController,
                    label: 'First Name',
                    icon: Icons.person_outline,
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTextField(
                    controller: _lastNameController,
                    label: 'Last Name',
                    icon: Icons.person_outline,
                    validator: (v) =>
                        v == null || v.isEmpty ? 'Required' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _usernameController,
              label: 'Username',
              icon: Icons.alternate_email,
              validator: (v) =>
                  v == null || v.isEmpty ? 'Username required' : null,
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _emailController,
              label: 'Email',
              icon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
              validator: (v) {
                if (v == null || v.isEmpty) return 'Email required';
                if (!v.contains('@')) return 'Invalid email';
                return null;
              },
            ),

            const SizedBox(height: 24),
            // --- Section: Account Type ---
            _buildSectionLabel('Account Details'),
            const SizedBox(height: 12),
            _buildRoleDropdown(),

            // --- Faculty & Department ---
            const SizedBox(height: 16),
            _buildFacultyDropdown(),
            const SizedBox(height: 16),
            _buildDepartmentDropdown(),

            // --- Role-specific fields ---
            if (_selectedRole == 'student') ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: _studentNumberController,
                      label: 'Student Number',
                      icon: Icons.badge_outlined,
                      validator: (v) => _selectedRole == 'student' &&
                              (v == null || v.isEmpty)
                          ? 'Required'
                          : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: _buildYearOfStudyDropdown()),
                ],
              ),
            ],
            if (_selectedRole == 'lecturer') ...[
              const SizedBox(height: 16),
              _buildTextField(
                controller: _staffIdController,
                label: 'Staff ID',
                icon: Icons.badge_outlined,
                validator: (v) =>
                    _selectedRole == 'lecturer' && (v == null || v.isEmpty)
                        ? 'Required'
                        : null,
              ),
            ],

            const SizedBox(height: 24),
            // --- Section: Security ---
            _buildSectionLabel('Security'),
            const SizedBox(height: 12),
            _buildTextField(
              controller: _passwordController,
              label: 'Password',
              icon: Icons.lock_outline,
              obscure: _obscurePassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_off : Icons.visibility,
                  size: 20,
                  color: AppColors.textMuted,
                ),
                onPressed: () =>
                    setState(() => _obscurePassword = !_obscurePassword),
              ),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Password required';
                if (v.length < 8) return 'Min 8 characters';
                return null;
              },
            ),
            const SizedBox(height: 16),
            _buildTextField(
              controller: _confirmPasswordController,
              label: 'Confirm Password',
              icon: Icons.lock_outline,
              obscure: _obscureConfirmPassword,
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  size: 20,
                  color: AppColors.textMuted,
                ),
                onPressed: () => setState(
                    () => _obscureConfirmPassword = !_obscureConfirmPassword),
              ),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Confirm your password';
                if (v != _passwordController.text) return 'Passwords don\'t match';
                return null;
              },
            ),

            const SizedBox(height: 28),
            // Register button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _handleRegister,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.5,
                        ))
                    : const Text(
                        'Create Account',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700),
                      ),
              ),
            ),

            const SizedBox(height: 16),
            // Already have account link
            Center(
              child: TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: RichText(
                  text: TextSpan(
                    style: TextStyle(
                        fontSize: 13, color: AppColors.textSecondary),
                    children: const [
                      TextSpan(text: 'Already have an account? '),
                      TextSpan(
                        text: 'Sign In',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: 0.3,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscure = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20, color: AppColors.textSecondary),
        suffixIcon: suffixIcon,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding:
            const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        filled: true,
        fillColor: AppColors.background.withOpacity(0.5),
      ),
    );
  }

  Widget _buildRoleDropdown() {
    return DropdownButtonFormField<String>(
      value: _selectedRole,
      decoration: InputDecoration(
        labelText: 'Register As',
        prefixIcon: const Icon(Icons.category_outlined,
            size: 20, color: AppColors.textSecondary),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        filled: true,
        fillColor: AppColors.background.withOpacity(0.5),
      ),
      items: const [
        DropdownMenuItem(value: 'student', child: Text('Student')),
        DropdownMenuItem(value: 'lecturer', child: Text('Lecturer')),
      ],
      onChanged: (v) => setState(() {
        _selectedRole = v!;
        // Clear role-specific fields when switching
        _studentNumberController.clear();
        _staffIdController.clear();
        _selectedYearOfStudy = null;
      }),
    );
  }

  Widget _buildFacultyDropdown() {
    return DropdownButtonFormField<String>(
      value: _selectedFaculty,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: 'Faculty',
        prefixIcon: const Icon(Icons.school_outlined,
            size: 20, color: AppColors.textSecondary),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        filled: true,
        fillColor: AppColors.background.withOpacity(0.5),
      ),
      validator: (v) =>
          v == null || v.isEmpty ? 'Please select a faculty' : null,
      items: _faculties.map((fac) {
        return DropdownMenuItem(
          value: fac,
          child: Text(
            fac,
            style: const TextStyle(fontSize: 13),
            overflow: TextOverflow.ellipsis,
          ),
        );
      }).toList(),
      onChanged: (v) => setState(() {
        _selectedFaculty = v;
        _selectedDepartment = null; // Reset department when faculty changes
      }),
    );
  }

  Widget _buildDepartmentDropdown() {
    final departments = _selectedFaculty != null
        ? (_facultyDepartments[_selectedFaculty] ?? [])
        : <String>[];

    return DropdownButtonFormField<String>(
      value: _selectedDepartment,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: 'Department',
        prefixIcon: const Icon(Icons.apartment_outlined,
            size: 20, color: AppColors.textSecondary),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        filled: true,
        fillColor: AppColors.background.withOpacity(0.5),
      ),
      validator: (v) =>
          v == null || v.isEmpty ? 'Please select a department' : null,
      items: departments.map((dept) {
        return DropdownMenuItem(value: dept, child: Text(dept));
      }).toList(),
      onChanged: _selectedFaculty == null
          ? null
          : (v) => setState(() => _selectedDepartment = v),
    );
  }

  Widget _buildYearOfStudyDropdown() {
    return DropdownButtonFormField<int>(
      value: _selectedYearOfStudy,
      decoration: InputDecoration(
        labelText: 'Year of Study',
        prefixIcon: const Icon(Icons.calendar_today_outlined,
            size: 20, color: AppColors.textSecondary),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: AppColors.divider),
        ),
        filled: true,
        fillColor: AppColors.background.withOpacity(0.5),
      ),
      validator: (v) =>
          _selectedRole == 'student' && v == null ? 'Required' : null,
      items: [1, 2, 3, 4, 5, 6].map((year) {
        return DropdownMenuItem(value: year, child: Text('Year $year'));
      }).toList(),
      onChanged: (v) => setState(() => _selectedYearOfStudy = v),
    );
  }
}
