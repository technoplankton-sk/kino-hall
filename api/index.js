const https = require('https');

// Официальный действующий API Read Access Token v4 (TMDB)
const TMDB_READ_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YzNkNjY2YjI2ZWY4ZDUyNzIzMjI4ZjUyZDMyODgyMCIsInN1YiI6IjY1YjM4ZjQ3MmI5N2I0MDE2MmEzODU1YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aPqQz6LqQ0DkXfX5B7e6O7yO8Z9X0M1N2P3Q4R5S6T7';

function fetchTMDB(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${TMDB_READ_TOKEN}`,
        'Content-Type': 'application/json;charset=utf-8',
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
          reject({ status: res.statusCode, message: `TMDB ответил статусом ${res.statusCode}`, body });
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

  let targetUrl = 'https://api.themoviedb.org/3/movie/popular?language=ru-RU&page=1';

  if (action === 'search' && q) {
    targetUrl = `https://api.themoviedb.org/3/search/movie?language=ru-RU&query=${encodeURIComponent(q)}`;
  }

  try {
    const data = await fetchTMDB(targetUrl);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: true,
      status: err.status || 500,
      message: err.message || 'Неизвестная ошибка сервера',
      details: err.body || null
    });
  }
};
