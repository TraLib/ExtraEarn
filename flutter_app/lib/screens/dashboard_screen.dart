import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../models/app_models.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _activeTabIndex = 0;

  @override
  void initState() {
    super.initState();
    // Hook up live broadcast notification dispatcher
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final api = Provider.of<ApiService>(context, listen: false);
        api.onNewBroadcastReceived = (title, msg) {
          _showBroadcastDialog(title, msg);
        };
      }
    });
  }

  void _showBroadcastDialog(String title, String msg) {
    final api = Provider.of<ApiService>(context, listen: false);
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => AlertDialog(
        backgroundColor: api.cardColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.notifications_active, color: api.primaryColor),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ],
        ),
        content: Text(
          msg,
          style: const TextStyle(color: Colors.white70, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text("OK", style: TextStyle(color: api.primaryColor, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }

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
            onPressed: () async {
              await api.clearLocalUser();
              if (mounted) Navigator.pop(context);
            },
            child: const Text("LOGOUT", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("CANCEL", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () async {
              await api.setCustomUrl(textController.text.trim());
              if (mounted) Navigator.pop(context);
            },
            child: Text("SAVE URL", style: TextStyle(color: api.primaryColor, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    final user = api.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: Text("Session Revoked. Please login.")));
    }

    final List<Widget> tabs = [
      HomeTab(user: user, api: api),
      WalletTab(user: user, api: api),
      ReferralTab(user: user),
      SupportTab(),
    ];

    return Scaffold(
      backgroundColor: api.backgroundColor,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0C0D18),
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFFFB800), width: 2),
                boxShadow: const [
                  BoxShadow(color: Color(0x55FFB800), blurRadius: 10),
                ],
              ),
              child: CircleAvatar(
                backgroundImage: NetworkImage(
                    'https://api.dicebear.com/7.x/bottts/png?seed=${user.name}'),
                radius: 18,
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0x228B5CF6),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0x448B5CF6)),
                  ),
                  child: Text(
                    "LEVEL ${user.level} VIP",
                    style: const TextStyle(
                      fontSize: 9,
                      color: Color(0xFFFFB800),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0x33FFB800), Color(0x338B5CF6)],
              ),
              border: Border.all(color: const Color(0x66FFB800), width: 1.5),
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(color: Color(0x33000000), blurRadius: 10),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.monetization_on_rounded, color: Color(0xFFFFB800), size: 18),
                const SizedBox(width: 6),
                Text(
                  "${user.coins}",
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings_suggest_rounded, color: Colors.white70, size: 22),
            onPressed: _showApiSettingsDialog,
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: tabs[_activeTabIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0C0D18),
          border: Border(top: BorderSide(color: Color(0x1AFFFFFF), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _activeTabIndex,
          type: BottomNavigationBarType.fixed,
          backgroundColor: const Color(0xFF0C0D18),
          selectedItemColor: const Color(0xFFFFB800),
          unselectedItemColor: const Color(0xFF64748B),
          selectedFontSize: 12,
          unselectedFontSize: 11,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w800, height: 1.5),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, height: 1.5),
          onTap: (index) {
            setState(() {
              _activeTabIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.space_dashboard_rounded),
              activeIcon: Icon(Icons.space_dashboard_rounded, color: Color(0xFFFFB800)),
              label: "Home",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_rounded),
              activeIcon: Icon(Icons.account_balance_wallet_rounded, color: Color(0xFFFFB800)),
              label: "Wallet",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.group_add_rounded),
              activeIcon: Icon(Icons.group_add_rounded, color: Color(0xFFFFB800)),
              label: "Referral",
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.headset_mic_rounded),
              activeIcon: Icon(Icons.headset_mic_rounded, color: Color(0xFFFFB800)),
              label: "Support",
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// HOME TAB
// -------------------------------------------------------------
class HomeTab extends StatelessWidget {
  final dynamic user;
  final ApiService api;

  const HomeTab({super.key, required this.user, required this.api});

  IconData _getGameIcon(String iconName) {
    switch (iconName) {
      case 'refresh':
      case 'spin':
        return Icons.refresh;
      case 'wallet_membership':
      case 'scratch':
        return Icons.wallet_membership;
      case 'quiz':
        return Icons.quiz;
      case 'gamepad':
      case 'play':
        return Icons.gamepad;
      default:
        return Icons.star;
    }
  }

