import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'services/api_service.dart';
import 'screens/dashboard_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ApiService()),
      ],
      child: const ExtraEarnApp(),
    ),
  );
}

class ExtraEarnApp extends StatelessWidget {
  const ExtraEarnApp({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    return MaterialApp(
      title: api.settings.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        fontFamily: 'Plus Jakarta Sans',
        scaffoldBackgroundColor: api.backgroundColor,
        primaryColor: api.primaryColor,
        colorScheme: ColorScheme.dark(
          primary: api.primaryColor,
          background: api.backgroundColor,
          surface: api.cardColor,
        ),
        dialogTheme: DialogThemeData(
          backgroundColor: api.cardColor,
          surfaceTintColor: Colors.transparent,
        ),
      ),
      home: const AppBootstrapFlow(),
    );
  }
}

// -------------------------------------------------------------
// APP BOOTSTRAP / ROUTER FLOW
// -------------------------------------------------------------
class AppBootstrapFlow extends StatefulWidget {
  const AppBootstrapFlow({super.key});

  @override
  State<AppBootstrapFlow> createState() => _AppBootstrapFlowState();
}

class _AppBootstrapFlowState extends State<AppBootstrapFlow> {
  bool _showSplash = true;

  @override
  void initState() {
    super.initState();
    _startBootstrap();
  }

  void _startBootstrap() async {
    await Future.delayed(const Duration(seconds: 3));
    if (mounted) {
      setState(() {
        _showSplash = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // Always render the Dynamic API-Driven Web App UI directly
    return const WebAppContainerScreen();
  }
}

// -------------------------------------------------------------
// SPLASH SCREEN
// -------------------------------------------------------------
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    return Scaffold(
      backgroundColor: api.backgroundColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.monetization_on,
              color: api.primaryColor,
              size: 80,
            ),
            const SizedBox(height: 20),
            Text(
              api.settings.appName,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              api.settings.appSubtitle,
              style: const TextStyle(
                fontSize: 10,
                color: Colors.grey,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 40),
            SizedBox(
              width: 140,
              child: LinearProgressIndicator(
                color: api.primaryColor,
                backgroundColor: api.cardColor,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              "v1.0.0 Pro",
              style: TextStyle(fontSize: 10, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// MAINTENANCE SCREEN
// -------------------------------------------------------------
class MaintenanceScreen extends StatelessWidget {
  const MaintenanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.build_circle, color: api.primaryColor, size: 70),
            const SizedBox(height: 20),
            const Text(
              "Under Scheduled Maintenance",
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              "We are deploying server optimizations. App will be back online instantly. Thank you for your patience.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: api.cardColor,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Provider.of<ApiService>(context, listen: false).fetchSettings();
              },
              child: const Text("Retry Connection"),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// FORCE UPDATE SCREEN
// -------------------------------------------------------------
class ForceUpdateScreen extends StatelessWidget {
  const ForceUpdateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.system_update_alt, color: api.primaryColor, size: 70),
            const SizedBox(height: 20),
            const Text(
              "Update Required",
              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              "A critical update is available on the Play Store. Please update to the latest version to prevent coin sync loss.",
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: api.primaryColor,
                foregroundColor: Colors.black,
              ),
              onPressed: () {
                // Simulate Play Store redirect
              },
              child: const Text("Update Now"),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// LANGUAGE SELECTOR SCREEN
// -------------------------------------------------------------
class LanguageScreen extends StatefulWidget {
  const LanguageScreen({super.key});

  @override
  State<LanguageScreen> createState() => _LanguageScreenState();
}

class _LanguageScreenState extends State<LanguageScreen> {
  String _selectedLang = 'English';

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Select Language",
              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 5),
            const Text("Choose your preferred language to proceed", style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 30),
            ...['English', 'ગુજરાતી', 'हिन्दी'].map(
              (lang) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: api.cardColor,
                  border: Border.all(
                    color: _selectedLang == lang ? api.primaryColor : api.borderColor,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: RadioListTile<String>(
                  title: Text(lang, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  value: lang,
                  groupValue: _selectedLang,
                  activeColor: api.primaryColor,
                  onChanged: (val) {
                    setState(() {
                      _selectedLang = val!;
                    });
                  },
                ),
              ),
            ),
            const SizedBox(height: 30),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: api.primaryColor,
                foregroundColor: Colors.black,
                minimumSize: const Size(double.infinity, 50),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const OnboardingScreen()),
                );
              },
              child: const Text("CONTINUE", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// ONBOARDING SCREEN
// -------------------------------------------------------------
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, String>> _fallbackSlides = [
    {
      'title': 'Welcome to ExtraEarn',
      'desc': 'Turn your spare time into real money. Install apps, answer surveys, play games, and watch video ads to earn coins.',
      'icon': 'wallet'
    },
    {
      'title': 'Play Quick Games',
      'desc': 'Spin the daily wheel, scratch cards, play mini catch games, and answer quizzes to claim immediate bonus coins.',
      'icon': 'gamepad'
    },
    {
      'title': 'Instant Payouts',
      'desc': 'Convert your coins into real money and withdraw via Paytm, UPI, Bank Transfer or Google Play Gift Cards.',
      'icon': 'account_balance_wallet'
    }
  ];

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'wallet':
        return Icons.wallet;
      case 'gamepad':
        return Icons.gamepad;
      case 'account_balance_wallet':
        return Icons.account_balance_wallet;
      case 'monetization_on':
        return Icons.monetization_on;
      case 'stars':
        return Icons.stars;
      case 'emoji_events':
        return Icons.emoji_events;
      default:
        return Icons.star;
    }
  }

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    final onboardingSlides = api.settings.onboardingSlides;
    final slides = onboardingSlides.isNotEmpty
        ? onboardingSlides.map((s) => {
            'title': s.title,
            'desc': s.desc,
            'icon': s.icon,
          }).toList()
        : _fallbackSlides;

    return Scaffold(
      backgroundColor: api.backgroundColor,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 40),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemCount: slides.length,
                itemBuilder: (context, index) {
                  final slide = slides[index];
                  IconData iconData = _getIcon(slide['icon'] ?? '');

                  return Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(iconData, color: api.primaryColor, size: 100),
                      const SizedBox(height: 40),
                      Text(
                        slide['title']!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        slide['desc']!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.grey, fontSize: 13, height: 1.5),
                      ),
                    ],
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const AuthScreen()),
                    );
                  },
                  child: const Text("SKIP", style: TextStyle(color: Colors.grey)),
                ),
                Row(
                  children: List.generate(
                    slides.length,
                    (index) => Container(
                      margin: const EdgeInsets.only(right: 6),
                      width: _currentPage == index ? 24 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _currentPage == index ? api.primaryColor : api.borderColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: api.primaryColor,
                    foregroundColor: Colors.black,
                  ),
                  onPressed: () {
                    if (_currentPage < slides.length - 1) {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeIn,
                      );
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (context) => const AuthScreen()),
                      );
                    }
                  },
                  child: Text(_currentPage == slides.length - 1 ? "FINISH" : "NEXT"),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// AUTHENTICATION SCREEN (LOGIN)
