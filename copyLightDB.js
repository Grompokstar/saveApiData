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
  const newDB = database.db('newBets');

  if (err) return console.log(err);
  let count = 0;

  DB.collection('notes').find().forEach( function (x) {
    if (x.timer.tm === 20) {
      let newItem = {}
      newItem.id = x.id;
      newItem.time = x.time
      newItem.league = x.league
      newItem.ss = x.ss
      newItem.home = x.home
      newItem.away = x.away
      newItem.timer = x.timer
      newItem.scores = x.scores
      newItem.view = x.view
      newItem.odds = {}
      newItem.odds.currentResultOdd = x.odds['1_1'][0]
      newItem.odds.startResultOdd = x.odds['1_1'][x.odds['1_1'].length - 1]
      newItem.odds.currentTbOdd = x.odds['1_3'][0]
      newItem.odds.startTbOdd = x.odds['1_3'][x.odds['1_3'].length - 1]
      newItem.resultView = {}
      if (x.resultView) {
        newItem.resultView.scores = x.resultView.scores
        newItem.resultView.ss = x.resultView.ss
        newItem.resultView.events = x.resultView.events
      }

      newDB.collection('notes').insert(newItem, (err, result) => {
        if (err) {
          console.log(err);
        }
      });

      count++;
      console.log(count)

    }

    /*if (x.trends) {
      delete x.trends
      DB.collection('notes').save(x);
    }*/

  });

})



