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
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: const Text(
          'Scan QR Code',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        actions: [
          IconButton(
            onPressed: () {
              setState(() => _torchOn = !_torchOn);
              _controller.toggleTorch();
            },
            icon: Icon(
              _torchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
              color: _torchOn ? Colors.yellow : Colors.white,
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Camera view
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

          // Loading indicator
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    CircularProgressIndicator(color: Colors.white),
                    SizedBox(height: 16),
                    Text(
                      'Marking attendance...',
                      style: TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),

          // Result overlay
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
                // Scanner frame
                Container(
                  width: 260,
                  height: 260,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.transparent, width: 2),
                  ),
                  child: Stack(
                    children: [
                      // Corner decorations
                      ..._buildCorners(),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Point camera at your lecturer\'s QR code',
                    style: TextStyle(color: Colors.white, fontSize: 14),
                    textAlign: TextAlign.center,
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
    const size = 30.0;
    const thickness = 4.0;
    const color = Color(0xFF1E88E5);
    return [
      // Top-left
      Positioned(
        top: 0,
        left: 0,
        child: Container(
          width: size,
          height: thickness,
          color: color,
        ),
      ),
      Positioned(
        top: 0,
        left: 0,
        child: Container(
          width: thickness,
          height: size,
          color: color,
        ),
      ),
      // Top-right
      Positioned(
        top: 0,
        right: 0,
        child: Container(width: size, height: thickness, color: color),
      ),
      Positioned(
        top: 0,
        right: 0,
        child: Container(width: thickness, height: size, color: color),
      ),
      // Bottom-left
      Positioned(
        bottom: 0,
        left: 0,
        child: Container(width: size, height: thickness, color: color),
      ),
      Positioned(
        bottom: 0,
        left: 0,
        child: Container(width: thickness, height: size, color: color),
      ),
      // Bottom-right
      Positioned(
        bottom: 0,
        right: 0,
        child: Container(width: size, height: thickness, color: color),
      ),
      Positioned(
        bottom: 0,
        right: 0,
        child: Container(width: thickness, height: size, color: color),
      ),
    ];
  }

  Widget _buildResultOverlay() {
    return Container(
      color: Colors.black87,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _isSuccess
                      ? const Color(0xFF43A047).withOpacity(0.2)
                      : const Color(0xFFE53935).withOpacity(0.2),
                ),
                child: Icon(
                  _isSuccess ? Icons.check_circle_rounded : Icons.error_rounded,
                  size: 60,
                  color: _isSuccess ? const Color(0xFF43A047) : const Color(0xFFE53935),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                _isSuccess ? 'Success!' : 'Failed',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: _isSuccess ? const Color(0xFF43A047) : const Color(0xFFE53935),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _result ?? '',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 15,
                  color: Colors.white70,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: _resetScanner,
                icon: const Icon(Icons.qr_code_scanner_rounded),
                label: const Text('Scan Again'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