  Color _getIconColor(String iconColor) {
    switch (iconColor.toLowerCase()) {
      case 'gold':
      case 'yellow':
        return const Color(0xFFFFD54A);
      case 'purple':
      case 'violet':
        return const Color(0xFF7C3AED);
      case 'green':
        return Colors.green;
      case 'blue':
      case 'lightblue':
        return Colors.lightBlue;
      default:
        return const Color(0xFFFFD54A);
    }
  }

  Widget _getTargetScreen(String gameId) {
    switch (gameId) {
      case 'spin':
        return const SpinWheelScreen();
      case 'scratch':
        return const ScratchCardScreen();
      case 'quiz':
        return const QuizScreen();
      case 'play':
      case 'catch':
        return const PlayGameScreen();
      default:
        return const SpinWheelScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Daily check-in card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [api.secondaryColor, api.primaryColor],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Daily Check-in Reward",
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  "Claim +${api.settings.dailyCheckin} Coins every 24 hours!",
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 12),
                Builder(
                  builder: (context) {
                    final now = DateTime.now().toUtc().add(const Duration(hours: 5, minutes: 30));
                    final istDateString = "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}";
                    final isClaimed = user.lastCheckInDate == istDateString;

                    return ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isClaimed ? Colors.grey.shade600 : Colors.white,
                        foregroundColor: isClaimed ? Colors.white70 : Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: isClaimed
                          ? null
                          : () async {
                              final success = await api.adjustCoins(api.settings.dailyCheckin, "Daily Check-in");
                              if (success) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text("Claimed +${api.settings.dailyCheckin} Coins successfully!")),
                                );
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text("Already Claimed Today!")),
                                );
                              }
                            },
                      child: Text(isClaimed ? "Already Claimed Today" : "Claim Reward"),
                    );
                  }
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Watch Ads Banner Card
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const WatchAdsScreen()),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.play_circle_fill, color: Colors.white, size: 40),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Watch Video Ads & Earn",
                          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "Claim +${api.settings.adReward} Coins per ad instantly!",
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, color: Colors.white70, size: 16),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            "QUICK GAMES & TASKS",
            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
          ),
          const SizedBox(height: 12),
          // Games grid
          Builder(
            builder: (context) {
              final activeGames = api.settings.quickGames.isNotEmpty
                  ? api.settings.quickGames.where((g) => g.enabled).toList()
                  : [];

              if (activeGames.isEmpty) {
                return GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.3,
                  children: [
                    _buildGameCard(
                      context,
                      title: "Spin Wheel",
                      subtitle: "Win up to 500 coins",
                      icon: Icons.refresh,
                      iconColor: api.primaryColor,
                      targetScreen: const SpinWheelScreen(),
                    ),
                    _buildGameCard(
                      context,
                      title: "Scratch Card",
                      subtitle: "Scratch to reveal",
                      icon: Icons.wallet_membership,
                      iconColor: api.secondaryColor,
                      targetScreen: const ScratchCardScreen(),
                    ),
                    _buildGameCard(
                      context,
                      title: "Daily Quiz",
                      subtitle: "Answer to earn",
                      icon: Icons.quiz,
                      iconColor: Colors.green,
                      targetScreen: const QuizScreen(),
                    ),
                    _buildGameCard(
                      context,
                      title: "Play Game",
                      subtitle: "Play & Catch coins",
                      icon: Icons.gamepad,
                      iconColor: Colors.lightBlue,
                      targetScreen: const PlayGameScreen(),
                    ),
                  ],
                );
              }

              return GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.3,
                ),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: activeGames.length,
                itemBuilder: (context, index) {
                  final game = activeGames[index];
                  return _buildGameCard(
                    context,
                    title: game.title,
                    subtitle: game.subtitle,
                    icon: _getGameIcon(game.icon),
                    iconColor: _getIconColor(game.iconColor ?? ''),
                    targetScreen: _getTargetScreen(game.id),
                  );
                },
              );
            }
          ),
        ],
      ),
    );
  }

  Widget _buildGameCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required Widget targetScreen,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => targetScreen),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: api.cardColor,
          border: Border.all(color: api.borderColor),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: iconColor, size: 28),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 2),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// WALLET TAB
// -------------------------------------------------------------
class WalletTab extends StatefulWidget {
  final dynamic user;
  final ApiService api;

  const WalletTab({super.key, required this.user, required this.api});

  @override
  State<WalletTab> createState() => _WalletTabState();
}

class _WalletTabState extends State<WalletTab> {
  final _amountController = TextEditingController();
  String _selectedMethod = 'UPI';

  @override
  void initState() {
    super.initState();
    widget.api.fetchTransactions();
  }

