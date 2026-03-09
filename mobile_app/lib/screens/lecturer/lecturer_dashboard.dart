// lib/screens/lecturer/lecturer_dashboard.dart

import 'package:flutter/material.dart';
import '../../models/course_model.dart';
import '../../services/api_service.dart';
import '../../services/auth_service.dart';
import '../../utils/constants.dart';
import '../../widgets/stat_card.dart';
import '../auth/login_screen.dart';
import 'lecturer_sessions_screen.dart';
import 'create_session_screen.dart';
import 'lecturer_profile_screen.dart';
import 'session_detail_screen.dart';

class LecturerDashboard extends StatefulWidget {
  const LecturerDashboard({super.key});

  @override
  State<LecturerDashboard> createState() => _LecturerDashboardState();
}

class _LecturerDashboardState extends State<LecturerDashboard> {
  int _currentIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const _LecturerHome(),
      const LecturerSessionsScreen(),
      const CreateSessionScreen(),
      const LecturerProfileScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: _buildBottomNav(),
      floatingActionButton: (_currentIndex == 0 || _currentIndex == 1)
          ? FloatingActionButton.extended(
              onPressed: () => setState(() => _currentIndex = 2),
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 12,
              icon: const Icon(Icons.add_rounded, size: 28),
              label: const Text(
                'NEW SESSION', 
                style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 13),
              ),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            )
          : null,
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
                _navItem(1, Icons.view_list_rounded, 'Sessions'),
                _navItem(2, Icons.add_box_rounded, 'Create'),
                _navItem(3, Icons.person_rounded, 'Profile'),
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(22),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : AppColors.textMuted.withOpacity(0.6),
              size: 24,
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
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
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────

class _LecturerHome extends StatefulWidget {
  const _LecturerHome();

  @override
  State<_LecturerHome> createState() => _LecturerHomeState();
}

class _LecturerHomeState extends State<_LecturerHome> {
  final ApiService _api = ApiService();
  final AuthService _auth = AuthService();

  List<AttendanceSessionModel> _sessions = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final sessions = await _api.getSessions();
      setState(() {
        _sessions = sessions;
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

  int get _activeSessions => _sessions.where((s) => s.isActive).length;
  int get _completedSessions => _sessions.where((s) => s.isCompleted).length;

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
              title: _currentIndexTitle(),
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
                                      user?.initials ?? 'L',
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
                                        user?.firstName ?? 'Lecturer',
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
                                  _quickStat('SESSIONS', '${_sessions.length}'),
                                  _statDivider(),
                                  _quickStat('ACTIVE', '$_activeSessions'),
                                  _statDivider(),
                                  _quickStat('STUDENTS', '---'),
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
                          'Recent Activity',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.5,
                          ),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: const Text('View All', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
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
                      _buildError()
                    else if (_sessions.isEmpty)
                      _buildEmpty()
                    else
                      ..._sessions.take(5).map((s) => _buildSessionCard(s)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget? _currentIndexTitle() {
    return const Text(
      'MMU ATTENDANCE',
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w900,
        color: Colors.white,
        letterSpacing: 3,
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

  Widget _buildSessionCard(AttendanceSessionModel session) {
    Color statusColor;
    IconData statusIcon;
    switch (session.status) {
      case 'active':
        statusColor = AppColors.success;
        statusIcon = Icons.sensors_rounded;
        break;
      case 'completed':
        statusColor = AppColors.textMuted;
        statusIcon = Icons.task_alt_rounded;
        break;
      default:
        statusColor = AppColors.warning;
        statusIcon = Icons.hourglass_top_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        boxShadow: AppColors.softShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => SessionDetailScreen(session: session),
              ),
            ).then((_) => _loadData());
          },
          borderRadius: BorderRadius.circular(28),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Icon(statusIcon, color: statusColor, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${session.courseCode} · ${session.date}',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textMuted.withOpacity(0.6),
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        session.title.isNotEmpty ? session.title : 'Attendance Session',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmpty() {
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
              child: Icon(Icons.event_note_rounded, size: 48, color: AppColors.textMuted.withOpacity(0.3)),
            ),
            const SizedBox(height: 24),
            const Text(
              'No active sessions found.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              'Create your first attendance session using the plus button.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textMuted.withOpacity(0.7), fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        children: [
          const Icon(Icons.cloud_off_rounded, size: 48, color: Colors.grey),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: _loadData,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
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
}