// -------------------------------------------------------------
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  bool _showOtpField = false;
  final _otpController = TextEditingController();

  void _showApiSettingsDialog() {
    final api = Provider.of<ApiService>(context, listen: false);
    final textController = TextEditingController(text: ApiService.baseUrl);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: api.cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text("Configure API Server", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Set the base API URL to connect a physical device or custom server.",
              style: TextStyle(color: Colors.grey, fontSize: 13),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: textController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: api.backgroundColor,
                border: const OutlineInputBorder(),
                labelText: "Server URL",
                labelStyle: const TextStyle(color: Colors.grey),
                hintText: "http://192.168.1.X:3000/api",
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("CANCEL", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: api.primaryColor,
              foregroundColor: Colors.black,
            ),
            onPressed: () async {
              await api.setCustomUrl(textController.text.trim());
              if (mounted) Navigator.pop(context);
            },
            child: const Text("SAVE URL", style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final api = Provider.of<ApiService>(context);

    return Scaffold(
      backgroundColor: api.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings, color: Colors.white),
            onPressed: _showApiSettingsDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Icon(Icons.monetization_on, color: api.primaryColor, size: 50)),
            const SizedBox(height: 10),
            Center(
              child: Text(
                api.settings.appName,
                style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 5),
            const Center(
              child: Text(
                "Verify Identity",
                style: TextStyle(color: Colors.grey, fontSize: 14),
              ),
            ),
            const SizedBox(height: 30),
            if (!_showOtpField) ...[
              TextField(
                controller: _nameController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: api.cardColor,
                  border: const OutlineInputBorder(),
                  labelText: "Your Full Name",
                  labelStyle: const TextStyle(color: Colors.grey),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: api.cardColor,
                  border: const OutlineInputBorder(),
                  labelText: "Mobile Phone Number",
                  labelStyle: const TextStyle(color: Colors.grey),
                  prefixText: "+91 ",
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: api.primaryColor,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () {
                  if (_phoneController.text.length < 10) return;
                  setState(() {
                    _showOtpField = true;
                  });
                },
                child: const Text("SEND OTP VERIFICATION", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
            if (_showOtpField) ...[
              const Text(
                "Enter 6-digit OTP code sent to your phone",
                style: TextStyle(color: Colors.grey, fontSize: 13),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: api.cardColor,
                  border: const OutlineInputBorder(),
                  labelText: "OTP Verification Code",
                  labelStyle: const TextStyle(color: Colors.grey),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: api.primaryColor,
                  foregroundColor: Colors.black,
                  minimumSize: const Size(double.infinity, 50),
                ),
                onPressed: () async {
                  await api.login(_phoneController.text, _nameController.text);
                  if (mounted) {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => const DashboardScreen()),
                    );
                  }
                },
                child: const Text("VERIFY & LOGIN", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
            const SizedBox(height: 20),
            const Center(child: Text("OR", style: TextStyle(color: Colors.grey))),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: Colors.black,
                minimumSize: const Size(double.infinity, 50),
              ),
              onPressed: () async {
                await api.login("9123456789", "Kajal Mehta");
                if (mounted) {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(builder: (context) => const DashboardScreen()),
                  );
                }
              },
              icon: const Icon(Icons.g_mobiledata, size: 28),
              label: const Text("Continue with Google", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// WEB APP WRAPPER CONTAINER
// -------------------------------------------------------------
class WebAppContainerScreen extends StatefulWidget {
  const WebAppContainerScreen({super.key});

  @override
  State<WebAppContainerScreen> createState() => _WebAppContainerScreenState();
}

class _WebAppContainerScreenState extends State<WebAppContainerScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initWebView();
  }

  void _initWebView() {
    final api = Provider.of<ApiService>(context, listen: false);
    final serverBase = ApiService.baseUrl.replaceAll(RegExp(r'/api/?$'), '');
    final webAppPath = (api.settings.webAppUrl.isNotEmpty) ? api.settings.webAppUrl : 'app_code/index.html';
    final fullUrl = "$serverBase/$webAppPath";

    debugPrint("[FLUTTER_WEBVIEW] Initializing Live API UI: $fullUrl");

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF07080E))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            debugPrint("[FLUTTER_WEBVIEW] Started: $url");
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
              });
            }
          },
          onPageFinished: (url) {
            debugPrint("[FLUTTER_WEBVIEW] Finished: $url");
            if (mounted) {
              setState(() {
                _isLoading = false;
              });
            }
          },
          onWebResourceError: (error) {
            debugPrint("[FLUTTER_WEBVIEW] Error: ${error.description}");
            if (mounted) {
              setState(() {
                _isLoading = false;
                _hasError = true;
              });
            }
          },
        ),
      )
      ..loadRequest(
        Uri.parse(fullUrl),
        headers: {'Bypass-Tunnel-Reminder': 'true'},
      );
  }

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    return Scaffold(
      backgroundColor: api.backgroundColor,
      body: SafeArea(
        child: Stack(
          children: [
            if (!_hasError)
              WebViewWidget(controller: _controller)
            else
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.wifi_off_rounded, size: 64, color: api.primaryColor),
                      const SizedBox(height: 16),
                      const Text(
                        "Connection Failed",
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        "Unable to load the Live App from the server. Please check your internet connection and try again.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey, fontSize: 13),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: api.primaryColor,
                          foregroundColor: Colors.black,
                        ),
                        onPressed: () {
                          _initWebView();
                        },
                        child: const Text("Retry Connection", style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),
            if (_isLoading)
              Center(
                child: CircularProgressIndicator(color: api.primaryColor),
              ),
          ],
        ),
      ),
    );
  }
}
