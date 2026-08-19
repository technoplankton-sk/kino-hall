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
            reject({ status: res.statusCode, message: 'Ошибка парсинга JSON: ' + e.message, body });
          }
        } else {
          reject({ status: res.statusCode, message: `Сервер ответил статусом ${res.statusCode}`, body });
        }
      });
    });

    req.on('error', (err) => {
      reject({ status: 500, message: 'Ошибка сетевого запроса NodeJS: ' + err.message });
    });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { action, q } = req.query;

  // Используем бесплатный открытый зеркало-эндпоинт TMDB
  let targetUrl = 'https://api.themoviedb.org/3/movie/popular?api_key=3fd2be6f0cd0ed1635c61b9333f69e22&language=ru-RU&page=1';

  // Альтернативное публичное зеркало без авторизации
  let mirrorUrl = 'https://tmdb-api-proxy.vercel.app/movie/popular';

  if (action === 'search' && q) {
    mirrorUrl = `https://tmdb-api-proxy.vercel.app/search/movie?query=${encodeURIComponent(q)}`;
  }

  try {
    const data = await fetchJson(mirrorUrl);
    return res.status(200).json(data);
  } catch (err) {
    // В случае сбоя прокси запрашиваем базовый резервный список
    try {
      const fallbackData = await fetchJson('https://api.tvmaze.com/search/shows?q=' + encodeURIComponent(q || 'taxi'));
      const formatted = {
        results: fallbackData.map(item => ({
          id: item.show.id,
          title: item.show.name,
          poster_path: item.show.image ? item.show.image.medium.replace('https://image.tmdb.org/t/p/w500', '') : null
        }))
      };
      return res.status(200).json(formatted);
    } catch (e) {
      return res.status(500).json({
        error: true,
        status: err.status || 500,
        message: err.message || 'Ошибка подключения к базе данных',
        details: err.body || null
      });
    }
  }
};
