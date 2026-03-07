// lib/screens/lecturer/session_detail_screen.dart

import 'dart:convert';
import 'package:flutter/material.dart';
import '../../models/course_model.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';

class SessionDetailScreen extends StatefulWidget {
  final AttendanceSessionModel session;
  const SessionDetailScreen({super.key, required this.session});

  @override
  State<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends State<SessionDetailScreen> {
  final ApiService _api = ApiService();
  late AttendanceSessionModel _session;
  bool _isLoading = false;
  List<Map<String, dynamic>> _attendanceRecords = [];
  bool _loadingAttendance = false;

  @override
  void initState() {
    super.initState();
    _session = widget.session;
    if (_session.isActive || _session.isCompleted) {
      _loadAttendance();
    }
  }

  Future<void> _loadAttendance() async {
    setState(() => _loadingAttendance = true);
    try {
      final records = await _api.getSessionAttendance(_session.id);
      setState(() {
        _attendanceRecords = records;
        _loadingAttendance = false;
      });
    } catch (_) {
      setState(() => _loadingAttendance = false);
    }
  }

  Future<void> _activateSession() async {
    setState(() => _isLoading = true);
    final result = await _api.activateSession(_session.id);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success'] == true) {
      setState(() => _session = result['session']);
      _loadAttendance();
      _showSnack('Session activated! QR code is now live.', true);
    } else {
      _showSnack(result['error'] ?? 'Failed to activate', false);
    }
  }

  Future<void> _deactivateSession() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('End Session?'),
        content: const Text('This will close the session and mark absent students. This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('End Session', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _isLoading = true);
    final result = await _api.deactivateSession(_session.id);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success'] == true) {
      setState(() => _session = result['session']);
      _loadAttendance();
      _showSnack('Session ended successfully.', true);
    } else {
      _showSnack(result['error'] ?? 'Failed to end session', false);
    }
  }

  Future<void> _refreshQr() async {
    setState(() => _isLoading = true);
    final result = await _api.refreshQrCode(_session.id);
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (result['success'] == true) {
      setState(() => _session = result['session']);
      _showSnack('QR code refreshed!', true);
    } else {
      _showSnack(result['error'] ?? 'Failed to refresh QR', false);
    }
  }

  void _showSnack(String msg, bool success) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: success ? AppColors.success : AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        title: Text(
          _session.title.isNotEmpty ? _session.title : 'Session Detail',
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        actions: [
          if (_session.isActive)
            IconButton(
              onPressed: _isLoading ? null : _refreshQr,
              icon: const Icon(Icons.qr_code_2_rounded, color: AppColors.primary),
              tooltip: 'Refresh QR',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatusCard(),
            const SizedBox(height: 16),
            _buildInfoCard(),
            const SizedBox(height: 16),
            if (_session.isActive) _buildQrCard(),
            if (_session.isActive) const SizedBox(height: 16),
            _buildActionButtons(),
            const SizedBox(height: 16),
            _buildAttendanceList(),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
    Color statusColor;
    String statusLabel;
    IconData statusIcon;

    switch (_session.status) {
      case 'active':
        statusColor = AppColors.success;
        statusLabel = 'LIVE';
        statusIcon = Icons.radio_button_checked_rounded;
        break;
      case 'completed':
        statusColor = Colors.grey;
        statusLabel = 'COMPLETED';
        statusIcon = Icons.check_circle_rounded;
        break;
      default:
        statusColor = AppColors.warning;
        statusLabel = 'PENDING';
        statusIcon = Icons.schedule_rounded;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(statusIcon, color: statusColor, size: 28),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                statusLabel,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: statusColor,
                ),
              ),
              Text(
                '${_attendanceRecords.length} students checked in',
                style: TextStyle(fontSize: 13, color: statusColor.withOpacity(0.8)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Session Info', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const Divider(height: 20),
          _infoRow('Course', '${_session.courseCode} · ${_session.courseName}'),
          _infoRow('Date', _session.date),
          _infoRow('Time', '${_session.startTime} — ${_session.endTime}'),
          if (_session.venue != null && _session.venue!.isNotEmpty)
            _infoRow('Venue', _session.venue!),
          if (_session.topic != null && _session.topic!.isNotEmpty)
            _infoRow('Topic', _session.topic!),
          if (_session.description != null && _session.description!.isNotEmpty)
            _infoRow('Description', _session.description!),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: TextStyle(fontSize: 13, color: Colors.grey[500], fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQrCard() {
    final qrImage = _session.qrCodeImage;
    if (qrImage == null || qrImage.isEmpty) return const SizedBox();

    // Parse base64 image
    Widget qrWidget;
    try {
      final base64Data = qrImage.contains(',') ? qrImage.split(',')[1] : qrImage;
      qrWidget = Image.memory(
        base64Decode(base64Data),
        width: 220,
        height: 220,
        fit: BoxFit.contain,
      );
    } catch (e) {
      qrWidget = const Icon(Icons.qr_code_rounded, size: 100, color: AppColors.primary);
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        children: [
          const Text(
            'QR Code',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 4),
          Text(
            'Students scan this to mark attendance',
            style: TextStyle(fontSize: 13, color: Colors.grey[500]),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.divider, width: 1.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: qrWidget,
          ),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: _isLoading ? null : _refreshQr,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Refresh QR Code'),
            style: TextButton.styleFrom(foregroundColor: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        if (_session.isInactive)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _activateSession,
              icon: _isLoading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.play_arrow_rounded),
              label: const Text('Activate Session', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
            ),
          )
        else if (_session.isActive)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoading ? null : _deactivateSession,
              icon: _isLoading
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.stop_rounded),
              label: const Text('End Session', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildAttendanceList() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'Attendance',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              const Spacer(),
              Text(
                '${_attendanceRecords.length} present',
                style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const Divider(height: 20),
          if (_loadingAttendance)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          else if (_attendanceRecords.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Text(
                  _session.isInactive
                      ? 'Activate the session to start tracking.'
                      : 'No students have marked attendance yet.',
                  style: const TextStyle(color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else
            ..._attendanceRecords.map((r) {
              final isPresent = r['status'] == 'present';
              final student = r['student'] ?? {};
              final name = '${student['first_name'] ?? ''} ${student['last_name'] ?? ''}'.trim();
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  radius: 18,
                  backgroundColor: isPresent
                      ? AppColors.success.withOpacity(0.1)
                      : AppColors.error.withOpacity(0.1),
                  child: Icon(
                    isPresent ? Icons.check_rounded : Icons.close_rounded,
                    size: 18,
                    color: isPresent ? AppColors.success : AppColors.error,
                  ),
                ),
                title: Text(
                  name.isNotEmpty ? name : (student['username'] ?? 'Student'),
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                ),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (isPresent ? AppColors.success : AppColors.error).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    isPresent ? 'Present' : 'Absent',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isPresent ? AppColors.success : AppColors.error,
                    ),
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }
}