  Widget _buildGooglePlayCard(int coins, int rupees) {
    // Find latest transaction matching this card
    final relevantTxs = widget.api.transactions.where((tx) =>
        tx.type == 'Redeem Code Request' &&
        tx.details == 'Google Play Gift Card: ₹$rupees').toList();
    
    AppTransaction? latestTx;
    if (relevantTxs.isNotEmpty) {
      latestTx = relevantTxs.first; // transactions are sorted newest first
    }

    final hasEnoughCoins = widget.user.coins >= coins;

    // Card States
    Widget cardContent;
    if (latestTx != null && latestTx.status == 'Pending') {
      cardContent = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.hourglass_empty, color: Colors.orangeAccent, size: 24),
          const SizedBox(height: 6),
          const Text(
            "Pending Approval",
            style: TextStyle(color: Colors.orangeAccent, fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            "Reviewing request",
            style: TextStyle(color: Colors.white54, fontSize: 10),
          ),
        ],
      );
    } else if (latestTx != null && latestTx.status == 'Success') {
      final code = latestTx.redeemCode ?? "CODE-PROCESSING";
      cardContent = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            "₹$rupees Unlocked!",
            style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black38,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: const Color(0xFF10B981), width: 0.5),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Text(
                    code,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 4),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: code));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Redeem code copied to clipboard!")),
                    );
                  },
                  child: const Icon(Icons.copy, color: Color(0xFFFFD54A), size: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          GestureDetector(
            onTap: () => _confirmRedemption(coins, rupees),
            child: const Text(
              "Claim Again",
              style: TextStyle(
                color: Color(0xFFFFD54A),
                fontSize: 10,
                fontWeight: FontWeight.bold,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      );
    } else {
      // Unclaimed / Rejected
      cardContent = Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.redeem, color: Color(0xFFFFD54A), size: 16),
              const SizedBox(width: 4),
              Text(
                "₹$rupees Card",
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            "$coins Coins",
            style: TextStyle(color: Colors.white54, fontSize: 11),
          ),
          const SizedBox(height: 8),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: hasEnoughCoins ? const Color(0xFFFFD54A) : Colors.grey.shade700,
              foregroundColor: hasEnoughCoins ? Colors.black : Colors.white60,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            onPressed: () {
              if (!hasEnoughCoins) {
                _showNotEnoughCoinsDialog(coins);
              } else {
                _confirmRedemption(coins, rupees);
              }
            },
            child: const Text("Redeem", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      );
    }

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF1E1E28),
            latestTx?.status == 'Success' ? const Color(0xFF0F2A1E) : const Color(0xFF14141B)
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: latestTx?.status == 'Success'
              ? const Color(0xFF10B981).withOpacity(0.5)
              : const Color(0xFF252535),
          width: 1,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: cardContent,
    );
  }

  void _showNotEnoughCoinsDialog(int required) {
    final needed = required - widget.user.coins;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF14141B),
        title: const Text("Not Enough Coins", style: TextStyle(color: Colors.white)),
        content: Text(
          "You do not have enough coins to get this code.\nYou need $needed more coins to claim this card.",
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("OK", style: TextStyle(color: Color(0xFFFFD54A))),
          ),
        ],
      ),
    );
  }

  void _confirmRedemption(int coins, int rupees) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF14141B),
        title: const Text("Confirm Redemption", style: TextStyle(color: Colors.white)),
        content: Text(
          "Are you sure you want to request a ₹$rupees Google Play Redeem Code for $coins coins?",
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await widget.api.adjustCoins(
                -coins,
                "Redeem Code Request",
                details: "Google Play Gift Card: ₹$rupees",
              );
              if (success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Redeem request submitted to admin!")),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Not enough coins to get code")),
                );
              }
            },
            child: const Text("Confirm", style: TextStyle(color: Color(0xFFFFD54A))),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF14141B),
              border: Border.all(color: const Color(0xFF252535)),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                const Text("Total Wallet Balance", style: TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 6),
                Text(
                  "${widget.user.coins} Coins",
                  style: const TextStyle(color: Color(0xFFFFD54A), fontSize: 28, fontWeight: FontWeight.bold),
                ),
                Text(
                  "₹${(widget.user.coins / 100).toStringAsFixed(2)} INR (100 coins = ₹1)",
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text("Google Play Redeem Cards", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.35,
            children: [
              _buildGooglePlayCard(1000, 10),
              _buildGooglePlayCard(2500, 50),
              _buildGooglePlayCard(5000, 100),
              _buildGooglePlayCard(10000, 500),
            ],
          ),
          const SizedBox(height: 24),
          const Text("Withdraw Payouts", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Builder(
            builder: (context) {
              final methods = widget.api.settings.withdrawMethods.isNotEmpty
                  ? widget.api.settings.withdrawMethods
                  : ['UPI', 'Paytm', 'Google Play Gift Card', 'Bank Transfer'];
              
              if (!methods.contains(_selectedMethod)) {
                _selectedMethod = methods.first;
              }

              return DropdownButtonFormField<String>(
                value: _selectedMethod,
                dropdownColor: widget.api.cardColor,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: widget.api.cardColor,
                  border: const OutlineInputBorder(),
                  labelText: "Withdrawal Method",
                  labelStyle: const TextStyle(color: Colors.grey),
                ),
                style: const TextStyle(color: Colors.white),
                items: methods
                    .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                    .toList(),
                onChanged: (val) {
                  setState(() {
                    _selectedMethod = val!;
                  });
                },
              );
            }
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              filled: true,
              fillColor: widget.api.cardColor,
              border: const OutlineInputBorder(),
              labelText: "Amount (in coins)",
              labelStyle: const TextStyle(color: Colors.grey),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: widget.api.primaryColor,
              foregroundColor: Colors.black,
              minimumSize: const Size(double.infinity, 50),
            ),
            onPressed: () {
              final coins = int.tryParse(_amountController.text) ?? 0;
              if (coins <= 0) return;
              if (widget.user.coins < coins) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Insufficient Balance")),
                );
                return;
              }
              widget.api.adjustCoins(-coins, "Cashout Request", details: _selectedMethod);
              _amountController.clear();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Withdrawal requested successfully!")),
              );
            },
            child: const Text("Request Withdrawal", style: TextStyle(fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 24),
          const Text("Transaction History", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: widget.api.transactions.length,
            itemBuilder: (context, index) {
              final tx = widget.api.transactions[index];
              final isPositive = tx.amount > 0;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF14141B),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(tx.type, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          if (tx.amount < 0) ...[
                            if (tx.status == 'Success') ...[
                              if (tx.type == 'Redeem Code Request' && tx.redeemCode != null) ...[
                                Row(
                                  children: [
                                    Text(
                                      "Code: ${tx.redeemCode} ",
                                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    const SizedBox(width: 4),
                                    GestureDetector(
                                      onTap: () {
                                        Clipboard.setData(ClipboardData(text: tx.redeemCode!));
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(content: Text("Code copied to clipboard!")),
                                        );
                                      },
                                      child: const Icon(Icons.copy, color: Color(0xFFFFD54A), size: 12),
                                    ),
                                  ],
                                ),
                              ] else ...[
                                const Text(
                                  "Clap! Amount has arrived in your bank, sent! 👏",
                                  style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ]
                            else if (tx.status == 'Rejected')
                              const Text(
                                "Rejected & Refunded ❌",
                                style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.w500),
                              )
                            else
                              const Text(
                                "Under review by admin ⏳",
                                style: TextStyle(color: Colors.orangeAccent, fontSize: 11, fontWeight: FontWeight.w500),
                              ),
                            const SizedBox(height: 4),
                          ],
                          Text(tx.timestamp, style: const TextStyle(color: Colors.grey, fontSize: 10)),
                        ],
                      ),
                    ),
                    Text(
                      "${isPositive ? '+' : ''}${tx.amount} coins",
                      style: TextStyle(
                        color: isPositive ? Colors.green : Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// REFERRAL TAB
// -------------------------------------------------------------
class ReferralTab extends StatelessWidget {
  final dynamic user;

  const ReferralTab({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.share, color: Color(0xFFFFD54A), size: 80),
          const SizedBox(height: 20),
          const Text(
            "Refer & Earn Coins",
            style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          const Text(
            "Share your code with friends. When they register and do their first offer, you get +250 Coins and they get +50 Coins!",
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey, fontSize: 13),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF14141B),
              border: Border.all(color: const Color(0xFF252535)),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  user.id.toUpperCase(),
                  style: const TextStyle(color: Color(0xFFFFD54A), fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 2),
                ),
                const SizedBox(width: 12),
                IconButton(
                  icon: const Icon(Icons.copy, color: Colors.white70),
                  onPressed: () {
                    // Copy action (mocked)
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Code copied to clipboard!")),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// SUPPORT TAB
// -------------------------------------------------------------
class SupportTab extends StatefulWidget {
  const SupportTab({super.key});

  @override
  State<SupportTab> createState() => _SupportTabState();
}

class _SupportTabState extends State<SupportTab> {
  final List<Map<String, String>> _messages = [
    {'sender': 'agent', 'text': 'Welcome to ExtraEarn Live Support. Describe your issue and we\'ll reply instantly.'}
  ];
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              final isAgent = msg['sender'] == 'agent';
              return Align(
                alignment: isAgent ? Alignment.centerLeft : Alignment.centerRight,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isAgent ? const Color(0xFF1E1E24) : const Color(0xFF7C3AED),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    msg['text']!,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                  ),
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(8),
          color: const Color(0xFF0B0B0F),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: "Type a message...",
                    hintStyle: TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send, color: Color(0xFFFFD54A)),
                onPressed: () {
                  final text = _controller.text.trim();
                  if (text.isEmpty) return;
                  setState(() {
                    _messages.add({'sender': 'user', 'text': text});
                    _controller.clear();
                  });
                  // Trigger simulated bot reply
                  Timer(const Duration(seconds: 1), () {
                    if (mounted) {
                      setState(() {
                        _messages.add({
                          'sender': 'agent',
                          'text': 'Our support staff is reviewing your request. Please wait 10-15 minutes.'
                        });
                      });
                    }
                  });
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// -------------------------------------------------------------
// PLAY GAME SCREEN
// -------------------------------------------------------------
class PlayGameScreen extends StatefulWidget {
  const PlayGameScreen({super.key});

  @override
  State<PlayGameScreen> createState() => _PlayGameScreenState();
}

class _PlayGameScreenState extends State<PlayGameScreen> {
  WebViewController? _controller;
  bool _isLoadingWebView = false;
  List<String> _games = [];
  bool _loadingGames = true;
  String? _selectedGame;

  @override
  void initState() {
    super.initState();
    _loadGames();
  }

  Future<void> _loadGames() async {
    if (!mounted) return;
    setState(() {
      _loadingGames = true;
    });
    final api = Provider.of<ApiService>(context, listen: false);
    final games = await api.fetchGamesList();
    if (!mounted) return;
    setState(() {
      _games = games;
      _loadingGames = false;
    });
  }

  void _selectGame(String gameFile) {
    final api = Provider.of<ApiService>(context, listen: false);
    final user = api.currentUser;
    final userId = user?.id ?? '';
    
    final serverBase = ApiService.baseUrl.replaceAll('/api', '');
    final url = Uri.parse("$serverBase/$gameFile?userId=$userId");

    setState(() {
      _selectedGame = gameFile;
      _isLoadingWebView = true;
    });

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF070709))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoadingWebView = true;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoadingWebView = false;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint("WebView error: ${error.description}");
          },
        ),
      )
      ..loadRequest(
        url,
        headers: {'Bypass-Tunnel-Reminder': 'true'},
      );
  }

  String _formatGameTitle(String gameFile) {
    if (gameFile == 'star_catcher.html') return "Star Catcher";
    if (gameFile == 'alice_harvest.html') return "Alice's Harvest";
    if (gameFile == 'tower_blocks.html') return "Tower Blocks";
    if (gameFile == 'memory_match.html') return "Memory Match";
    if (gameFile == 'tap_speed.html') return "Speed Tap";
    if (gameFile == 'block_breaker.html') return "Block Breaker";
    if (gameFile == 'flappy_bird.html') return "Neon Flap";
    if (gameFile == 'tic_tac_toe.html') return "Tic Tac Toe";
    if (gameFile == 'space_dodger.html') return "Space Dodger";
    if (gameFile == 'color_tap.html') return "Color Tap";
    if (gameFile == 'word_scramble.html') return "Word Scramble";
    if (gameFile == 'number_sliding.html') return "Number Slider";
    
    final cleanName = gameFile.replaceAll('.html', '').replaceAll('_', ' ').replaceAll('-', ' ');
    return cleanName.split(' ').map((word) {
      if (word.isEmpty) return '';
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  String _getGameSubtitle(String gameFile) {
    if (gameFile == 'star_catcher.html') return "Catch falling stars & avoid danger";
    if (gameFile == 'alice_harvest.html') return "Infinite bubble-shooter garden";
    if (gameFile == 'tower_blocks.html') return "Stack blocks to build the highest tower";
    if (gameFile == 'memory_match.html') return "Match identical cards under time pressure";
    if (gameFile == 'tap_speed.html') return "Tap as fast as you can before time runs out";
    if (gameFile == 'block_breaker.html') return "Bounce the ball to destroy all obstacles";
    if (gameFile == 'flappy_bird.html') return "Flap through barriers to reach new highs";
    if (gameFile == 'tic_tac_toe.html') return "Outsmart the AI in a classic match";
    if (gameFile == 'space_dodger.html') return "Dodge meteorites traveling through deep space";
    if (gameFile == 'color_tap.html') return "Tap the actual text color matching the word";
    if (gameFile == 'word_scramble.html') return "Unscramble words to test your vocabulary";
    if (gameFile == 'number_sliding.html') return "Merge matching numbers to reach 2048";
    return "Play and claim coin rewards!";
  }

  IconData _getGameIcon(String gameFile) {
    if (gameFile == 'star_catcher.html') return Icons.star_rounded;
    if (gameFile == 'alice_harvest.html') return Icons.yard_rounded;
    if (gameFile == 'tower_blocks.html') return Icons.layers_rounded;
    if (gameFile == 'memory_match.html') return Icons.style_rounded;
    if (gameFile == 'tap_speed.html') return Icons.touch_app_rounded;
    if (gameFile == 'block_breaker.html') return Icons.grid_on_rounded;
    if (gameFile == 'flappy_bird.html') return Icons.flight_rounded;
    if (gameFile == 'tic_tac_toe.html') return Icons.grid_3x3_rounded;
    if (gameFile == 'space_dodger.html') return Icons.rocket_launch_rounded;
    if (gameFile == 'color_tap.html') return Icons.palette_rounded;
    if (gameFile == 'word_scramble.html') return Icons.sort_by_alpha_rounded;
    if (gameFile == 'number_sliding.html') return Icons.filter_9_plus_rounded;
    return Icons.sports_esports_rounded;
  }

  Color _getGameColor(String gameFile) {
    if (gameFile == 'star_catcher.html') return const Color(0xFFFFD54A);
    if (gameFile == 'alice_harvest.html') return const Color(0xFF4ADE80);
    if (gameFile == 'tower_blocks.html') return const Color(0xFFF472B6);
    if (gameFile == 'memory_match.html') return const Color(0xFFA78BFA);
    if (gameFile == 'tap_speed.html') return const Color(0xFFFB7185);
    if (gameFile == 'block_breaker.html') return const Color(0xFF34D399);
    if (gameFile == 'flappy_bird.html') return const Color(0xFFF59E0B);
    if (gameFile == 'tic_tac_toe.html') return const Color(0xFF60A5FA);
    if (gameFile == 'space_dodger.html') return const Color(0xFF38BDF8);
    if (gameFile == 'color_tap.html') return const Color(0xFFEC4899);
    if (gameFile == 'word_scramble.html') return const Color(0xFF10B981);
    if (gameFile == 'number_sliding.html') return const Color(0xFF8B5CF6);
    return const Color(0xFF38BDF8);
  }

  @override
  Widget build(BuildContext context) {
    if (_selectedGame == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF070709),
        appBar: AppBar(
          title: const Text("Arcade Lobby", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFF0B0B0F),
          elevation: 0,
        ),
        body: _loadingGames
            ? const Center(
                child: CircularProgressIndicator(
                  color: Color(0xFFFFD54A),
                ),
              )
            : _games.isEmpty
                ? const Center(
                    child: Text(
                      "No games available at the moment.",
                      style: TextStyle(color: Colors.white70, fontSize: 16),
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "SELECT A GAME TO PLAY",
                          style: TextStyle(
                            color: Color(0xFFFFD54A),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Expanded(
                          child: ListView.builder(
                            itemCount: _games.length,
                            itemBuilder: (context, index) {
                              final game = _games[index];
                              final title = _formatGameTitle(game);
                              final subtitle = _getGameSubtitle(game);
                              final icon = _getGameIcon(game);
                              final accentColor = _getGameColor(game);
                              
                              return Container(
                                margin: const EdgeInsets.only(bottom: 16),
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [
                                      Color(0xFF14141B),
                                      Color(0xFF1B1B26),
                                    ],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: accentColor.withOpacity(0.15),
                                    width: 1.5,
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: accentColor.withOpacity(0.05),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(16),
                                  onTap: () => _selectGame(game),
                                  child: Padding(
                                    padding: const EdgeInsets.all(18.0),
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: accentColor.withOpacity(0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: Icon(
                                            icon,
                                            color: accentColor,
                                            size: 28,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                title,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 18,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                subtitle,
                                                style: const TextStyle(
                                                  color: Colors.white60,
                                                  fontSize: 13,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Icon(
                                          Icons.arrow_forward_ios_rounded,
                                          color: Colors.white.withOpacity(0.3),
                                          size: 16,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF070709),
      appBar: AppBar(
        title: Text(_formatGameTitle(_selectedGame!), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0B0F),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            setState(() {
              _selectedGame = null;
              _controller = null;
            });
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: () {
              _controller?.reload();
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          if (_controller != null) WebViewWidget(controller: _controller!),
          if (_isLoadingWebView)
            const Center(
              child: CircularProgressIndicator(
                color: Color(0xFFFFD54A),
              ),
            ),
        ],
      ),
    );
  }
}

// -------------------------------------------------------------
// SPIN WHEEL SCREEN
// -------------------------------------------------------------
class SpinWheelScreen extends StatefulWidget {
  const SpinWheelScreen({super.key});

  @override
  State<SpinWheelScreen> createState() => _SpinWheelScreenState();
}

class _SpinWheelScreenState extends State<SpinWheelScreen> {
  double _rotationAngle = 0.0;
  bool _isSpinning = false;

  void _spinWheel() {
    if (_isSpinning) return;
    setState(() {
      _isSpinning = true;
    });

    final randomAngle = 2 * pi * 5 + (Random().nextDouble() * 2 * pi);
    setState(() {
      _rotationAngle += randomAngle;
    });

    Timer(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _isSpinning = false;
        });
        final api = Provider.of<ApiService>(context, listen: false);
        api.adjustCoins(100, "Spin Wheel Win");
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Congratulations! You won +100 Coins!")),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070709),
      appBar: AppBar(
        title: const Text("Spin & Win", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0B0F),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedRotation(
              turns: _rotationAngle / (2 * pi),
              duration: const Duration(seconds: 3),
              curve: Curves.decelerate,
              child: Container(
                width: 250,
                height: 250,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: SweepGradient(
                    colors: [Colors.red, Colors.orange, Colors.yellow, Colors.green, Colors.blue, Colors.purple, Colors.red],
                  ),
                ),
                child: Center(
                  child: Container(
                    width: 50,
                    height: 50,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_downward, color: Colors.black),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFFD54A),
                foregroundColor: Colors.black,
                minimumSize: const Size(200, 50),
              ),
              onPressed: _spinWheel,
              child: Text(_isSpinning ? "Spinning..." : "SPIN NOW", style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// SCRATCH CARD SCREEN
// -------------------------------------------------------------
class ScratchCardScreen extends StatefulWidget {
  const ScratchCardScreen({super.key});

  @override
  State<ScratchCardScreen> createState() => _ScratchCardScreenState();
}

class _ScratchCardScreenState extends State<ScratchCardScreen> {
  bool _isScratched = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070709),
      appBar: AppBar(
        title: const Text("Scratch & Earn", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0B0F),
        elevation: 0,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GestureDetector(
              onPanUpdate: (details) {
                if (!_isScratched) {
                  setState(() {
                    _isScratched = true;
                  });
                  final api = Provider.of<ApiService>(context, listen: false);
                  api.adjustCoins(150, "Scratch Card Win");
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Congratulations! You won +150 Coins!")),
                  );
                }
              },
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  color: const Color(0xFF14141B),
                  border: Border.all(color: const Color(0xFF252535)),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Center(
                  child: _isScratched
                      ? const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.monetization_on, color: Color(0xFFFFD54A), size: 60),
                            SizedBox(height: 10),
                            Text("150 COINS", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                          ],
                        )
                      : Container(
                          width: double.infinity,
                          height: double.infinity,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(colors: [Color(0xFF7C3AED), Color(0xFF5B21B6)]),
                            borderRadius: BorderRadius.circular(15),
                          ),
                          child: const Center(
                            child: Text(
                              "Swipe here to Scratch!",
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// DAILY QUIZ SCREEN
// -------------------------------------------------------------
class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _questionIndex = 0;
  final List<Map<String, dynamic>> _questions = [
    {
      'question': "Which programming language is mainly used for native Android apps?",
      'options': ["Swift", "Kotlin/Java", "PHP", "C#"],
      'answer': 1
    },
    {
      'question': "How many coins make exactly ₹1 INR in ExtraEarn?",
      'options': ["10 coins", "50 coins", "100 coins", "1000 coins"],
      'answer': 2
    }
  ];

  void _answerQuestion(int index) {
    final isCorrect = index == _questions[_questionIndex]['answer'];
    if (isCorrect) {
      final api = Provider.of<ApiService>(context, listen: false);
      api.adjustCoins(20, "Daily Quiz Win");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Correct Answer! +20 Coins added.")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Wrong Answer! Try again tomorrow.")),
      );
    }
    setState(() {
      _questionIndex++;
    });
  }

  @override
  Widget build(BuildContext context) {
    final quizComplete = _questionIndex >= _questions.length;
    return Scaffold(
      backgroundColor: const Color(0xFF070709),
      appBar: AppBar(
        title: const Text("Daily Quiz", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0B0F),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: quizComplete
            ? const Center(
                child: Text(
                  "Quiz completed for today! Come back tomorrow.",
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _questions[_questionIndex]['question'],
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 30),
                  ...List.generate(
                    _questions[_questionIndex]['options'].length,
                    (index) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF14141B),
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFF252535)),
                          minimumSize: const Size(double.infinity, 50),
                        ),
                        onPressed: () => _answerQuestion(index),
                        child: Text(_questions[_questionIndex]['options'][index]),
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

// -------------------------------------------------------------
// WATCH ADS SCREEN
// -------------------------------------------------------------
class WatchAdsScreen extends StatefulWidget {
  const WatchAdsScreen({super.key});

  @override
  State<WatchAdsScreen> createState() => _WatchAdsScreenState();
}

class _WatchAdsScreenState extends State<WatchAdsScreen> {
  int _secondsLeft = 5;
  Timer? _timer;
  bool _isPlaying = false;
  bool _isFinished = false;
  String _currentAdNetwork = 'Google AdMob';

  void _startAd(String network) {
    setState(() {
      _currentAdNetwork = network;
      _secondsLeft = 5;
      _isPlaying = true;
      _isFinished = false;
    });
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (mounted) {
        setState(() {
          if (_secondsLeft > 1) {
            _secondsLeft--;
          } else {
            _timer?.cancel();
            _isPlaying = false;
            _isFinished = true;
            // Reward coins
            final api = Provider.of<ApiService>(context, listen: false);
            api.adjustCoins(api.settings.adReward, "Watch Ad Reward");
          }
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final api = context.watch<ApiService>();
    final adReward = api.settings.adReward;
    return Scaffold(
      backgroundColor: const Color(0xFF070709),
      appBar: AppBar(
        title: const Text("Watch Ads & Earn", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0B0B0F),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (!_isPlaying && !_isFinished) ...[
              const SizedBox(height: 20),
              const Icon(Icons.play_circle_filled, color: Color(0xFFFFD54A), size: 70),
              const SizedBox(height: 10),
              const Text("Ad Networks Available", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const Text("Watch sponsor videos to claim instant coins", style: TextStyle(color: Colors.grey, fontSize: 12)),
              const SizedBox(height: 24),
              _buildAdCard("Google AdMob Video", "High Payout • Anti Fraud", Colors.blue),
              const SizedBox(height: 12),
              _buildAdCard("Unity Interstitial Ad", "Instant Fill • Non-Skippable", Colors.purple),
              const SizedBox(height: 12),
              _buildAdCard("AppLovin Video Offer", "Quick load • Reliable", Colors.orange),
            ] else if (_isPlaying) ...[
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF14141B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF252535)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.tv_off, color: Colors.grey, size: 60),
                      const SizedBox(height: 20),
                      Text("Playing $_currentAdNetwork Sponsored Ad...", style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 10),
                      Text("Closing in $_secondsLeft seconds...", style: const TextStyle(color: Color(0xFFFFD54A), fontSize: 14)),
                      const SizedBox(height: 24),
                      const LinearProgressIndicator(color: Color(0xFFFFD54A), backgroundColor: Color(0xFF252535)),
                    ],
                  ),
                ),
              ),
            ] else if (_isFinished) ...[
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 80),
                    const SizedBox(height: 20),
                    const Text("Reward Granted!", style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    Text("You watched the sponsored ad and earned +$adReward Coins!", textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey, fontSize: 14)),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFD54A),
                        foregroundColor: Colors.black,
                        minimumSize: const Size(200, 50),
                      ),
                      onPressed: () {
                        setState(() {
                          _isFinished = false;
                        });
                      },
                      child: const Text("Watch Another", style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAdCard(String title, String desc, Color color) {
    return GestureDetector(
      onTap: () => _startAd(title),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF14141B),
          border: Border.all(color: const Color(0xFF252535)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(Icons.video_library, color: color, size: 30),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  Text(desc, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 14),
          ],
        ),
      ),
    );
  }
}


