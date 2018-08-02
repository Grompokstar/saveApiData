const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const app            = express();
const rp = require('request-promise');
const _ = require('lodash');

const unicodeScores = ['\u0030\u20E3', '\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3', '\u0036\u20E3', '\u0037\u20E3'];
let showedEvents = [];

MongoClient.connect(db.url, (err, database) => {
  const DB = database.db('bets');

  if (err) return console.log(err);

  DB.collection('notes').find().forEach( function (x) {
    if (!x.resultView || !x.trends) {
      rp('https://api.betsapi.com/v1/event/view?token=8334-BCLtMmtKT698vk&event_id=' + x.id)
        .then(function(viewResp) {
          console.log('update');
          let viewResponse = JSON.parse(viewResp).results[0];

          if (viewResponse.time_status === '3') {
            x.resultView = viewResponse;

            rp('https://api.betsapi.com/v1/event/stats_trend?token=8334-BCLtMmtKT698vk&event_id=' + x.id)
              .then(function(trendResp) {
                let trends = JSON.parse(trendResp).results;

                if (trends) {
                  x.trends = trends;
                  DB.collection('notes').save(x);
                }

              })
          }

        })
    }

    /*x.id = parseInt(x.id);
    DB.collection('notes').save(x);*/
  });

})



