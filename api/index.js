module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { action, q } = req.query;
  const API_KEY = '3fd2be6f0cd0ed1635c61b9333f69e22';

  let targetUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ru-RU&page=1`;

  if (action === 'search' && q) {
    targetUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(q)}`;
  }

  try {
    let response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    let data = await response.json();

    // Если поисковый запрос на ru-RU вернул 0 результатов, запрашиваем без локали
    if (action === 'search' && q && (!data.results || data.results.length === 0)) {
      const fallbackUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}`;
      response = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      data = await response.json();
    }

    return res.status(200).json(data || { results: [] });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка получения данных', results: [] });
  }
};
