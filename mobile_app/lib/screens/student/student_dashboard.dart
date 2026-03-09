// lib/screens/student/student_dashboard.dart

import 'package:flutter/material.dart';
import '../../models/course_model.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../utils/constants.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/attendance_badge.dart';
// login_screen imported by profile sub-screens
import 'scan_qr_screen.dart';
import 'student_courses_screen.dart';
import 'attendance_history_screen.dart';
import 'student_profile_screen.dart';

class StudentDashboard extends StatefulWidget {
  const StudentDashboard({super.key});

  @override
  State<StudentDashboard> createState() => _StudentDashboardState();
}

class _StudentDashboardState extends State<StudentDashboard> {
  int _currentIndex = 0;

  final List<Widget> _pages = [];
  bool _pagesBuilt = false;

  @override
  void initState() {
    super.initState();
    _pages.addAll([
      const _StudentHome(),
      const StudentCoursesScreen(),
      const ScanQrScreen(),
      const AttendanceHistoryScreen(),
      const StudentProfileScreen(),
    ]);
    _pagesBuilt = true;
  }

  @override
  Widget build(BuildContext context) {
    if (!_pagesBuilt) return const SizedBox();
    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      margin: const EdgeInsets.fromLTRB(24, 0, 24, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(0, Icons.grid_view_rounded, 'Home'),
                _navItem(1, Icons.auto_stories_rounded, 'Courses'),
                _scanButton(),
                _navItem(3, Icons.analytics_rounded, 'Log'),
                _navItem(4, Icons.person_rounded, 'Me'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(int index, IconData icon, String label) {
    final isSelected = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 350),
        curve: Curves.fastOutSlowIn,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(22),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : AppColors.textMuted.withOpacity(0.6),
              size: 24,
            ),
            if (isSelected) ...[
              const SizedBox(height: 4),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _scanButton() {
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = 2),
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: const Icon(
          Icons.qr_code_scanner_rounded,
          color: Colors.white,
          size: 28,
        ),
      ),
    );
  }
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────

class _StudentHome extends StatefulWidget {
  const _StudentHome();

  @override
  State<_StudentHome> createState() => _StudentHomeState();
}

class _StudentHomeState extends State<_StudentHome> {
  final ApiService _api = ApiService();
  final AuthService _auth = AuthService();

  List<AttendanceSummaryModel> _summary = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final summary = await _api.getAttendanceSummary();
      setState(() {
        _summary = summary;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  int get _overallPercentage {
    if (_summary.isEmpty) return 0;
    final total = _summary.fold(0, (a, b) => a + b.attendancePercentage);
    return total ~/ _summary.length;
  }

  int get _belowThresholdCount => _summary.where((s) => s.belowThreshold).length;

  @override
  Widget build(BuildContext context) {
    final user = _auth.currentUser;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppColors.primary,
        displacement: 40,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          slivers: [
            SliverAppBar(
              expandedHeight: 280,
              pinned: true,
              stretch: true,
              backgroundColor: AppColors.primary,
              elevation: 0,
              centerTitle: false,
              title: const Text(
                'MMU ATTENDANCE',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 3),
              ),
              flexibleSpace: FlexibleSpaceBar(
                stretchModes: const [StretchMode.zoomBackground],
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    Container(
                      decoration: const BoxDecoration(
                        gradient: AppColors.primaryGradient,
                      ),
                    ),
                    Positioned(
                      top: -60,
                      right: -60,
                      child: CircleAvatar(
                        radius: 140,
                        backgroundColor: Colors.white.withOpacity(0.05),
                      ),
                    ),
                    SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 40),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white.withOpacity(0.3), width: 1.5),
                                  ),
                                  child: CircleAvatar(
                                    radius: 30,
                                    backgroundColor: Colors.white.withOpacity(0.15),
                                    child: Text(
                                      user?.initials ?? 'S',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 22,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'HELLO,',
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.6),
                                          fontSize: 12,
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: 2,
                                        ),
                                      ),
                                      Text(
                                        user?.firstName ?? 'Student',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 28,
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: -0.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 32),
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: Colors.white.withOpacity(0.15), width: 1),
                              ),
                              child: Row(
                                children: [
                                  _quickStat('ATTENDANCE', '$_overallPercentage%'),
                                  _statDivider(),
                                  _quickStat('COURSES', '${_summary.length}'),
                                  _statDivider(),
                                  _quickStat('STATUS', _overallPercentage >= 80 ? 'OK' : 'RISK'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 24, 24, 100),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Your Progress',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.5,
                          ),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: const Text('Refresh', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    if (_isLoading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(60),
                          child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 3),
                        ),
                      )
                    else if (_error != null)
                      _buildErrorCard()
                    else if (_summary.isEmpty)
                      _buildEmptyCard()
                    else
                      ..._summary.map((s) => _buildCourseAttendanceCard(s)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _quickStat(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _statDivider() => Container(width: 1, height: 30, color: Colors.white.withOpacity(0.1));

  Widget _buildCourseAttendanceCard(AttendanceSummaryModel s) {
    final color = s.attendancePercentage >= 80
        ? AppColors.success
        : s.attendancePercentage >= 60
            ? AppColors.warning
            : AppColors.error;

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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s.courseCode,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        s.courseName,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                AttendanceBadge(percentage: s.attendancePercentage),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Icon(Icons.event_available_rounded, size: 16, color: AppColors.textMuted.withOpacity(0.5)),
                const SizedBox(width: 8),
                Text(
                  '${s.attendedSessions}/${s.totalSessions} sessions attended',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted.withOpacity(0.8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Stack(
              children: [
                Container(
                  height: 10,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppColors.divider.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 1200),
                  curve: Curves.fastOutSlowIn,
                  height: 10,
                  width: (MediaQuery.of(context).size.width - 96) * (s.attendancePercentage / 100),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [color, color.withOpacity(0.8)],
                    ),
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: color.withOpacity(0.2),
                        blurRadius: 6,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (s.belowThreshold && s.totalSessions > 0)
              Container(
                margin: const EdgeInsets.only(top: 20),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.error),
                    const SizedBox(width: 10),
                    const Text(
                      'Attendance is below required threshold',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: AppColors.error,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorCard() {
    return Center(
      child: Column(
        children: [
          const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.textMuted),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _loadData,
            icon: const Icon(Icons.refresh),
            label: const Text('RETRY'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCard() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: AppColors.softShadow,
              ),
              child: Icon(Icons.library_books_rounded, size: 48, color: AppColors.textMuted.withOpacity(0.3)),
            ),
            const SizedBox(height: 24),
            const Text(
              'No courses found.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'Enroll in courses to start tracking your attendance.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textMuted.withOpacity(0.7), fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
