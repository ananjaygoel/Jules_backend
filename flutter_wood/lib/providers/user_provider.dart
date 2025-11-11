import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

class UserProvider with ChangeNotifier {
  User? _user;
  bool _isLoggedIn = false;
  final ApiService _apiService = ApiService();
  final AuthService _authService = AuthService();

  User? get user => _user;
  bool get isLoggedIn => _isLoggedIn;

  Future<void> loadUser() async {
    String? token = await _authService.getToken();
    if (token != null) {
      try {
        _user = await _apiService.getUser(token);
        _isLoggedIn = true;
        notifyListeners();
      } catch (e) {
        // Token invalid, sign out
        await _authService.signOut();
      }
    }
  }

  Future<void> login(String email, String password) async {
    String? token = await _authService.signInWithEmailPassword(email, password);
    if (token != null) {
      _user = await _apiService.getUser(token);
      _isLoggedIn = true;
      notifyListeners();
    }
  }

  Future<void> signUp(String email, String password, String name) async {
    String? token = await _authService.signUpWithEmailPassword(email, password, name);
    if (token != null) {
      _user = await _apiService.getUser(token);
      _isLoggedIn = true;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.signOut();
    _user = null;
    _isLoggedIn = false;
    notifyListeners();
  }

  Future<void> updateUser(Map<String, dynamic> updates) async {
    String? token = await _authService.getToken();
    if (token != null && _user != null) {
      _user = await _apiService.updateUser(token, updates);
      notifyListeners();
    }
  }

  Future<void> completeProfile() async {
    String? token = await _authService.getToken();
    if (token != null) {
      final result = await _apiService.completeProfile(token);
      _user!.coins += result['coins_earned'];
      _user!.profileCompleted = true;
      notifyListeners();
    }
  }

  Future<void> followSocialMedia() async {
    String? token = await _authService.getToken();
    if (token != null) {
      final result = await _apiService.followSocialMedia(token);
      _user!.coins += result['coins_earned'];
      _user!.followedSocialMedia = true;
      notifyListeners();
    }
  }

  Future<void> watchAd() async {
    String? token = await _authService.getToken();
    if (token != null) {
      final result = await _apiService.watchAd(token);
      _user!.coins += result['coins_earned'];
      _user!.dailyAdCount++;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> spinWheel() async {
    String? token = await _authService.getToken();
    if (token != null) {
      return await _apiService.spinWheel(token);
    }
    throw Exception('Not logged in');
  }

  Future<void> claimSpinReward(String result) async {
    String? token = await _authService.getToken();
    if (token != null) {
      final reward = await _apiService.claimSpinReward(token, result);
      _user!.coins += reward['coins_earned'];
      notifyListeners();
    }
  }
}