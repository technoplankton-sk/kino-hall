const https = require('https');

const TMDB_KEY = '3fd2be6f0cd0ed1635c61b9333f69e22';

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
            reject({ status: res.statusCode, message: 'JSON Error' });
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
  const query = q || 'омен';

  try {
    // 1. Пробуем найти по локали ru-RU
    let searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&language=ru-RU&query=${encodeURIComponent(query)}`;
    let data = await fetchJson(searchUrl);

    // 2. Если на русском не нашло, ищем без привязки к языку (для оригинальных названий)
    if (!data.results || data.results.length === 0) {
      searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`;
      data = await fetchJson(searchUrl);
    }

    // Получаем детали фильма (включая IMDb ID)
    const formatted = await Promise.all((data.results || []).slice(0, 18).map(async (item) => {
      let imdbId = null;
      try {
        const detailsUrl = `https://api.themoviedb.org/3/movie/${item.id}?api_key=${TMDB_KEY}`;
        const details = await fetchJson(detailsUrl);
        imdbId = details.imdb_id;
      } catch (e) {}

      return {
        id: item.id,
        imdbId: imdbId,
        title: item.title || item.original_title || 'Без названия',
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://via.placeholder.com/500x750/161920/ffffff?text=Нет+обложки',
        year: item.release_date ? item.release_date.split('-')[0] : '—',
        rating: item.vote_average ? item.vote_average.toFixed(1) : '—'
      };
    }));

    return res.status(200).json({ results: formatted });

  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, results: [] });
  }
};
