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
            reject({ status: res.statusCode, message: 'JSON Parse error', body });
          }
        } else {
          reject({ status: res.statusCode, message: `Status ${res.statusCode}`, body });
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
  const searchQuery = q || 'taxi';

  try {
    // Ищем через TVMaze + OMDb для 100% стабильности без блокировок ключей
    const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(searchQuery)}`;
    const data = await fetchJson(url);

    const formatted = data.map(item => {
      const show = item.show || {};
      let poster = 'https://via.placeholder.com/500x750/161920/ffffff?text=Нет+обложки';
      
      if (show.image && show.image.original) {
        poster = show.image.original;
      } else if (show.image && show.image.medium) {
        poster = show.image.medium;
      }

      return {
        id: show.externals ? show.externals.imdb || show.id : show.id,
        title: show.name || 'Без названия',
        poster: poster,
        year: show.premiered ? show.premiered.split('-')[0] : '—',
        rating: show.rating && show.rating.average ? show.rating.average : '—'
      };
    });

    return res.status(200).json({ results: formatted });

  } catch (err) {
    return res.status(500).json({
      error: true,
      message: err.message || 'Ошибка сервера',
      results: []
    });
  }
};
