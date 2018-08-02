process.env["NTBA_FIX_319"] = 1;
const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db             = require('./config/db');
const app            = express();
const TelegramBot = require('node-telegram-bot-api');
const { InlineKeyboard, ReplyKeyboard, ForceReply } = require('telegram-keyboard-wrapper');
const rp = require('request-promise');
const _ = require('lodash');
const mainToken = '515855036:AAEY-jgjNUA8ZKu7DyiLhXqY71PVKj4nxK4';
const testToken = '571233425:AAEuaeoImFHtepoZxIjKxV9DP-T4M-zAgu0';
const bot = new TelegramBot(testToken, {polling: true});
const testChannelName = '@test_telegram_bots';
const mainChannelName = '@roma_best_football_bets';
const testChannelId = -1001259208814;

const unicodeScores = ['\u0030\u20E3', '\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3', '\u0036\u20E3', '\u0037\u20E3'];
let showedEvents = [];

MongoClient.connect("mongodb://localhost:27017/", (err, database) => {
  const myAwesomeDB = database.db('bets');

  if (err) return console.log(err);

  setInterval(function() {
    showedEvents = [];
  }, 7200000);

  bot.on("callback_query", function(query) {
    console.log('callback_query');
    console.log(query);

    rp('https://api.betsapi.com/v1/event/view?token=8334-BCLtMmtKT698vk&event_id=' + query.data)
      .then(function(viewRequest) {
        console.log('запрос callback_view');
        let viewReq = JSON.parse(viewRequest).results[0];

        let scoresText = viewReq.scores["2"].home + ':' + viewReq.scores["2"].away;
        if (viewReq.scores["1"]) {
          scoresText += ' (' + viewReq.scores["1"].home + ':' + viewReq.scores["1"].away + ')';
        }

        let finishStr = '';

        if (viewReq.time_status === '1' ) {
          finishStr = " \u23F0" + viewReq.timer.tm + "\'";
        } else if (viewReq.time_status === '3') {
          finishStr = " \u{1F3C1}";
        }

        bot.answerCallbackQuery(query.id, { text: scoresText + finishStr})
      })

  });

  function start() {
    let filteredResults = [];

    rp('https://api.betsapi.com/v2/events/inplay?sport_id=1&token=8334-BCLtMmtKT698vk')
      .then(function (response) {
        console.log('запрос events');
        let totalScores = [];

        let results = JSON.parse(response).results;

        filteredResults = _.filter(results, function(item) {
          totalScores.push({itemId: item.id, scores: parseInt(item.scores[2].home) + parseInt(item.scores[2].away)});

          return true

          if (item.timer) {
            return item.timer.tm === 20 || item.timer.tm === 65
          } else {
            return false
          }

        });

        _.forEach(filteredResults, function(item) {

          rp('https://api.betsapi.com/v1/event/view?token=8334-BCLtMmtKT698vk&event_id=' + item.id)
            .then(function (response2) {
              console.log('запрос view');

              let view = JSON.parse(response2).results[0];
              item.view = view;

              rp('https://api.betsapi.com/v1/event/odds?token=8334-BCLtMmtKT698vk&event_id=' + item.id + '&odds_market=1,3,6')
                .then(function (response3) {
                  console.log('запрос odds');
                  let odds = JSON.parse(response3).results;

                  item.odds = odds;


                  rp('https://api.betsapi.com/v1/event/history?token=8334-BCLtMmtKT698vk&event_id=' + item.id)
                    .then(function (response4) {
                      console.log('запрос history');

                      let history = JSON.parse(response4).results;
                      item.history = history

                      myAwesomeDB.collection('notes').insert(item, (err, result) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log(result.ops[0].id);
                        }
                      });

                    })
                    .catch(function (err) {
                      console.log('request history failed' + err)
                    });

                })
                .catch(function (err) {
                  console.log('request odds failed' + err)
                });
            })
            .catch(function (err) {
              console.log('request view failed' + err)
            });
        })
      })
      .catch(function (err) {
        console.log('request events failed' + err)
      });
  }

  start();


  setInterval(start, 60000);
})



