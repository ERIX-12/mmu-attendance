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
        centerTitle: true,
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'Available Courses',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w900,
            fontSize: 22,
            letterSpacing: -0.5,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(130),
          child: Column(
            children: [
              // Search bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: AppColors.softShadow,
                  ),
                  child: TextField(
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    decoration: InputDecoration(
                      hintText: 'Search courses or codes...',
                      hintStyle: TextStyle(color: AppColors.textMuted.withOpacity(0.5), fontSize: 15, fontWeight: FontWeight.w600),
                      prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    ),
                  ),
                ),
              ),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: AppColors.primary,
                  ),
                  labelColor: Colors.white,
                  unselectedLabelColor: AppColors.textMuted,
                  labelStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5),
                  unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  tabs: const [
                    Tab(text: 'CATALOG'),
                    Tab(text: 'ENROLLED'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 3))
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
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: AppColors.softShadow,
                ),
                child: Icon(Icons.search_off_rounded, size: 48, color: AppColors.textMuted.withOpacity(0.3)),
              ),
              const SizedBox(height: 24),
              const Text(
                'No courses found.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                'Try searching for something else or refresh the list.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted.withOpacity(0.7), fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadCourses,
      color: AppColors.primary,
      displacement: 20,
      child: ListView.builder(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(24, 16, 24, 100),
        itemCount: courses.length,
        itemBuilder: (_, i) => _buildCourseCard(courses[i], isEnrolled),
      ),
    );
  }

  Widget _buildCourseCard(CourseModel course, bool isEnrolled) {
    final isLoadingThis = _loadingMap[course.id] == true;
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: AppColors.softShadow,
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    course.code,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w900,
                      fontSize: 11,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                const Spacer(),
                Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${course.credits} Credits',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMuted.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              course.name,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary,
                letterSpacing: -0.5,
              ),
            ),
            if (course.description != null && course.description!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Text(
                  course.description!,
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textMuted.withOpacity(0.9),
                    height: 1.5,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            const SizedBox(height: 24),
            Row(
              children: [
                if (course.department != null)
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.business_rounded, size: 16, color: AppColors.textMuted.withOpacity(0.4)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            course.department!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 12, color: AppColors.textMuted.withOpacity(0.7), fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(width: 16),
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    onPressed: isLoadingThis
                        ? null
                        : () => isEnrolled
                            ? _unenrollCourse(course)
                            : _enrollCourse(course),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isEnrolled ? Colors.white : AppColors.primary,
                      foregroundColor: isEnrolled ? AppColors.error : Colors.white,
                      elevation: isEnrolled ? 0 : 4,
                      shadowColor: AppColors.primary.withOpacity(0.3),
                      padding: const EdgeInsets.symmetric(horizontal: 24),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: isEnrolled ? BorderSide(color: AppColors.error.withOpacity(0.2), width: 1.5) : BorderSide.none,
                      ),
                    ),
                    child: isLoadingThis
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 3, color: isEnrolled ? AppColors.error : Colors.white),
                          )
                        : Text(
                            isEnrolled ? 'UNENROLL' : 'ENROLL NOW',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.5),
                          ),
                  ),
                ),
              ],
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
          const Icon(Icons.cloud_off_rounded, size: 56, color: AppColors.textMuted),
          const SizedBox(height: 16),
          Text(_error ?? 'An unexpected error occurred', textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w700)),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            onPressed: _loadCourses,
            icon: const Icon(Icons.refresh),
            label: const Text('RETRY'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
}
