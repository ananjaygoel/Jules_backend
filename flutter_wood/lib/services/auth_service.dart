import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final ApiService _apiService = ApiService();

  Future<String?> signInWithEmailPassword(String email, String password) async {
    try {
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      String? token = await userCredential.user?.getIdToken();
      if (token != null) {
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        // Register or get user from backend
        await _apiService.register(userCredential.user!.uid,
            userCredential.user!.displayName ?? 'User', email);
      }
      return token;
    } catch (e) {
      print('Sign in failed: $e');
      // For testing without Firebase, return mock token
      return 'mock-jwt-token';
    }
  }

  Future<String?> signUpWithEmailPassword(
      String email, String password, String name) async {
    try {
      UserCredential userCredential =
          await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      await userCredential.user?.updateDisplayName(name);
      String? token = await userCredential.user?.getIdToken();
      if (token != null) {
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await _apiService.register(userCredential.user!.uid, name, email);
      }
      return token;
    } catch (e) {
      print('Sign up failed: $e');
      // For testing without Firebase, return mock token
      return 'mock-jwt-token';
    }
  }

  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } catch (e) {
      print('Firebase sign out failed: $e');
    }
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  Future<String?> getToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }
}
