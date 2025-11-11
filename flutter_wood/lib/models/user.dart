class User {
  final String id;
  final String firebaseUid;
  final String name;
  final String email;
  final DateTime? dateOfBirth;
  final String? country;
  final List<String> preferredGenres;
  int coins;
  final String role;
  int dailyAdCount;
  final String? lastAdWatched;
  bool profileCompleted;
  bool followedSocialMedia;
  final DateTime? lastMonthlyBonus;
  final String? lastSpinDate;
  final String? stripeCustomerId;
  final String subscriptionStatus;
  final DateTime? subscriptionExpiry;
  final String? gender;

  User({
    required this.id,
    required this.firebaseUid,
    required this.name,
    required this.email,
    this.dateOfBirth,
    this.country,
    this.preferredGenres = const [],
    this.coins = 0,
    this.role = 'user',
    this.dailyAdCount = 0,
    this.lastAdWatched,
    this.profileCompleted = false,
    this.followedSocialMedia = false,
    this.lastMonthlyBonus,
    this.lastSpinDate,
    this.stripeCustomerId,
    this.subscriptionStatus = 'inactive',
    this.subscriptionExpiry,
    this.gender,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'],
      firebaseUid: json['firebaseUid'],
      name: json['name'],
      email: json['email'],
      dateOfBirth: json['date_of_birth'] != null
          ? DateTime.parse(json['date_of_birth'])
          : null,
      country: json['country'],
      preferredGenres: List<String>.from(json['preferred_genres'] ?? []),
      coins: json['coins'] ?? 0,
      role: json['role'] ?? 'user',
      dailyAdCount: json['dailyAdCount'] ?? 0,
      lastAdWatched: json['lastAdWatched'],
      profileCompleted: json['profileCompleted'] ?? false,
      followedSocialMedia: json['followedSocialMedia'] ?? false,
      lastMonthlyBonus: json['lastMonthlyBonus'] != null
          ? DateTime.parse(json['lastMonthlyBonus'])
          : null,
      lastSpinDate: json['lastSpinDate'],
      stripeCustomerId: json['stripeCustomerId'],
      subscriptionStatus: json['subscriptionStatus'] ?? 'inactive',
      subscriptionExpiry: json['subscriptionExpiry'] != null
          ? DateTime.parse(json['subscriptionExpiry'])
          : null,
      gender: json['gender'],
    );
  }
}
