// lib/screens/student/student_courses_screen.dart

import 'package:flutter/material.dart';
import '../../models/course_model.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';

class StudentCoursesScreen extends StatefulWidget {
  const StudentCoursesScreen({super.key});

  @override
  State<StudentCoursesScreen> createState() => _StudentCoursesScreenState();
}

class _StudentCoursesScreenState extends State<StudentCoursesScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  List<CourseModel> _allCourses = [];
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';
  final Map<int, bool> _loadingMap = {};
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadCourses();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadCourses() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final courses = await _api.getCourses();
      setState(() {
        _allCourses = courses;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _enrollCourse(CourseModel course) async {
    setState(() => _loadingMap[course.id] = true);
    final result = await _api.enrollCourse(course.id);
    if (!mounted) return;
    setState(() => _loadingMap[course.id] = false);
    _showSnackBar(
      result['success'] == true
          ? result['message'] ?? 'Enrolled!'
          : result['error'] ?? 'Failed',
      result['success'] == true,
    );
    if (result['success'] == true) _loadCourses();
  }

  Future<void> _unenrollCourse(CourseModel course) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Unenroll?'),
        content: Text('Are you sure you want to unenroll from ${course.name}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Unenroll', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _loadingMap[course.id] = true);
    final result = await _api.unenrollCourse(course.id);
    if (!mounted) return;
    setState(() => _loadingMap[course.id] = false);
    _showSnackBar(
      result['success'] == true ? result['message'] ?? 'Unenrolled!' : result['error'] ?? 'Failed',
      result['success'] == true,
    );
    if (result['success'] == true) _loadCourses();
  }

  void _showSnackBar(String message, bool success) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: success ? AppColors.success : AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  List<CourseModel> get _filtered => _allCourses.where((c) {
        final q = _searchQuery.toLowerCase();
        return c.name.toLowerCase().contains(q) || c.code.toLowerCase().contains(q);
      }).toList();

  // For demo: we show all in "Available" and none in "Enrolled" 
  // (real implementation would need enrolled flag from backend)
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Courses',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 22,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(110),
          child: Column(
            children: [
              // Search bar
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: TextField(
                  onChanged: (v) => setState(() => _searchQuery = v),
                  decoration: InputDecoration(
                    hintText: 'Search courses...',
                    hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
                    prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
                    filled: true,
                    fillColor: const Color(0xFFF5F7FF),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
              ),
              TabBar(
                controller: _tabController,
                indicatorColor: AppColors.primary,
                labelColor: AppColors.primary,
                unselectedLabelColor: Colors.grey,
                tabs: const [
                  Tab(text: 'Available'),
                  Tab(text: 'My Courses'),
                ],
              ),
            ],
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? _buildError()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildCourseList(isEnrolled: false),
                    _buildCourseList(isEnrolled: true),
                  ],
                ),
    );
  }

  Widget _buildCourseList({required bool isEnrolled}) {
    final courses = _filtered;
    if (courses.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.search_off_rounded, size: 56, color: Colors.grey),
            SizedBox(height: 12),
            Text('No courses found', style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadCourses,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: courses.length,
        itemBuilder: (_, i) => _buildCourseCard(courses[i], isEnrolled),
      ),
    );
  }

  Widget _buildCourseCard(CourseModel course, bool isEnrolled) {
    final isLoadingThis = _loadingMap[course.id] == true;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    course.code,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  '${course.credits} credits',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              course.name,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            if (course.description != null && course.description!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  course.description!,
                  style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            if (course.department != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Row(
                  children: [
                    Icon(Icons.business_rounded, size: 14, color: Colors.grey[500]),
                    const SizedBox(width: 4),
                    Text(
                      course.department!,
                      style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoadingThis
                    ? null
                    : () => isEnrolled
                        ? _unenrollCourse(course)
                        : _enrollCourse(course),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isEnrolled ? Colors.red[50] : AppColors.primary,
                  foregroundColor: isEnrolled ? Colors.red : Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: isEnrolled ? const BorderSide(color: Colors.red) : BorderSide.none,
                  ),
                ),
                child: isLoadingThis
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        isEnrolled ? 'Unenroll' : 'Enroll',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.cloud_off_rounded, size: 56, color: Colors.grey),
          const SizedBox(height: 12),
          Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: _loadCourses,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }
}
