import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/app_models.dart';

class ApiService extends ChangeNotifier {
  static String _customUrl = '';

  static String get baseUrl {
    if (_customUrl.isNotEmpty) {
      return _customUrl;
    }
    return 'https://extraearn.onrender.com/api';
  }

  AppSettings _settings = AppSettings(
    maintenanceMode: false,
    forceUpdate: false,
    adReward: 15,
    dailyCheckin: 50,
    adClicks: 0,
    adRevenue: 0.0,
    appName: 'ExtraEarn',
    appTitle: 'ExtraEarn Pro',
    appSubtitle: 'TURN TIME INTO REAL COINS',
    primaryColor: '#FFD54A',
    backgroundColor: '#070709',
    secondaryColor: '#7C3AED',
    cardColor: '#14141B',
    borderColor: '#252535',
    webAppEnabled: true,
    webAppUrl: 'app_code/index.html',
    quickGames: [],
    onboardingSlides: [],
    withdrawMethods: ['UPI', 'Paytm', 'Google Play Gift Card', 'Bank Transfer'],
  );

  AppUser? _currentUser;
  List<AppUser> _allUsers = [];
  List<AppTransaction> _transactions = [];

  // Broadcast callback to trigger instant UI overlays
  void Function(String title, String msg)? onNewBroadcastReceived;
  String _lastProcessedBroadcastTime = '';

  AppSettings get settings => _settings;
  AppUser? get currentUser => _currentUser;
  List<AppUser> get allUsers => _allUsers;
  List<AppTransaction> get transactions => _transactions;

  Color get primaryColor => parseColor(_settings.primaryColor, const Color(0xFFFFD54A));
  Color get backgroundColor => parseColor(_settings.backgroundColor, const Color(0xFF070709));
  Color get secondaryColor => parseColor(_settings.secondaryColor, const Color(0xFF7C3AED));
  Color get cardColor => parseColor(_settings.cardColor, const Color(0xFF14141B));
  Color get borderColor => parseColor(_settings.borderColor, const Color(0xFF252535));

  Color parseColor(String? hexString, Color fallback) {
    if (hexString == null || hexString.isEmpty) return fallback;
    try {
      final buffer = StringBuffer();
      if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
      buffer.write(hexString.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (e) {
      return fallback;
    }
  }

  bool _isLoading = false;
  bool get isLoading => _isLoading;
  Timer? _syncTimer;

  Map<String, String> get _headers => {
    'Bypass-Tunnel-Reminder': 'true',
  };

  Map<String, String> get _headersJson => {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
  };

  ApiService() {
    _loadLocalFallback();
    fetchSettings(showLoading: true);
    
    // Global background sync timer
    _syncTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      fetchSettings();
      if (_currentUser != null) {
        fetchUserProfile();
        fetchTransactions();
      }
    });
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    super.dispose();
  }

  // Load local state as fallback
  Future<void> _loadLocalFallback() async {
    final prefs = await SharedPreferences.getInstance();
    _customUrl = prefs.getString('custom_api_url') ?? '';
    final settingsJson = prefs.getString('cached_settings');
    if (settingsJson != null) {
      try {
        _settings = AppSettings.fromJson(jsonDecode(settingsJson));
      } catch (e) {
        // ignore
      }
    }
    final userJson = prefs.getString('current_user');
    if (userJson != null) {
      _currentUser = AppUser.fromJson(jsonDecode(userJson));
      notifyListeners();
    }
  }

  Future<void> setCustomUrl(String url) async {
    _customUrl = url;
    final prefs = await SharedPreferences.getInstance();
    if (url.isEmpty) {
      await prefs.remove('custom_api_url');
    } else {
      await prefs.setString('custom_api_url', url);
    }
    notifyListeners();
    // Fetch settings again with new URL
    fetchSettings(showLoading: true);
  }

  Future<void> saveUserLocally(AppUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('current_user', jsonEncode(user.toJson()));
  }

