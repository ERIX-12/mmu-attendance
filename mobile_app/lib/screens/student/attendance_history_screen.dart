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
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Attendance Records',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 22,
          ),
        ),
        actions: [
          IconButton(
            onPressed: _loadRecords,
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? _buildError()
              : RefreshIndicator(
                  onRefresh: _loadRecords,
                  color: AppColors.primary,
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(child: _buildSummaryHeader()),
                      _records.isEmpty
                          ? SliverToBoxAdapter(child: _buildEmpty())
                          : SliverList(
                              delegate: SliverChildBuilderDelegate(
                                (_, i) => _buildRecordCard(_records[i]),
                                childCount: _records.length,
                              ),
                            ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSummaryHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _summaryChip(
              'Present',
              '$_presentCount',
              AppColors.success,
              Icons.check_circle_rounded,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _summaryChip(
              'Absent',
              '$_absentCount',
              AppColors.error,
              Icons.cancel_rounded,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _summaryChip(
              'Total',
              '${_records.length}',
              AppColors.primary,
              Icons.list_alt_rounded,
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryChip(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: color.withOpacity(0.8),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecordCard(AttendanceRecordModel record) {
    final isPresent = record.isPresent;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: (isPresent ? AppColors.success : AppColors.error).withOpacity(0.1),
          ),
          child: Icon(
            isPresent ? Icons.check_rounded : Icons.close_rounded,
            color: isPresent ? AppColors.success : AppColors.error,
            size: 22,
          ),
        ),
        title: Text(
          '${record.courseCode} — ${record.courseName}',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(
              record.date,
              style: TextStyle(fontSize: 12, color: Colors.grey[500]),
            ),
            Text(
              DateFormat('MMM d, y · h:mm a').format(record.timestamp.toLocal()),
              style: TextStyle(fontSize: 11, color: Colors.grey[400]),
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: (isPresent ? AppColors.success : AppColors.error).withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            isPresent ? 'Present' : 'Absent',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: isPresent ? AppColors.success : AppColors.error,
            ),
          ),
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
