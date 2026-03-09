// lib/screens/student/scan_qr_screen.dart

import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/api_service.dart';
import '../../utils/constants.dart';

class ScanQrScreen extends StatefulWidget {
  const ScanQrScreen({super.key});

  @override
  State<ScanQrScreen> createState() => _ScanQrScreenState();
}

class _ScanQrScreenState extends State<ScanQrScreen>
    with WidgetsBindingObserver {
  final ApiService _api = ApiService();
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;
  bool _torchOn = false;
  String? _result;
  bool _isSuccess = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller.dispose();
    super.dispose();
  }

  Future<void> _processQrCode(String qrData) async {
    if (_isProcessing) return;

    // QR format: session:<uuid>:<secret>
    final parts = qrData.split(':');
    if (parts.length < 3 || parts[0] != 'session') {
      setState(() {
        _result = 'Invalid QR code. Please scan the correct MMU attendance QR.';
        _isSuccess = false;
      });
      return;
    }

    setState(() => _isProcessing = true);
    await _controller.stop();

    final sessionId = parts[1];
    final secret = parts.sublist(2).join(':');

    try {
      final result = await _api.markAttendance(sessionId, secret);
      setState(() {
        _isSuccess = result['success'] == true;
        _result = result['success'] == true
            ? result['message'] ?? 'Attendance marked successfully! ✅'
            : result['error'] ?? 'Failed to mark attendance';
        _isProcessing = false;
      });
    } catch (e) {
      setState(() {
        _result = 'Connection error. Check your network.';
        _isSuccess = false;
        _isProcessing = false;
      });
    }
  }

  void _resetScanner() {
    setState(() {
      _result = null;
      _isSuccess = false;
    });
    _controller.start();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Mark Attendance',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w900,
            fontSize: 22,
            letterSpacing: -0.5,
          ),
        ),
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              setState(() => _torchOn = !_torchOn);
              _controller.toggleTorch();
            },
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _torchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                color: _torchOn ? Colors.yellow : Colors.white,
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          // Camera view - using a more modern camera layout
          if (_result == null)
            MobileScanner(
              controller: _controller,
              onDetect: (capture) {
                final barcodes = capture.barcodes;
                if (barcodes.isNotEmpty) {
                  final value = barcodes.first.rawValue;
                  if (value != null) {
                    _processQrCode(value);
                  }
                }
              },
            ),

          // Scanning overlay
          if (_result == null) _buildScanOverlay(),

          // Glassmorphic Loading indicator
          if (_isProcessing)
            Container(
              color: Colors.black.withOpacity(0.7),
              child: BackdropFilter(
                filter: ColorFilter.mode(Colors.black.withOpacity(0.2), BlendMode.darken),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(
                        color: AppColors.primary,
                        strokeWidth: 5,
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Verifying Status...',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Result overlay - modern and premium
          if (_result != null && !_isProcessing) _buildResultOverlay(),
        ],
      ),
    );
  }

  Widget _buildScanOverlay() {
    return Column(
      children: [
        Expanded(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Instruction Text Top
                Text(
                  'SCAN ATTENDANCE',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 3,
                  ),
                ),
                const SizedBox(height: 32),
                
                // Scanner frame with premium styling
                Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
                    borderRadius: BorderRadius.circular(40),
                  ),
                  child: Stack(
                    children: [
                      // Animated scanning line could be added here
                      ..._buildCorners(),
                    ],
                  ),
                ),
                
                const SizedBox(height: 48),
                
                // Tip Container
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  margin: const EdgeInsets.symmetric(horizontal: 40),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.1), width: 1),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.lightbulb_rounded, color: AppColors.primary, size: 16),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          'Place the QR code inside the frame to mark your attendance.',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          textAlign: TextAlign.left,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildCorners() {
    const size = 42.0;
    const thickness = 6.0;
    const color = AppColors.primary;
    final radius = Radius.circular(30);

    return [
      // Top-left
      Positioned(
        top: 0,
        left: 0,
        child: Container(
          width: size,
          height: thickness,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(topLeft: radius),
          ),
        ),
      ),
      Positioned(
        top: 0,
        left: 0,
        child: Container(
          width: thickness,
          height: size,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(topLeft: radius),
          ),
        ),
      ),
      // Top-right
      Positioned(
        top: 0,
        right: 0,
        child: Container(
          width: size,
          height: thickness,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(topRight: radius),
          ),
        ),
      ),
      Positioned(
        top: 0,
        right: 0,
        child: Container(
          width: thickness,
          height: size,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(topRight: radius),
          ),
        ),
      ),
      // Bottom-left
      Positioned(
        bottom: 0,
        left: 0,
        child: Container(
          width: size,
          height: thickness,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(bottomLeft: radius),
          ),
        ),
      ),
      Positioned(
        bottom: 0,
        left: 0,
        child: Container(
          width: thickness,
          height: size,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(bottomLeft: radius),
          ),
        ),
      ),
      // Bottom-right
      Positioned(
        bottom: 0,
        right: 0,
        child: Container(
          width: size,
          height: thickness,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(bottomRight: radius),
          ),
        ),
      ),
      Positioned(
        bottom: 0,
        right: 0,
        child: Container(
          width: thickness,
          height: size,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.only(bottomRight: radius),
          ),
        ),
      ),
    ];
  }

  Widget _buildResultOverlay() {
    final statusColor = _isSuccess ? AppColors.success : AppColors.error;
    
    return Container(
      color: Colors.black.withOpacity(0.9),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon with glow
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: statusColor.withOpacity(0.1),
                    ),
                  ),
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: statusColor.withOpacity(0.2),
                    ),
                  ),
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: statusColor,
                      boxShadow: [
                        BoxShadow(
                          color: statusColor.withOpacity(0.4),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Icon(
                      _isSuccess ? Icons.check_rounded : Icons.close_rounded,
                      size: 48,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              Text(
                _isSuccess ? 'VERIFIED' : 'FAILED',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: statusColor,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _result ?? '',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.7),
                  fontWeight: FontWeight.w500,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 60),
              
              // Action Button
              SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: _isSuccess ? () => Navigator.pop(context) : _resetScanner,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isSuccess ? AppColors.success : AppColors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 10,
                    shadowColor: (_isSuccess ? AppColors.success : AppColors.primary).withOpacity(0.4),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(_isSuccess ? Icons.done_all_rounded : Icons.refresh_rounded, size: 24),
                      const SizedBox(width: 12),
                      Text(
                        _isSuccess ? 'DONE' : 'TRY AGAIN',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (!_isSuccess) ... [
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Cancel and Exit',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