  Future<void> clearLocalUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('custom_api_url'); // Clear URL config on logout to reset
    await prefs.remove('current_user');
    _currentUser = null;
    notifyListeners();
  }

  // Fetch settings dynamically from server
  Future<bool> fetchSettings({bool showLoading = false}) async {
    if (showLoading) {
      _isLoading = true;
      notifyListeners();
    }
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/settings'),
        headers: _headers,
      ).timeout(
        const Duration(seconds: 4),
      );
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        _settings = AppSettings.fromJson(data);
        
        try {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('cached_settings', response.body);
        } catch (e) {
          // ignore
        }
        
        if (showLoading) {
          _isLoading = false;
        }

        // Reactive Push Broadcaster check
        if (_settings.broadcastTime != null && _settings.broadcastTime != _lastProcessedBroadcastTime) {
          _lastProcessedBroadcastTime = _settings.broadcastTime!;
          if (onNewBroadcastReceived != null && _settings.broadcastTitle != null && _settings.broadcastMsg != null) {
            onNewBroadcastReceived!(_settings.broadcastTitle!, _settings.broadcastMsg!);
          }
        }

        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('API Error (fetchSettings): $e. Using local cached settings.');
    }
    if (showLoading) {
      _isLoading = false;
      notifyListeners();
    }
    return false;
  }

  // Update Settings (Admin Panel)
  Future<void> updateSettings(AppSettings newSettings) async {
    _settings = newSettings;
    notifyListeners();
    try {
      await http.post(
        Uri.parse('$baseUrl/settings'),
        headers: _headersJson,
        body: jsonEncode(newSettings.toJson()),
      );
    } catch (e) {
      debugPrint('API Error (updateSettings): $e');
    }
  }

  // Authenticate user
  Future<bool> login(String phone, String name) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: _headersJson,
        body: jsonEncode({'phone': phone, 'name': name}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _currentUser = AppUser.fromJson(data['user']);
        await saveUserLocally(_currentUser!);
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('API Error (login): $e. Simulating local fallback.');
      // Simulate offline mock user
      _currentUser = AppUser(
        id: 'usr_mock_${DateTime.now().millisecondsSinceEpoch}',
        name: name.isEmpty ? 'Kajal Mehta' : name,
        phone: phone,
        coins: 100,
        level: 1,
        status: 'Active',
        devices: ['mock_device'],
      );
      await saveUserLocally(_currentUser!);
    }
    _isLoading = false;
    notifyListeners();
    return true;
  }

  // Adjust coins dynamically (Earn or Spend)
  Future<bool> adjustCoins(int amount, String type, {String details = ''}) async {
    if (_currentUser == null) return false;
    
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/users/adjust-coins'),
        headers: _headersJson,
        body: jsonEncode({
          'userId': _currentUser!.id,
          'amount': amount,
          'type': type,
          'details': details,
        }),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          _currentUser = AppUser.fromJson(data['user']);
          await saveUserLocally(_currentUser!);
          await fetchTransactions(); // Refresh transactions
          notifyListeners();
          return true;
        } else {
          debugPrint('API Error (adjustCoins): ${data['error']}');
        }
      }
    } catch (e) {
      debugPrint('API Error (adjustCoins): $e');
    }
    return false;
  }

  // Fetch single user profile for live sync
  Future<void> fetchUserProfile() async {
    if (_currentUser == null) return;
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/profile?userId=${_currentUser!.id}'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          _currentUser = AppUser.fromJson(data['user']);
          await saveUserLocally(_currentUser!);
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('API Error (fetchUserProfile): $e');
    }
  }

  // Fetch Transaction logs
  Future<void> fetchTransactions() async {
    if (_currentUser == null) return;
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/transactions?userId=${_currentUser!.id}'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        _transactions = data.map((x) => AppTransaction.fromJson(x)).toList().reversed.toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('API Error (fetchTransactions): $e');
    }
  }

  // Fetch all users list (Admin view)
  Future<void> fetchAllUsers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/admin/users'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        _allUsers = data.map((x) => AppUser.fromJson(x)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('API Error (fetchAllUsers): $e');
    }
  }

  // Ban/Unban user (Admin view)
  Future<void> toggleBanStatus(String userId, String currentStatus) async {
    final nextStatus = currentStatus == 'Active' ? 'Banned' : 'Active';
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/admin/users/ban'),
        headers: _headersJson,
        body: jsonEncode({'userId': userId, 'status': nextStatus}),
      );
      if (response.statusCode == 200) {
        await fetchAllUsers();
        if (_currentUser?.id == userId && nextStatus == 'Banned') {
          clearLocalUser();
        }
      }
    } catch (e) {
      debugPrint('API Error (toggleBanStatus): $e');
      // local toggle simulation
      final uIdx = _allUsers.indexWhere((u) => u.id == userId);
      if (uIdx != -1) {
        _allUsers[uIdx].status = nextStatus;
        notifyListeners();
      }
    }
  }

  // Fetch game files list
  Future<List<String>> fetchGamesList() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/admin/games'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.cast<String>();
      }
    } catch (e) {
      debugPrint('API Error (fetchGamesList): $e');
    }
    return ['star_catcher.html', 'alice_harvest.html']; // Fallback
  }
}
