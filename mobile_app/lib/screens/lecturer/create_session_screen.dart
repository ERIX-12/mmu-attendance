// lib/screens/lecturer/create_session_screen.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/course_model.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';

class CreateSessionScreen extends StatefulWidget {
  const CreateSessionScreen({super.key});

  @override
  State<CreateSessionScreen> createState() => _CreateSessionScreenState();
}

class _CreateSessionScreenState extends State<CreateSessionScreen> {
  final ApiService _api = ApiService();
  final _formKey = GlobalKey<FormState>();

  final _titleController = TextEditingController();
  final _topicController = TextEditingController();
  final _venueController = TextEditingController();
  final _descController = TextEditingController();

  List<CourseModel> _courses = [];
  CourseModel? _selectedCourse;
  DateTime _selectedDate = DateTime.now();
  TimeOfDay _startTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 10, minute: 0);
  bool _isLoading = false;
  bool _loadingCourses = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _topicController.dispose();
    _venueController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _loadCourses() async {
    try {
      final courses = await _api.getCourses();
      setState(() {
        _courses = courses;
        _loadingCourses = false;
        if (courses.isNotEmpty) _selectedCourse = courses.first;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loadingCourses = false;
      });
    }
  }

  String _formatTime(TimeOfDay t) =>
      '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: now.subtract(const Duration(days: 7)),
      lastDate: now.add(const Duration(days: 90)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _pickTime(bool isStart) async {
    final picked = await showTimePicker(
      context: context,
      initialTime: isStart ? _startTime : _endTime,
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.primary),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() => isStart ? _startTime = picked : _endTime = picked);
    }
  }

  Future<void> _createSession() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCourse == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a course')),
      );
      return;
    }

    setState(() => _isLoading = true);

    final data = {
      'title': _titleController.text.trim(),
      'topic': _topicController.text.trim(),
      'venue': _venueController.text.trim(),
      'description': _descController.text.trim(),
      'course': _selectedCourse!.id,
      'date': DateFormat('yyyy-MM-dd').format(_selectedDate),
      'start_time': _formatTime(_startTime),
      'end_time': _formatTime(_endTime),
    };

    final result = await _api.createSession(data);
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Session created successfully!'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );
      _titleController.clear();
      _topicController.clear();
      _venueController.clear();
      _descController.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['error'] ?? 'Failed to create session'),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Create Session',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 22,
          ),
        ),
      ),
      body: _loadingCourses
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.grey)))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionTitle('Course'),
                        const SizedBox(height: 8),
                        _buildCourseDropdown(),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Session Title'),
                        const SizedBox(height: 8),
                        _buildTextField(
                          controller: _titleController,
                          hint: 'e.g. Week 3 Lecture',
                          icon: Icons.title_rounded,
                          validator: (v) => v!.isEmpty ? 'Title is required' : null,
                        ),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Topic (Optional)'),
                        const SizedBox(height: 8),
                        _buildTextField(
                          controller: _topicController,
                          hint: 'e.g. Introduction to Algorithms',
                          icon: Icons.topic_rounded,
                        ),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Venue (Optional)'),
                        const SizedBox(height: 8),
                        _buildTextField(
                          controller: _venueController,
                          hint: 'e.g. Room 101, Block A',
                          icon: Icons.location_on_rounded,
                        ),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Date & Time'),
                        const SizedBox(height: 8),
                        _buildDateTimePicker(),
                        const SizedBox(height: 16),
                        _buildSectionTitle('Description (Optional)'),
                        const SizedBox(height: 8),
                        _buildTextField(
                          controller: _descController,
                          hint: 'Additional notes...',
                          icon: Icons.notes_rounded,
                          maxLines: 3,
                        ),
                        const SizedBox(height: 28),
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _createSession,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 0,
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                                  )
                                : const Text(
                                    'Create Session',
                                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildCourseDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8EAF6), width: 1.5),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<CourseModel>(
          value: _selectedCourse,
          isExpanded: true,
          hint: const Text('Select a course'),
          icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.primary),
          items: _courses.map((c) => DropdownMenuItem(
            value: c,
            child: Text('${c.code} — ${c.name}', overflow: TextOverflow.ellipsis),
          )).toList(),
          onChanged: (v) => setState(() => _selectedCourse = v),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      style: const TextStyle(fontSize: 15, color: AppColors.textPrimary),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
        prefixIcon: maxLines == 1 ? Icon(icon, color: AppColors.primary, size: 20) : null,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFE8EAF6), width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.error, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }

  Widget _buildDateTimePicker() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8EAF6), width: 1.5),
      ),
      child: Column(
        children: [
          GestureDetector(
            onTap: _pickDate,
            child: Row(
              children: [
                const Icon(Icons.calendar_today_rounded, color: AppColors.primary, size: 20),
                const SizedBox(width: 12),
                Text(
                  DateFormat('EEEE, MMM d, yyyy').format(_selectedDate),
                  style: const TextStyle(fontSize: 15, color: AppColors.textPrimary),
                ),
                const Spacer(),
                const Icon(Icons.edit_rounded, color: AppColors.primary, size: 16),
              ],
            ),
          ),
          const Divider(height: 20),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => _pickTime(true),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      children: [
                        const Text('Start', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 4),
                        Text(
                          _formatTime(_startTime),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: Icon(Icons.arrow_forward_rounded, color: Colors.grey),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () => _pickTime(false),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      children: [
                        const Text('End', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 4),
                        Text(
                          _formatTime(_endTime),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
