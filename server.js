// server.js (node 18+, express)
// npm init -y
// npm i express node-fetch cors
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Basit health
app.get('/', (req, res) => res.send('Croz IPTV proxy'));

/*
 POST /api/xtream/fetch-m3u
 body: { server: "http://provider:8080", username: "...", password: "...", type: "m3u_plus" }
*/
app.post('/api/xtream/fetch-m3u', async (req, res) => {
  try {
    const { server, username, password, type = 'm3u_plus', output = 'ts' } = req.body;
    if (!server || !username || !password) return res.status(400).json({ error: 'missing' });

    // Normalize URL (no trailing slash)
    const base = server.replace(/\/$/, '');
    const url = `${base}/get.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=${encodeURIComponent(type)}&output=${encodeURIComponent(output)}`;

    const r = await fetch(url, { timeout: 15000 });
    if (!r.ok) return res.status(502).json({ error: 'upstream_error', status: r.status });

    const text = await r.text();
    // Optionally sanitize / transform M3U here (e.g. rewrite stream URLs through proxy)
    res.set('Content-Type', 'text/plain; charset=utf-8');
    return res.send(text);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

/*
 POST /api/xtream/player-api
 body: { server, username, password, action, ...extraQuery }
 Example action: get_live_streams, get_live_categories, get_short_epg
*/
app.post('/api/xtream/player-api', async (req, res) => {
  try {
    const { server, username, password, action, ...rest } = req.body;
    if (!server || !username || !password || !action) return res.status(400).json({ error: 'missing' });
    const base = server.replace(/\/$/, '');
    const params = new URLSearchParams({ username, password, action, ...rest });
    const url = `${base}/player_api.php?${params.toString()}`;

    const r = await fetch(url, { timeout: 15000 });
    if (!r.ok) return res.status(502).json({ error: 'upstream_error', status: r.status });

    const json = await r.json().catch(async () => { // bazen text dönebilir
      const txt = await r.text();
      return { raw: txt };
    });
    return res.json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Croz IPTV proxy listening on', PORT));