const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject({ status: res.statusCode, message: 'JSON error' });
          }
        } else {
          reject({ status: res.statusCode, message: `Status ${res.statusCode}` });
        }
      });
    });

    req.on('error', (err) => reject({ status: 500, message: err.message }));
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { action, q } = req.query;
  const query = q || 'Taxi';

  try {
    // Поиск по открытому агрегатору Кинопоиска/IMDb для фильмов Люка Бессона и мирового кино
    const searchUrl = `https://kinopoiskapiuncensored.net/api/search?query=${encodeURIComponent(query)}`;
    const data = await fetchJson(searchUrl);

    const formatted = (data.docs || data.results || []).map(item => {
      return {
        id: item.kinopoiskId || item.id || item.imdbId,
        imdbId: item.imdbId || (item.externalId ? item.externalId.imdb : null),
        title: item.nameRu || item.title || item.nameEn || 'Без названия',
        poster: item.posterUrl || item.poster || `https://kinopoiskapiuncensored.net/images/posters/kp/${item.kinopoiskId || item.id}.jpg`,
        year: item.year || '—',
        rating: item.ratingKinopoisk || item.rating || '—'
      };
    });

    return res.status(200).json({ results: formatted });

  } catch (err) {
    // Резервный поиск по англоязычной базе фильмов, если основной не ответил
    try {
      const fallbackUrl = `https://www.omdbapi.com/?apikey=trilogy&s=${encodeURIComponent(query)}&type=movie`;
      const fallbackData = await fetchJson(fallbackUrl);
      
      const formattedFallback = (fallbackData.Search || []).map(item => ({
        id: item.imdbID,
        imdbId: item.imdbID,
        title: item.Title,
        poster: item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/500x750/161920/ffffff?text=Нет+обложки',
        year: item.Year,
        rating: '—'
      }));

      return res.status(200).json({ results: formattedFallback });
    } catch (e) {
      return res.status(200).json({ results: [] });
    }
  }
};
