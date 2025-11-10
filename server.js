const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/m3u', async (req,res)=>{
  const url = req.query.url;
  if(!url) return res.status(400).send('URL gerekli');
  try{
    const response = await fetch(url);
    const text = await response.text();
    res.set('Content-Type','text/plain');
    res.send(text);
  }catch(e){
    res.status(500).send('Hata: '+e.message);
  }
});

app.listen(port,()=>console.log(`Proxy çalışıyor: http://localhost:${port}`));
