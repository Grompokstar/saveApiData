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
  let count = 0;

  DB.collection('notes').find().forEach( function (x) {
    if (x.timer.tm === 20 && !x.resultView) {
      if (count <= 2500) {
        rp('https://api.betsapi.com/v1/event/view?token=8334-fosWHlkPaVmESh&event_id=' + x.id)
          .then(function(viewResp) {
            console.log('update');
            let viewResponse = JSON.parse(viewResp).results[0];
            if (viewResponse) {
              console.log(viewResponse.time_status);

              if (viewResponse.time_status !== '1') {
                x.resultView = viewResponse;

                DB.collection('notes').save(x);
              }

              count++;
              console.log(count)
            }
          })
      }

    }

    /*if (x.trends) {
      delete x.trends
      DB.collection('notes').save(x);
    }*/

  });

})



