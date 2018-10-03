const cheerio = require('cheerio');
const request = require('request');
var mongojs = require('mongojs');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

// Setup the app with body-parser and a static folder
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Database configuration
// Save the URL of our database as well as the name of our collection
const databaseUrl = 'news';
const collections = ['articles'];

// Use mongojs to hook the database to the db variable
const db = mongojs(databaseUrl, collections);

// This makes sure that any errors are logged if mongodb runs into an issue
db.on('error', error => {
  console.log('Database Error:', error);
});

request('https://news.bitcoin.com/', (error, response, body) => {
  if (error) console.log(error);

  let $ = cheerio.load(body);
  let results = [];

  $('div.td-module-thumb').each(function(i, element) {
    let articleTitle = $(element)
      .find('a')
      .attr('title');
    let articleLink = $(element)
      .find('a')
      .attr('href');
    let articleSummary = $(element)
      .siblings('.line-clamp')
      .text();
    // console.log(articleSummary);
    let imgSrc = $(element)
      .find('img')
      .attr('src');

    if (imgSrc === undefined) {
      imgSrc = $(element)
        .find('span')
        .attr('style');

      imgSrc = imgSrc.slice(22, imgSrc.length - 1);
      console.log(imgSrc);
    }

    results.push({
      articleTitle: articleTitle,
      articleLink: articleLink,
      imgSrc: imgSrc,
      articleSummary: articleSummary
    });
  });

  results.forEach(articleScraped => {
    db.articles.update(
      { articleLink: articleScraped.articleLink },
      {
        articleTitle: articleScraped.articleTitle,
        articleLink: articleScraped.articleLink,
        imgSrc: articleScraped.imgSrc,
        articleSummary: articleScraped.articleSummary
      },
      { upsert: true }
    );
  });
});

app.get('/articles', function(req, res) {
  db.articles.find({}, function(error, found) {
    if (error) {
      console.log(error);
    } else {
      res.json(found);
    }
  });
});

app.post('/submit', function(req, res) {

  console.log(req.body);
  db.articles.updateOne(
    {
      _id: mongojs.ObjectId(req.body._id)
    },
    {
      $set: {
        comments: {
          comment: req.body.comment,
          name: req.body.name,
          submitted: req.body.submitted_on
        }
      }
    },
    function(error, submitted) {
      // Log any errors from mongojs
      if (error) {
        console.log(error);
        res.send(error);
      }
      else {
        // Otherwise, send the mongojs response to the browser
        // This will fire off the success function of the ajax request
        res.send(submitted);
      }
    }
  );
});


app.get('/', function(req, res) {
  db.articles.find({}, function(error, found) {
    if (error) {
      console.log(error);
    } else {
      res.render('pages/index', {
        articles: found
      });
    }
  });
});

// Set the app to listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
