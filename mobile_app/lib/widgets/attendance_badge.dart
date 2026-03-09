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
    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          width: 58,
          height: 58,
          child: CircularProgressIndicator(
            value: percentage / 100,
            strokeWidth: 5,
            backgroundColor: _color.withOpacity(0.12),
            valueColor: AlwaysStoppedAnimation<Color>(_color),
            strokeCap: StrokeCap.round,
          ),
        ),
        Text(
          '$percentage%',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }
}
