const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// M3U / Xtream login
app.post('/login', async (req, res) => {
  const { type, username, password, url } = req.body;
  if (!type || !url) return res.status(400).send('Eksik bilgi');

  try {
    let text;
    if (type === 'xtream') {
      const apiUrl = `${url}/get.php?username=${username}&password=${password}&type=m3u_plus&output=ts`;
      const r = await fetch(apiUrl);
      text = await r.text();
    } else if (type === 'm3u') {
      const r = await fetch(url);
      text = await r.text();
    } else return res.status(400).send('Geçersiz type');

    res.send(text);
  } catch (e) {
    res.status(500).send('Hata: ' + e.message);
  }
});

// MPG / TS stream forward
app.get('/stream', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL gerekli');

  try {
    const r = await fetch(url);
    const contentType = r.headers.get('content-type') || 'video/mp2t';
    res.set('Content-Type', contentType);
    const arrayBuffer = await r.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (e) {
    res.status(500).send('Hata: ' + e.message);
  }
});

app.listen(port, () => console.log(`Croz IPTV Proxy (MPG) çalışıyor: http://localhost:${port}`));