module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { q } = req.query;
  const searchQuery = (q || '').trim().toLowerCase();

  // Локальная база фильмов с прямыми Kinopoisk / IMDb ID
  const movies = [
    { id: '243', imdb: 'tt0152930', title: 'Такси 1', year: '1998', poster: 'https://image.tmdb.org/t/p/w500/1X8A6cI9gT0I18zIe6YyE5E8U2X.jpg' },
    { id: '844', imdb: 'tt0223897', title: 'Такси 2', year: '2000', poster: 'https://image.tmdb.org/t/p/w500/mXpX3V0O1qA0iA3zUe38Z5M3yX.jpg' },
    { id: '845', imdb: 'tt0313803', title: 'Такси 3', year: '2003', poster: 'https://image.tmdb.org/t/p/w500/4k4Z2e1z4U0E3y8U5Z1e4R2t3Y.jpg' },
    { id: '251546', imdb: 'tt0800241', title: 'Такси 4', year: '2007', poster: 'https://image.tmdb.org/t/p/w500/7I2t3E4Y5U6I7O8P9A0S1D2F3G.jpg' },
    { id: '989016', imdb: 'tt6388030', title: 'Такси 5', year: '2018', poster: 'https://image.tmdb.org/t/p/w500/8J9y0X1Z2c3V4B5N6M7K8L9P0O.jpg' },
    { id: '3862', imdb: 'tt0075005', title: 'Омен', year: '1976', poster: 'https://image.tmdb.org/t/p/w500/8I3z2Y1X0C9V8B7N6M5K4L3P2O.jpg' },
    { id: '41519', imdb: 'tt0118767', title: 'Брат', year: '1997', poster: 'https://image.tmdb.org/t/p/w500/A1b2C3d4E5f6G7h8I9j0K1L2M3.jpg' },
    { id: '41520', imdb: 'tt0238119', title: 'Брат 2', year: '2000', poster: 'https://image.tmdb.org/t/p/w500/B2c3D4e5F6g7H8i9J0k1L2m3N4.jpg' },
    { id: '326', imdb: 'tt0111161', title: 'Побег из Шоушенка', year: '1994', poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEmtA3P3I2339C249H.jpg' },
    { id: '435', imdb: 'tt0120689', title: 'Зеленая миля', year: '1999', poster: 'https://image.tmdb.org/t/p/w500/vel9C19vYy2O4A8X4c7U2Z3e4R.jpg' },
    { id: '2360', imdb: 'tt0133093', title: 'Матрица', year: '1999', poster: 'https://image.tmdb.org/t/p/w500/f89U3z1X0C9V8B7N6M5K4L3P2O.jpg' },
    { id: '4092', imdb: 'tt0293508', title: 'Обитель зла', year: '2002', poster: 'https://image.tmdb.org/t/p/w500/6A7B8C9D0E1F2G3H4I5J6K7L8M.jpg' }
  ];

  if (!searchQuery) {
    return res.status(200).json({ results: movies });
  }

  const filtered = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery) || 
    m.year.includes(searchQuery)
  );

  return res.status(200).json({ results: filtered });
};
