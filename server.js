const cheerio = require('cheerio');
const request = require('request');

request('https://news.bitcoin.com/', (error, response, body) => {

  if (error) console.log(error);

  let $ = cheerio.load(body);
  let results = [];

  $('div.td-module-thumb').each(function(i, element) {

    let articleTitle = $(element).find('a').attr('title');
    let articleLink = $(element).find('a').attr('href');
    let imgSrc = $(element).find('img').attr('src');

    if (imgSrc === undefined) {
      imgSrc = $(element).find('span').attr('style');
      imgSrc = imgSrc.slice(21, imgSrc.length - 1);
    }
    results.push({
      artical: {
        articleTitle: articleTitle,
        articleLink: articleLink,
        imgSrc: imgSrc
      }
    });

  });
  console.log("results", results);

});
