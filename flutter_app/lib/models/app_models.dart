class AppUser {
  final String id;
  final String name;
  final String phone;
  int coins;
  int level;
  String status;
  final List<String> devices;
  final String? lastCheckInDate;

  AppUser({
    required this.id,
    required this.name,
    required this.phone,
    required this.coins,
    required this.level,
    required this.status,
    required this.devices,
    this.lastCheckInDate,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      coins: json['coins'] ?? 0,
      level: json['level'] ?? 1,
      status: json['status'] ?? 'Active',
      devices: List<String>.from(json['devices'] ?? []),
      lastCheckInDate: json['lastCheckInDate'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'coins': coins,
        'level': level,
        'status': status,
        'devices': devices,
        'lastCheckInDate': lastCheckInDate,
      };
}

class AppTransaction {
  final String id;
  final String userId;
  final String type;
  final int amount;
  final String timestamp;
  String status;
  final String details;
  final String? redeemCode;

  AppTransaction({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.timestamp,
    required this.status,
    this.details = '',
    this.redeemCode,
  });

  factory AppTransaction.fromJson(Map<String, dynamic> json) {
    return AppTransaction(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      type: json['type'] ?? '',
      amount: json['amount'] ?? 0,
      timestamp: json['timestamp'] ?? '',
      status: json['status'] ?? 'Success',
      details: json['details'] ?? '',
      redeemCode: json['redeemCode'],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': userId,
        'type': type,
        'amount': amount,
        'timestamp': timestamp,
        'status': status,
        'details': details,
        'redeemCode': redeemCode,
      };
}

class AppSettings {
  bool maintenanceMode;
  bool forceUpdate;
  int adReward;
  int dailyCheckin;
  int adClicks;
  double adRevenue;
  String? broadcastTitle;
  String? broadcastMsg;
  String? broadcastTime;
  String appName;
  String appTitle;
  String appSubtitle;
  String primaryColor;
  String backgroundColor;
  String secondaryColor;
  String cardColor;
  String borderColor;
  bool webAppEnabled;
  String webAppUrl;
  List<QuickGameConfig> quickGames;
  List<OnboardingSlideConfig> onboardingSlides;
  List<String> withdrawMethods;

  AppSettings({
    required this.maintenanceMode,
    required this.forceUpdate,
    required this.adReward,
    required this.dailyCheckin,
    required this.adClicks,
    required this.adRevenue,
    this.broadcastTitle,
    this.broadcastMsg,
    this.broadcastTime,
    required this.appName,
    required this.appTitle,
    required this.appSubtitle,
    required this.primaryColor,
    required this.backgroundColor,
    required this.secondaryColor,
    required this.cardColor,
    required this.borderColor,
    required this.webAppEnabled,
    required this.webAppUrl,
    required this.quickGames,
    required this.onboardingSlides,
    required this.withdrawMethods,
  });

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      maintenanceMode: json['maintenanceMode'] ?? false,
      forceUpdate: json['forceUpdate'] ?? false,
      adReward: json['adReward'] ?? 15,
      dailyCheckin: json['dailyCheckin'] ?? 50,
      adClicks: json['adClicks'] ?? 0,
      adRevenue: (json['adRevenue'] ?? 0.0).toDouble(),
      broadcastTitle: json['broadcastTitle'],
      broadcastMsg: json['broadcastMsg'],
      broadcastTime: json['broadcastTime'],
      appName: json['appName'] ?? 'ExtraEarn',
      appTitle: json['appTitle'] ?? 'ExtraEarn Pro',
      appSubtitle: json['appSubtitle'] ?? 'TURN TIME INTO REAL COINS',
      primaryColor: json['primaryColor'] ?? '#FFD54A',
      backgroundColor: json['backgroundColor'] ?? '#070709',
      secondaryColor: json['secondaryColor'] ?? '#7C3AED',
      cardColor: json['cardColor'] ?? '#14141B',
      borderColor: json['borderColor'] ?? '#252535',
      webAppEnabled: json['webAppEnabled'] ?? false,
      webAppUrl: json['webAppUrl'] ?? 'app_code/index.html',
      quickGames: (json['quickGames'] as List? ?? [])
          .map((x) => QuickGameConfig.fromJson(x))
          .toList(),
      onboardingSlides: (json['onboardingSlides'] as List? ?? [])
          .map((x) => OnboardingSlideConfig.fromJson(x))
          .toList(),
      withdrawMethods: List<String>.from(json['withdrawMethods'] ?? [
        'UPI',
        'Paytm',
        'Google Play Gift Card',
        'Bank Transfer'
      ]),
    );
  }

  Map<String, dynamic> toJson() => {
        'maintenanceMode': maintenanceMode,
        'forceUpdate': forceUpdate,
        'adReward': adReward,
        'dailyCheckin': dailyCheckin,
        'adClicks': adClicks,
        'adRevenue': adRevenue,
        'broadcastTitle': broadcastTitle,
        'broadcastMsg': broadcastMsg,
        'broadcastTime': broadcastTime,
        'appName': appName,
        'appTitle': appTitle,
        'appSubtitle': appSubtitle,
        'primaryColor': primaryColor,
        'backgroundColor': backgroundColor,
        'secondaryColor': secondaryColor,
        'cardColor': cardColor,
        'borderColor': borderColor,
        'webAppEnabled': webAppEnabled,
        'webAppUrl': webAppUrl,
        'quickGames': quickGames.map((x) => x.toJson()).toList(),
        'onboardingSlides': onboardingSlides.map((x) => x.toJson()).toList(),
        'withdrawMethods': withdrawMethods,
      };
}

class QuickGameConfig {
  final String id;
  final String title;
  final String subtitle;
  final String icon;
  final String iconColor;
  final bool enabled;

  QuickGameConfig({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.iconColor,
    this.enabled = true,
  });

  factory QuickGameConfig.fromJson(Map<String, dynamic> json) {
    return QuickGameConfig(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      subtitle: json['subtitle'] ?? '',
      icon: json['icon'] ?? '',
      iconColor: json['iconColor'] ?? '#FFFFFF',
      enabled: json['enabled'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subtitle': subtitle,
        'icon': icon,
        'iconColor': iconColor,
        'enabled': enabled,
      };
}

class OnboardingSlideConfig {
  final String title;
  final String desc;
  final String icon;

  OnboardingSlideConfig({
    required this.title,
    required this.desc,
    required this.icon,
  });

  factory OnboardingSlideConfig.fromJson(Map<String, dynamic> json) {
    return OnboardingSlideConfig(
      title: json['title'] ?? '',
      desc: json['desc'] ?? '',
      icon: json['icon'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'desc': desc,
        'icon': icon,
      };
}
