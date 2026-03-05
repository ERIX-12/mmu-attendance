from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    student_number = serializers.CharField(source='profile.student_number', read_only=True)
    staff_id = serializers.CharField(source='profile.staff_id', read_only=True)
    faculty = serializers.CharField(source='profile.faculty', read_only=True)
    department = serializers.CharField(source='profile.department', read_only=True)
    year_of_study = serializers.IntegerField(source='profile.year_of_study', read_only=True)
    profile_picture = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role', 
                  'student_number', 'staff_id', 'faculty', 'department', 'year_of_study', 'profile_picture', 'is_staff', 'is_superuser', 'is_active']
    
    def get_role(self, obj):
        try:
            return obj.profile.role
        except Exception:
            if obj.is_superuser: return 'admin'
            if obj.is_staff: return 'lecturer'
            return 'student'

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
        
    def get_profile_picture(self, obj):
        try:
            if obj.profile.profile_picture:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.profile.profile_picture.url)
                return obj.profile.profile_picture.url
        except Exception:
            return None
        return None


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            data['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return data


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint that returns JWT tokens
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Get user role (for now, using is_staff/is_superuser as simple role system)
        user_role = 'student'
        if user.is_superuser:
            user_role = 'admin'
        elif user.is_staff:
            user_role = 'lecturer'
        
        response_data = {
            'access': str(access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user_role,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    """
    Refresh JWT token
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken(refresh_token)
        access_token = refresh.access_token
        
        return Response({
            'access': str(access_token)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Logout endpoint (blacklist refresh token)
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def blacklist_token_view(request):
    """
    Blacklist JWT token endpoint
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({'message': 'Token successfully blacklisted'}, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default='student')
    student_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    staff_id = serializers.CharField(write_only=True, required=False, allow_blank=True)
    faculty = serializers.CharField(write_only=True, required=False, allow_blank=True)
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)
    year_of_study = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'confirm_password', 
                  'role', 'student_number', 'staff_id', 'faculty', 'department', 'year_of_study']
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        student_number = validated_data.pop('student_number', '')
        staff_id = validated_data.pop('staff_id', '')
        faculty = validated_data.pop('faculty', '')
        department = validated_data.pop('department', '')
        year_of_study = validated_data.pop('year_of_study', None)
        validated_data.pop('confirm_password')
        
        # Determine staff status
        is_staff = role in ['lecturer', 'admin']
        is_superuser = role == 'admin'
        
        user = User.objects.create_user(
            **validated_data,
            is_staff=is_staff,
            is_superuser=is_superuser
        )
        
        UserProfile.objects.create(
            user=user,
            role=role,
            student_number=student_number,
            staff_id=staff_id,
            faculty=faculty,
            department=department,
            year_of_study=year_of_study
        )
        return user


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        response_data = {
            'access': str(access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    """
    Mock forgot password endpoint
    """
    email = request.data.get('email')
    username = request.data.get('username')
    
    if not email and not username:
        return Response({'error': 'Please provide an email or username.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        if email:
            user = User.objects.get(email=email)
        else:
            user = User.objects.get(username=username)
            
        temp_password = "Temp@12345"
        user.set_password(temp_password)
        user.save()
        
        return Response({
            'message': 'Password has been reset successfully.',
            'temp_password': temp_password,
            'note': 'In a real production app, this would be sent to your email.'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'No account found with these details.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def users_list_view(request):
    """
    Get list of users (for admin/lecturer use) or create new user
    """
    if request.method == 'POST':
        # Admin user creation
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            response_data = {
                'user': UserSerializer(user).data,
                'message': 'User created successfully'
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET request
    role = request.query_params.get('role')
    users = User.objects.all().select_related('profile')
    
    if role:
        users = users.filter(profile__role=role)
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PATCH'])
def user_profile_view(request):
    """
    Get or update current user profile
    """
    if request.method == 'GET':
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    elif request.method == 'PATCH':
        user = request.user
        
        # Update User basic info
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        if 'email' in request.data:
            user.email = request.data.get('email')
        user.save()
        
        # Update UserProfile
        profile = user.profile
        if 'faculty' in request.data:
            profile.faculty = request.data.get('faculty')
        if 'department' in request.data:
            profile.department = request.data.get('department')
        if 'year_of_study' in request.data:
            try:
                profile.year_of_study = int(request.data.get('year_of_study'))
            except (ValueError, TypeError):
                profile.year_of_study = None
            
        if 'profile_picture' in request.FILES:
            profile.profile_picture = request.FILES['profile_picture']
            
        profile.save()
        
        serializer = UserSerializer(user, context={'request': request})
        return Response({
            'user': serializer.data,
            'message': 'Profile updated successfully'
        }, status=status.HTTP_200_OK)
@api_view(['GET', 'PATCH', 'DELETE'])
def user_detail_view(request, user_id):
    """
    Retrieve, update or delete a specific user
    """
    # Only admins can manage users
    if not request.user.is_superuser:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
    user = get_object_or_404(User, id=user_id)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
        
    elif request.method == 'PATCH':
        # Update User basic info
        user_data = request.data
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.email = user_data.get('email', user.email)
        user.save()
        
        # Update UserProfile
        profile = user.profile
        profile.role = user_data.get('role', profile.role)
        profile.student_number = user_data.get('student_number', profile.student_number)
        profile.staff_id = user_data.get('staff_id', profile.staff_id)
        profile.faculty = user_data.get('faculty', profile.faculty)
        profile.department = user_data.get('department', profile.department)
        if 'year_of_study' in user_data:
            try:
                profile.year_of_study = int(user_data['year_of_study'])
            except (ValueError, TypeError):
                pass
        profile.save()
        
        # Sync staff status if role changed
        user.is_staff = profile.role in ['lecturer', 'admin']
        user.is_superuser = profile.role == 'admin'
        user.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User updated successfully'
        })
        
    elif request.method == 'DELETE':
        # Don't let users delete themselves
        if request.user.id == user.id:
            return Response({'error': 'You cannot delete yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
        user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
