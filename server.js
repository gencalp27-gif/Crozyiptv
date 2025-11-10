const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/m3u', async (req,res)=>{
  const url = req.query.url;
  if(!url) return res.status(400).send('URL gerekli');
  try {
    const r = await fetch(url);
    const text = await r.text();
    res.set('Access-Control-Allow-Origin','*');
    res.send(text);
  } catch(e) {
    res.status(500).send('Hata: ' + e.message);
  }
});

app.listen(3000,()=>console.log("Proxy çalışıyor"));