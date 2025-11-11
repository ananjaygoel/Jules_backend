class Episode {
  final String id;
  final String series;
  final int episodeNumber;
  final String videoUrl;

  Episode({
    required this.id,
    required this.series,
    required this.episodeNumber,
    required this.videoUrl,
  });

  factory Episode.fromJson(Map<String, dynamic> json) {
    return Episode(
      id: json['_id'],
      series: json['series'],
      episodeNumber: json['episodeNumber'],
      videoUrl: json['videoUrl'],
    );
  }
}