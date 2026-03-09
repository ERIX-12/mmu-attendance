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
        centerTitle: true,
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          _session.title.isNotEmpty ? _session.title : 'Session Details',
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w900,
            fontSize: 22,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          if (_session.isActive)
            IconButton(
              onPressed: _isLoading ? null : _refreshQr,
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.qr_code_2_rounded, color: AppColors.primary, size: 20),
              ),
              tooltip: 'Refresh QR',
            ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 10),
            _buildStatusCard(),
            const SizedBox(height: 24),
            _buildInfoCard(),
            const SizedBox(height: 24),
            if (_session.isActive) _buildQrCard(),
            if (_session.isActive) const SizedBox(height: 24),
            _buildActionButtons(),
            const SizedBox(height: 32),
            _buildAttendanceList(),
            const SizedBox(height: 48),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard() {
    Color statusColor;
    String statusLabel;
    IconData statusIcon;
    Gradient statusGradient;

    switch (_session.status) {
      case 'active':
        statusColor = AppColors.success;
        statusLabel = 'SESSION IS LIVE';
        statusIcon = Icons.sensors_rounded;
        statusGradient = LinearGradient(colors: [statusColor, statusColor.withOpacity(0.8)]);
        break;
      case 'completed':
        statusColor = AppColors.textMuted;
        statusLabel = 'SESSION COMPLETED';
        statusIcon = Icons.task_alt_rounded;
        statusGradient = LinearGradient(colors: [statusColor, statusColor.withOpacity(0.7)]);
        break;
      default:
        statusColor = AppColors.warning;
        statusLabel = 'SESSION PENDING';
        statusIcon = Icons.hourglass_empty_rounded;
        statusGradient = const LinearGradient(colors: [Color(0xFFFFA000), Color(0xFFFFC107)]);
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.08),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(color: statusColor.withOpacity(0.12), width: 1.5),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(statusIcon, color: statusColor, size: 28),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusLabel,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    color: statusColor,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${_attendanceRecords.length} Students Checked In',
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
        ],
      ),
    );
  }

  Widget _buildInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: AppColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'SESSION INFORMATION',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: AppColors.textMuted,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 24),
          _infoRow(Icons.book_rounded, 'Course', '${_session.courseCode} · ${_session.courseName}'),
          _divider(),
          _infoRow(Icons.calendar_month_rounded, 'Date', _session.date),
          _divider(),
          _infoRow(Icons.access_time_filled_rounded, 'Time Range', '${_session.startTime} — ${_session.endTime}'),
          if (_session.venue != null && _session.venue!.isNotEmpty) ... [
            _divider(),
            _infoRow(Icons.location_on_rounded, 'Venue Location', _session.venue!),
          ],
          if (_session.topic != null && _session.topic!.isNotEmpty) ... [
            _divider(),
            _infoRow(Icons.topic_rounded, 'Topic Title', _session.topic!),
          ],
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary.withOpacity(0.5), size: 18),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    color: AppColors.textMuted.withOpacity(0.6),
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() => Padding(
        padding: const EdgeInsets.only(left: 34),
        child: Divider(color: AppColors.divider.withOpacity(0.5), height: 1),
      );

  Widget _buildQrCard() {
    final qrImage = _session.qrCodeImage;
    if (qrImage == null || qrImage.isEmpty) return const SizedBox();

    Widget qrWidget;
    try {
      final base64Data = qrImage.contains(',') ? qrImage.split(',')[1] : qrImage;
      qrWidget = ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Image.memory(
          base64Decode(base64Data),
          width: 240,
          height: 240,
          fit: BoxFit.contain,
        ),
      );
    } catch (e) {
      qrWidget = const Icon(Icons.qr_code_rounded, size: 120, color: AppColors.primary);
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: AppColors.softShadow,
      ),
      child: Column(
        children: [
          const Text(
            'SCAN TO MARK ATTENDANCE',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: 2,
            ),
          ),
          const SizedBox(height: 32),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(color: const Color(0xFFE2E8F0), width: 2),
            ),
            child: qrWidget,
          ),
          const SizedBox(height: 24),
          Text(
            'Keep this QR visible for students',
            style: TextStyle(fontSize: 13, color: AppColors.textMuted.withOpacity(0.8), fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    if (_session.isInactive) {
      return SizedBox(
        width: double.infinity,
        height: 64,
        child: ElevatedButton(
          onPressed: _isLoading ? null : _activateSession,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.success,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            elevation: 8,
            shadowColor: AppColors.success.withOpacity(0.4),
          ),
          child: _isLoading
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.play_arrow_rounded, size: 28),
                    SizedBox(width: 12),
                    Text('ACTIVATE SESSION', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                  ],
                ),
        ),
      );
    } else if (_session.isActive) {
      return SizedBox(
        width: double.infinity,
        height: 64,
        child: ElevatedButton(
          onPressed: _isLoading ? null : _deactivateSession,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.error,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            elevation: 8,
            shadowColor: AppColors.error.withOpacity(0.4),
          ),
          child: _isLoading
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
              : const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.stop_rounded, size: 28),
                    SizedBox(width: 12),
                    Text('END SESSION', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                  ],
                ),
        ),
      );
    }
    return const SizedBox();
  }

  Widget _buildAttendanceList() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(32),
        boxShadow: AppColors.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'STUDENT LOGS',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textMuted,
                  letterSpacing: 1.5,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_attendanceRecords.length} Present',
                  style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w900),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.divider, height: 1),
          const SizedBox(height: 8),
          if (_loadingAttendance)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 3),
              ),
            )
          else if (_attendanceRecords.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  children: [
                    Icon(Icons.person_off_rounded, size: 48, color: AppColors.textMuted.withOpacity(0.2)),
                    const SizedBox(height: 16),
                    Text(
                      _session.isInactive
                          ? 'Activate session to begin.'
                          : 'No check-ins recorded yet.',
                      style: TextStyle(color: AppColors.textMuted.withOpacity(0.5), fontWeight: FontWeight.w600),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _attendanceRecords.length,
              separatorBuilder: (_, __) => const SizedBox(height: 4),
              itemBuilder: (ctx, i) {
                final r = _attendanceRecords[i];
                final isPresent = r['status'] == 'present';
                final student = r['student'] ?? {};
                final name = '${student['first_name'] ?? ''} ${student['last_name'] ?? ''}'.trim();
                final displayName = name.isNotEmpty ? name : (student['username'] ?? 'Unknown');
                
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primary.withOpacity(0.1),
                        child: Text(
                          displayName.isNotEmpty ? displayName[0].toUpperCase() : 'S',
                          style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 13),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              displayName,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                            ),
                            Text(
                              student['student_number'] ?? student['username'] ?? 'ID Unknown',
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted.withOpacity(0.6), fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_rounded, color: AppColors.success, size: 16),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
