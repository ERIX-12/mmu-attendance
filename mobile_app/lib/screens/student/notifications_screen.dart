// lib/screens/student/notifications_screen.dart

import 'package:flutter/material.dart';
import '../../models/notification_model.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';
import 'package:intl/intl.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _api = ApiService();
  List<NotificationModel> _notifications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final notifications = await _api.getNotifications();
      if (!mounted) return;
      setState(() {
        _notifications = notifications;
        _isLoading = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(NotificationModel notification) async {
    if (notification.isRead) return;
    
    // Optimistic update
    setState(() {
      final index = _notifications.indexWhere((n) => n.id == notification.id);
      if (index != -1) {
        _notifications[index] = NotificationModel(
          id: notification.id,
          title: notification.title,
          message: notification.message,
          isRead: true,
          createdAt: notification.createdAt,
        );
      }
    });

    try {
      await _api.markNotificationRead(notification.id);
    } catch (e) {
      // Revert if failed
      if (!mounted) return;
      setState(() {
        final index = _notifications.indexWhere((n) => n.id == notification.id);
        if (index != -1) {
          _notifications[index] = NotificationModel(
            id: notification.id,
            title: notification.title,
            message: notification.message,
            isRead: false,
            createdAt: notification.createdAt,
          );
        }
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to mark as read: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      body: RefreshIndicator(
        onRefresh: _loadNotifications,
        color: AppColors.primary,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading && _notifications.isEmpty) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }
    
    if (_error != null && _notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.error),
            const SizedBox(height: 16),
            Text('Failed to load notifications', style: TextStyle(color: AppColors.textPrimary.withOpacity(0.7))),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadNotifications,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Retry'),
            )
          ],
        ),
      );
    }

    if (_notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_off_outlined, size: 64, color: AppColors.textMuted.withOpacity(0.5)),
            const SizedBox(height: 16),
            Text(
              'No notifications',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      itemCount: _notifications.length,
      itemBuilder: (context, index) {
        final notification = _notifications[index];
        final isUnread = !notification.isRead;
        
        return GestureDetector(
          onTap: () => _markAsRead(notification),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isUnread ? Colors.blue.withOpacity(0.05) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isUnread ? Colors.blue.withOpacity(0.2) : Colors.transparent,
                width: 1,
              ),
              boxShadow: AppColors.softShadow,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isUnread ? Colors.blue.withOpacity(0.1) : AppColors.background,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.notifications_active_rounded,
                    color: isUnread ? Colors.blue : AppColors.textMuted,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: isUnread ? FontWeight.w800 : FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          Text(
                            DateFormat('MMM d, h:mm a').format(notification.createdAt),
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.textMuted,
                              fontWeight: isUnread ? FontWeight.w600 : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        notification.message,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isUnread) ...[
                  const SizedBox(width: 12),
                  Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.only(top: 6),
                    decoration: const BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                    ),
                  ),
                ]
              ],
            ),
          ),
        );
      },
    );
  }
}
