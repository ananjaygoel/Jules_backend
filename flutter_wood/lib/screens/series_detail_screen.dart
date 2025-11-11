import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import '../models/series.dart';
import '../models/episode.dart';
import '../services/api_service.dart';
import '../providers/user_provider.dart';
import 'package:provider/provider.dart';

class SeriesDetailScreen extends StatefulWidget {
  final String seriesId;

  const SeriesDetailScreen({super.key, required this.seriesId});

  @override
  _SeriesDetailScreenState createState() => _SeriesDetailScreenState();
}

class _SeriesDetailScreenState extends State<SeriesDetailScreen> {
  final ApiService _apiService = ApiService();
  Series? _series;
  List<Episode> _episodes = [];
  bool _isLoading = true;
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;

  @override
  void initState() {
    super.initState();
    _loadSeries();
  }

  Future<void> _loadSeries() async {
    try {
      final data = await _apiService.getSeries(widget.seriesId);
      setState(() {
        _series = data['series'];
        _episodes = data['episodes'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load series: $e')));
    }
  }

  Future<void> _playEpisode(String episodeId) async {
    try {
      final userProvider = Provider.of<UserProvider>(context, listen: false);
      final ep = await _apiService.getEpisode(await userProvider._authService.getToken() ?? '', episodeId);
      _videoController = VideoPlayerController.networkUrl(Uri.parse(ep.videoUrl));
      await _videoController!.initialize();
      _chewieController = ChewieController(
        videoPlayerController: _videoController!,
        autoPlay: true,
        looping: false,
      );
      showDialog(
        context: context,
        builder: (_) => Dialog(
          child: AspectRatio(
            aspectRatio: _videoController!.value.aspectRatio,
            child: Chewie(controller: _chewieController!),
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_series?.title ?? 'Series')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.network(_series!.coverImageUrl, height: 200, fit: BoxFit.cover),
                  const SizedBox(height: 16),
                  Text(_series!.description, style: const TextStyle(fontSize: 16)),
                  const SizedBox(height: 16),
                  Text('Episodes (${_episodes.length})', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _episodes.length,
                    itemBuilder: (context, index) {
                      final episode = _episodes[index];
                      return ListTile(
                        title: Text('Episode ${episode.episodeNumber}'),
                        trailing: ElevatedButton(
                          onPressed: () => _playEpisode(episode.id),
                          child: const Text('Watch'),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
    );
  }
}