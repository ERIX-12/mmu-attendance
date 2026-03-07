// lib/widgets/attendance_badge.dart

import 'package:flutter/material.dart';
import '../utils/constants.dart';

class AttendanceBadge extends StatelessWidget {
  final int percentage;

  const AttendanceBadge({super.key, required this.percentage});

  Color get _color {
    if (percentage >= 80) return AppColors.success;
    if (percentage >= 60) return AppColors.warning;
    return AppColors.error;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: _color.withOpacity(0.1),
        border: Border.all(color: _color.withOpacity(0.4), width: 2),
      ),
      child: Center(
        child: Text(
          '$percentage%',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            color: _color,
          ),
        ),
      ),
    );
  }
}
