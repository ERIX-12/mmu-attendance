// lib/models/user_model.dart

class UserModel {
  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final String? studentNumber;
  final String? staffId;
  final String? faculty;
  final String? department;
  final int? yearOfStudy;
  final String? profilePicture;
  final bool isStaff;
  final bool isSuperuser;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.studentNumber,
    this.staffId,
    this.faculty,
    this.department,
    this.yearOfStudy,
    this.profilePicture,
    this.isStaff = false,
    this.isSuperuser = false,
  });

  String get fullName => '$firstName $lastName'.trim().isNotEmpty
      ? '$firstName $lastName'.trim()
      : username;

  String get initials {
    if (firstName.isNotEmpty && lastName.isNotEmpty) {
      return '${firstName[0]}${lastName[0]}'.toUpperCase();
    } else if (firstName.isNotEmpty) {
      return firstName[0].toUpperCase();
    }
    return username[0].toUpperCase();
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      role: json['role'] ?? 'student',
      studentNumber: json['student_number'],
      staffId: json['staff_id'],
      faculty: json['faculty'],
      department: json['department'],
      yearOfStudy: json['year_of_study'],
      profilePicture: json['profile_picture'],
      isStaff: json['is_staff'] ?? false,
      isSuperuser: json['is_superuser'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'first_name': firstName,
      'last_name': lastName,
      'role': role,
      'student_number': studentNumber,
      'staff_id': staffId,
      'faculty': faculty,
      'department': department,
      'year_of_study': yearOfStudy,
      'profile_picture': profilePicture,
      'is_staff': isStaff,
      'is_superuser': isSuperuser,
    };
  }
}


