const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const app            = express();
const rp = require('request-promise');
const _ = require('lodash');

MongoClient.connect(db.url, (err, database) => {
  const DB = database.db('bets');

  if (err) return console.log(err);

  DB.collection('notes').find().forEach( function (x) {
    if (!x.trends) {
      rp('https://api.betsapi.com/v1/event/stats_trend?token=8334-fosWHlkPaVmESh&event_id=' + x.id)
        .then(function(viewRequest) {
          console.log('update trend');
          let trends = JSON.parse(viewRequest).results;

          if (trends) {
            x.trends = trends;
            DB.collection('notes').save(x);
          }

        })
    }

    /*x.id = parseInt(x.id);
    DB.collection('notes').save(x);*/
  });

})



