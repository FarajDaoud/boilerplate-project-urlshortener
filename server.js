'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const shortid = require('shortid');

let app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
var db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error"));
db.once("open", (callback) => {
  //console.log("Connection to db succeeded.");
});

const Schema = mongoose.Schema;

const urlShortenerSchema = new Schema({
  originalUrl: String,
  shortUrl: String,
  createdDate: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0}
});

const urlShortener = mongoose.model('urlShortener', urlShortenerSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// shortURL redirect
app.get("/api/shorturl/:shortURL", (req, res) => {
  console.log(`[GET] ClientParams: ${JSON.stringify(req.params)}`);
  let userURL = req.params.shortURL;
  userURL = userURL.replace('https://', '').replace('http://', '').replace('www.', '');
  //Check mongoDB for shortURL
  urlShortener.findOne({shortUrl: userURL}, (err, data) => {
    if(err) console.log(err);
    if(!data){
      console.log('redirected to error page');
      res.redirect('http://localhost/error');
    }
    else{
      urlShortener.findOneAndUpdate({shortUrl: userURL}, {$set: { clicks: data.clicks + 1}}, {new: true}, (err, data) => {
        if(err) console.log(err);
        else{
          res.redirect('https://'+data.originalUrl);
        }
      });
    }
  });
});

// Create shortURL
app.post("/api/shorturl/new", (req, res) => {
  console.log(`[POST] ClientBody: ${JSON.stringify(req.body)}`);
  if(req.body.userURL !== undefined){
    let userURL = req.body.userURL.replace('https://', '').replace('http://', '').replace('www.', '');
    //Check if userURL is valid
    dns.lookup(userURL, (err, address, family) => {
      if(err) res.send({"error":"invalid URL"});
      console.log(`[DNS] address: ${address}`);
      if(address !== undefined){
        //Check mongoDB for original URL
        urlShortener.findOne({originalUrl: userURL}, (err, data) => {
          if(err) res.send({Error: err});
          console.log(`[MongoDB] Document data: ${data}`);
          if(!data){
            //original URL does not exist in DB: create short URL and save in MongoDB
            //generate new short url using shortid module
            let generatedShortURL = shortid.generate();
            //create shortURL to save
            let shortURL = new urlShortener({
              originalUrl: userURL
              ,shortUrl: generatedShortURL
            });
            //save shortURL
            shortURL.save( (err) => {
              if(err) res.send({Error: err});
              console.log(`[MongoDB] save successful`);
              res.send({shortUrl: generatedShortURL, clicks: 0});
            });
          }
          else{
            //original URL exists in DB: respond with short URL.
            res.send({shortUrl: data.shortUrl, clicks: data.clicks});
          }
        });
      }
    });
  }else{
     res.send({"Error":"URL was not provided."}); 
  }
});

app.listen(port, function () {
  //console.log('Node.js listening ...');
});
