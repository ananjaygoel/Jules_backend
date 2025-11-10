const Series = require('../models/series');

exports.searchSeries = async (req, res) => {
  try {
    const { query } = req.query;
    const series = await Series.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } },
      ],
    });
    res.status(200).json(series);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
