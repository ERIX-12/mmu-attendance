// lib/screens/student/attendance_history_screen.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/course_model.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  const AttendanceHistoryScreen({super.key});

  @override
  State<AttendanceHistoryScreen> createState() =>
      _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  final ApiService _api = ApiService();
  List<AttendanceRecordModel> _records = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final records = await _api.getAttendanceRecords();
      setState(() {
        _records = records;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  int get _presentCount => _records.where((r) => r.isPresent).length;
  int get _absentCount => _records.where((r) => !r.isPresent).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: AppColors.background,
        elevation: 0,
        title: const Text(
          'Attendance Records',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w900,
            fontSize: 24,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          IconButton(
            onPressed: _loadRecords,
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.refresh_rounded, color: AppColors.primary, size: 20),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? _buildError()
              : RefreshIndicator(
                  onRefresh: _loadRecords,
                  color: AppColors.primary,
                  backgroundColor: Colors.white,
                  strokeWidth: 3,
                  child: CustomScrollView(
                    physics: const BouncingScrollPhysics(),
                    slivers: [
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 10, 20, 24),
                          child: _buildSummaryHeader(),
                        ),
                      ),
                      _records.isEmpty
                          ? SliverFillRemaining(hasScrollBody: false, child: _buildEmpty())
                          : SliverPadding(
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              sliver: SliverList(
                                delegate: SliverChildBuilderDelegate(
                                  (_, i) => _buildRecordCard(_records[i]),
                                  childCount: _records.length,
                                ),
                              ),
                            ),
                      const SliverToBoxAdapter(child: SizedBox(height: 30)),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSummaryHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _summaryChip(
            'Present',
            '$_presentCount',
            Colors.white,
            Icons.check_circle_rounded,
          ),
          Container(height: 40, width: 1, color: Colors.white.withOpacity(0.2)),
          _summaryChip(
            'Absent',
            '$_absentCount',
            Colors.white,
            Icons.cancel_rounded,
          ),
          Container(height: 40, width: 1, color: Colors.white.withOpacity(0.2)),
          _summaryChip(
            'Total',
            '${_records.length}',
            Colors.white,
            Icons.list_alt_rounded,
          ),
        ],
      ),
    );
  }

  Widget _summaryChip(String label, String value, Color color, IconData icon) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color.withOpacity(0.8), size: 16),
            const SizedBox(width: 6),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: color,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label.toUpperCase(),
          style: TextStyle(
            fontSize: 10,
            color: color.withOpacity(0.6),
            fontWeight: FontWeight.w800,
            letterSpacing: 1,
          ),
        ),
      ],
    );
  }

  Widget _buildRecordCard(AttendanceRecordModel record) {
    final isPresent = record.isPresent;
    final statusColor = isPresent ? AppColors.success : AppColors.error;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: AppColors.softShadow,
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Icon(
                isPresent ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: statusColor,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    record.courseCode,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: statusColor,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    record.courseName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.3,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.calendar_today_rounded, size: 12, color: AppColors.textMuted.withOpacity(0.6)),
                      const SizedBox(width: 4),
                      Text(
                        record.date,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(width: 4, height: 4, decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.textMuted.withOpacity(0.3))),
                      const SizedBox(width: 8),
                      Icon(Icons.access_time_rounded, size: 12, color: AppColors.textMuted.withOpacity(0.6)),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat('h:mm a').format(record.timestamp.toLocal()),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.history_rounded, size: 56, color: Colors.grey),
            SizedBox(height: 12),
            Text(
              'No attendance records yet.',
              style: TextStyle(color: Colors.grey, fontSize: 15),
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
            onPressed: _loadRecords,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
          ),
        ],
      ),
    );
  }
}
