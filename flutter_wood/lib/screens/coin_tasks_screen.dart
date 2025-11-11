import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';

class CoinTasksScreen extends StatelessWidget {
  const CoinTasksScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final user = userProvider.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Earn Coins')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text('Coins: ${user?.coins ?? 0}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            const Text('One-time Tasks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            if (!(user?.profileCompleted ?? true))
              ElevatedButton(
                onPressed: () async {
                  try {
                    await userProvider.completeProfile();
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile completed!')));
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                  }
                },
                child: const Text('Complete Profile (100-300 coins)'),
              ),
            if (!(user?.followedSocialMedia ?? true))
              ElevatedButton(
                onPressed: () async {
                  try {
                    await userProvider.followSocialMedia();
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Followed!')));
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                  }
                },
                child: const Text('Follow on Social Media (150 coins)'),
              ),
            const SizedBox(height: 20),
            const Text('Daily Tasks', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ElevatedButton(
              onPressed: () async {
                try {
                  await userProvider.watchAd();
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ad watched!')));
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                }
              },
              child: const Text('Watch Ad'),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  final result = await userProvider.spinWheel();
                  // Show result and prompt for ad
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text('Spin Result'),
                      content: Text('Result: ${result['result']} - Potential: ${result['potentialCoins']} coins'),
                      actions: [
                        TextButton(
                          onPressed: () async {
                            // Simulate ad watch
                            await userProvider.claimSpinReward(result['result']);
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reward claimed!')));
                          },
                          child: const Text('Watch Ad & Claim'),
                        ),
                      ],
                    ),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                }
              },
              child: const Text('Spin Wheel'),
            ),
          ],
        ),
      ),
    );
  }
}