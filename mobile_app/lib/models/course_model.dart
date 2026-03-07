// lib/models/course_model.dart

class CourseModel {
  final int id;
  final String code;
  final String name;
  final String? description;
  final String? faculty;
  final String? department;
  final int credits;
  final int studentCount;

  CourseModel({
    required this.id,
    required this.code,
    required this.name,
    this.description,
    this.faculty,
    this.department,
    this.credits = 3,
    this.studentCount = 0,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] ?? 0,
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      faculty: json['faculty'],
      department: json['department'],
      credits: json['credits'] ?? 3,
      studentCount: json['student_count'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'description': description,
      'faculty': faculty,
      'department': department,
      'credits': credits,
      'student_count': studentCount,
    };
  }
}

// lib/models/attendance_session_model.dart

class AttendanceSessionModel {
  final String id;
  final int courseId;
  final String courseCode;
  final String courseName;
  final String lecturerName;
  final String title;
  final String? description;
  final String? topic;
  final String date;
  final String startTime;
  final String endTime;
  final String? venue;
  final String status;
  final String? qrCodeData;
  final String? qrCodeImage;
  final String? qrCodeSecret;
  final DateTime? createdAt;
  final int attendanceCount;

  AttendanceSessionModel({
    required this.id,
    required this.courseId,
    required this.courseCode,
    required this.courseName,
    required this.lecturerName,
    required this.title,
    this.description,
    this.topic,
    required this.date,
    required this.startTime,
    required this.endTime,
    this.venue,
    required this.status,
    this.qrCodeData,
    this.qrCodeImage,
    this.qrCodeSecret,
    this.createdAt,
    this.attendanceCount = 0,
  });

  bool get isActive => status == 'active';
  bool get isCompleted => status == 'completed';
  bool get isInactive => status == 'inactive';

  factory AttendanceSessionModel.fromJson(Map<String, dynamic> json) {
    final course = json['course'];
    final lecturer = json['lecturer'];
    return AttendanceSessionModel(
      id: json['id'] ?? '',
      courseId: course is Map ? (course['id'] ?? 0) : (json['course_id'] ?? 0),
      courseCode: course is Map ? (course['code'] ?? '') : (json['course_code'] ?? ''),
      courseName: course is Map ? (course['name'] ?? '') : (json['course_name'] ?? ''),
      lecturerName: lecturer is Map
          ? '${lecturer['first_name'] ?? ''} ${lecturer['last_name'] ?? ''}'.trim()
          : (json['lecturer_name'] ?? ''),
      title: json['title'] ?? '',
      description: json['description'],
      topic: json['topic'],
      date: json['date'] ?? '',
      startTime: json['start_time'] ?? '',
      endTime: json['end_time'] ?? '',
      venue: json['venue'],
      status: json['status'] ?? 'inactive',
      qrCodeData: json['qr_code_data'],
      qrCodeImage: json['qr_code_image'],
      qrCodeSecret: json['qr_code_secret'],
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
      attendanceCount: json['attendance_count'] ?? 0,
    );
  }
}

class AttendanceSummaryModel {
  final int courseId;
  final String courseCode;
  final String courseName;
  final int attendancePercentage;
  final bool belowThreshold;
  final int attendedSessions;
  final int totalSessions;

  AttendanceSummaryModel({
    required this.courseId,
    required this.courseCode,
    required this.courseName,
    required this.attendancePercentage,
    required this.belowThreshold,
    required this.attendedSessions,
    required this.totalSessions,
  });

  factory AttendanceSummaryModel.fromJson(Map<String, dynamic> json) {
    return AttendanceSummaryModel(
      courseId: json['course_id'] ?? 0,
      courseCode: json['course_code'] ?? '',
      courseName: json['course_name'] ?? '',
      attendancePercentage: (json['attendance_percentage'] as num?)?.toInt() ?? 0,
      belowThreshold: json['below_threshold'] ?? false,
      attendedSessions: json['attended_sessions'] ?? 0,
      totalSessions: json['total_sessions'] ?? 0,
    );
  }
}

class AttendanceRecordModel {
  final int id;
  final DateTime timestamp;
  final String status;
  final String courseCode;
  final String courseName;
  final String date;

  AttendanceRecordModel({
    required this.id,
    required this.timestamp,
    required this.status,
    required this.courseCode,
    required this.courseName,
    required this.date,
  });

  bool get isPresent => status == 'present';

  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    final sessionInfo = json['session_info'] ?? {};
    return AttendanceRecordModel(
      id: json['id'] ?? 0,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp']) ?? DateTime.now()
          : DateTime.now(),
      status: json['status'] ?? 'present',
      courseCode: sessionInfo['course_code'] ?? '',
      courseName: sessionInfo['course_name'] ?? '',
      date: sessionInfo['date'] ?? '',
    );
  }
}
