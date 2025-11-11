class Series {
  final String id;
  final String title;
  final String description;
  final String genre;
  final String coverImageUrl;

  Series({
    required this.id,
    required this.title,
    required this.description,
    required this.genre,
    required this.coverImageUrl,
  });

  factory Series.fromJson(Map<String, dynamic> json) {
    return Series(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      genre: json['genre'],
      coverImageUrl: json['coverImageUrl'],
    );
  }
}