/**
 * Created by Gaohan on 2017/3/17.
 */

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

var path = require('path');

var startUrl = 'http://jandan.net/ooxx';

var page = 10;


function getUrl(src) {
  var reg = /(\w)+.(jpg|png)/g;
  var result = reg.test(src);
  if (result) {
    return 'http:' + src;
  }

  return undefined;
}
// 数组降维
function reduceDimension(arr) {
  var reduced = [];
  for (var i = 0; i < arr.length; i++){
    reduced = reduced.concat(arr[i]);
  }
  return reduced;
}

request(startUrl, function (err, response) {
  if (err) {
    console.log(err);
  }

  var $ = cheerio.load(response.body);

  var amount = parseInt($('.current-comment-page').text().match(/(\d)+/g)[0]);

  var pageUrl = [];

  for (var i = amount; i >= amount - page + 1; i--) {
    // console.log(amount, i);
    pageUrl.push('http://jandan.net/ooxx/page-' + i);
  }

  // console.log(pageUrl);

  async.mapLimit(pageUrl, 5, function(page, callback) {
    request(page, function (err, response) {
      var $ = cheerio.load(response.body);
      var links = $('a.view_img_link');
      var imgArr = [];

      links.each(function () {
        const url = getUrl($(this).attr('href'));
        if (url) {
          imgArr.push(url)
        }
      });

      callback(null, imgArr);
      // console.log(imgArr);
    })
  }, function (err, result) {
    console.log(reduceDimension(result));
  });


});