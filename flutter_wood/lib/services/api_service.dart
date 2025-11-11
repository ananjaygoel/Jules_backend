import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/user.dart';
import '../models/series.dart';
import '../models/episode.dart';

class ApiService {
  static String get baseUrl {
    // Try to get from environment, fallback to localhost
    final envUrl = dotenv.env['API_BASE_URL'];
    return envUrl ?? 'http://localhost:3000/api';
  }

  Future<Map<String, String>> _getHeaders(String? token) async {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // User endpoints
  Future<User> register(String firebaseUid, String name, String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/user/register'),
      headers: await _getHeaders(null),
      body: jsonEncode(
          {'firebaseUid': firebaseUid, 'name': name, 'email': email}),
    );
    if (response.statusCode == 201) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to register');
    }
  }

  Future<User> getUser(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/user/me'),
      headers: await _getHeaders(token),
    );
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get user');
    }
  }

  Future<User> updateUser(String token, Map<String, dynamic> updates) async {
    final response = await http.put(
      Uri.parse('$baseUrl/user/me'),
      headers: await _getHeaders(token),
      body: jsonEncode(updates),
    );
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update user');
    }
  }

  // Feed endpoints
  Future<Map<String, dynamic>> getHomeFeed(
      {int page = 1, int limit = 10}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/feed?page=$page&limit=$limit'),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {
        'series':
            (data['series'] as List).map((s) => Series.fromJson(s)).toList(),
        'total': data['total'],
        'page': data['page'],
        'pages': data['pages'],
      };
    } else {
      throw Exception('Failed to get home feed');
    }
  }

  Future<Map<String, dynamic>> getSeries(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/feed/series/$id'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {
        'series': Series.fromJson(data['series']),
        'episodes':
            (data['episodes'] as List).map((e) => Episode.fromJson(e)).toList(),
      };
    } else {
      throw Exception('Failed to get series');
    }
  }

  Future<Episode> getEpisode(String token, String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/feed/episode/$id'),
      headers: await _getHeaders(token),
    );
    if (response.statusCode == 200) {
      return Episode.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to get episode: ${response.body}');
    }
  }

  // Tasks endpoints
  Future<Map<String, dynamic>> completeProfile(String token) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tasks/onetime/complete-profile'),
      headers: await _getHeaders(token),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to complete profile');
    }
  }

  Future<Map<String, dynamic>> followSocialMedia(String token) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tasks/onetime/follow-social'),
      headers: await _getHeaders(token),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to follow social media');
    }
  }

  Future<Map<String, dynamic>> watchAd(String token) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tasks/daily/watch-ad'),
      headers: await _getHeaders(token),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to watch ad');
    }
  }

  Future<Map<String, dynamic>> spinWheel(String token) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tasks/ambitious/spin-wheel'),
      headers: await _getHeaders(token),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to spin wheel');
    }
  }

  Future<Map<String, dynamic>> claimSpinReward(
      String token, String result) async {
    final response = await http.post(
      Uri.parse('$baseUrl/tasks/ambitious/claim-spin-reward'),
      headers: await _getHeaders(token),
      body: jsonEncode({'result': result}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to claim reward');
    }
  }

  // Search
  Future<Map<String, dynamic>> searchSeries(String query,
      {int page = 1, int limit = 10}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/search?query=$query&page=$page&limit=$limit'),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return {
        'series':
            (data['series'] as List).map((s) => Series.fromJson(s)).toList(),
        'total': data['total'],
        'page': data['page'],
        'pages': data['pages'],
      };
    } else {
      throw Exception('Failed to search series');
    }
  }

  // Payment
  Future<Map<String, dynamic>> createPaymentIntent(
      String token, int amount, String currency) async {
    final response = await http.post(
      Uri.parse('$baseUrl/payment/create-payment-intent'),
      headers: await _getHeaders(token),
      body: jsonEncode({'amount': amount, 'currency': currency}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create payment intent');
    }
  }

  Future<Map<String, dynamic>> createSubscription(
      String token, String? couponCode) async {
    final body = couponCode != null ? {'couponCode': couponCode} : {};
    final response = await http.post(
      Uri.parse('$baseUrl/payment/create-subscription'),
      headers: await _getHeaders(token),
      body: jsonEncode(body),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create subscription');
    }
  }
}
