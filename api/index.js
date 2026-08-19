const https = require('https');

const API_KEY = '3fd2be6f0cd0ed1635c61b9333f69e22';

function getData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', err => reject(err));
  });
}

module.exports = async (req, res) => {
  // Устанавливаем заголовки CORS и тип ответа
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { action, q } = req.query;

  try {
    if (action === 'search' && q) {
      const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(q)}`;
      const data = await getData(url);
      return res.status(200).json(data);
    } 
    
    // По умолчанию отдаем популярное
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ru-RU&page=1`;
    const data = await getData(url);
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: 'Ошибка загрузки данных с сервера' });
  }
};
