const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const API_KEY = '3fd2be6f0cd0ed1635c61b9333f69e22';

app.use(express.static(path.join(__dirname, '../public')));

// Прокси-маршрут для поиска фильмов
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ results: [] });

  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Прокси-маршрут для популярных фильмов
app.get('/api/popular', async (req, res) => {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=ru-RU&page=1`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = app;