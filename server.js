const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

// Basit M3U proxy
app.get('/m3u', async (req,res)=>{
  const url = req.query.url;
  if(!url) return res.status(400).send('URL gerekli');
  try{
    const response = await fetch(url);
    const text = await response.text();
    res.set('Access-Control-Allow-Origin','*');
    res.set('Content-Type','text/plain');
    res.send(text);
  }catch(e){
    res.status(500).send('Hata: '+e.message);
  }
});

app.listen(port,()=>console.log(`Proxy çalışıyor: http://localhost:${port}`));