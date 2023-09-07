require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient} = require('mongodb');
const dns = require('dns');
const urlParse = require('url');

const mySecret = process.env['MONGO_DB'];
const user = new MongoClient(mySecret);
const db = user.db('urlshortner');
const urls=db.collection('urls');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const dnsLookUp= dns.lookup(urlParse.parse(url).hostname, async (err,address)=> {
    if(!address){
      res.json({error: 'invalid url'})
    } else{
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      }
       const result = urls.insertOne(urlDoc);
     res.json({ original_url : url, short_url :  urlCount});
    }
   
  } )
 
});

app.get('/api/shorturl/:short_url', (req,res)=>{
  const shortUrl=req.params.short_url;
  urls.findOne({short_url: +shortUrl}).then((data)=>{
    if(data) {
      res.redirect(data.url);
    } else{
       res.send('Invalid url!');
    }
  });

  
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
