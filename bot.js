/*!
* Bot.js : A Twitter bot that can retweet in response to the tweets matching particluar keyword
* Version 1.0.0
* Created by Debashis Barman (http://www.debashisbarman.in)
* License : http://creativecommons.org/licenses/by-sa/3.0
*/

// Let's require some modules ay
var Twit = require('twit');

// Here we import our keys from a config file not pushed to GitHub
var keys = require('./config');

/* Configure the Twitter API */
var TWITTER_CONSUMER_KEY = keys.private_consumer_key;
var TWITTER_CONSUMER_SECRET = keys.private_consumer_sectret;
var TWITTER_ACCESS_TOKEN = keys.private_access_token;
var TWITTER_ACCESS_TOKEN_SECRET = keys.private_access_token_secret;

/* Set Twitter search phrase */
var TWITTER_SEARCH_PHRASE = 'cowspiracy';



var Bot = new Twit({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token: TWITTER_ACCESS_TOKEN, 
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000,
});

console.log('The bot is running...');



/* BotInit() : To initiate the bot */
function BotInit() {
  // Bot.post('statuses/retweet/:id', { id: '669520341815836672' }, BotInitiated);
  
  // function BotInitiated (error, data, response) {
  //  if (error) {
  //    console.log('Bot could not be initiated, : ' + error);
  //  }
  //  else {
 //       console.log('Bot initiated : 669520341815836672');
  //  }
  // }
  
  BotProcess();
}

/* BotRetweet() : To retweet the matching recent tweet */
function BotProcess() {

  var query = {
    q: TWITTER_SEARCH_PHRASE,
    result_type: "recent"
  }

  Bot.get('search/tweets', query, BotGotLatestTweet);

  function BotGotLatestTweet (error, data, response) {
    if (error) {
      console.log('Bot could not find latest tweet, : ' + error);
    }
    else {
      var id = {
        id : data.statuses[0].id_str
      }

      Bot.post('statuses/retweet/:id', id, BotRetweeted);
      
      function BotRetweeted(error, response) {
        if (error) {
          console.log('Bot could not retweet, : ' + error);
        }
        else {
          console.log('Bot retweeted : ' + id.id);
        }
      }

      Bot.post('favorites/create', id, BotFaved);

      function BotFaved(error, response) {
        if (error) {
          console.log('Bot could not fav, : ' + error);
        }
        else {
          console.log('Bot faved : ' + id.id);
        }
      }
    }
  }
  
  /* Set an interval (in microsecondes, um no that's milliseconds actually) */
  setInterval(BotProcess, 60*60*1000);
}

/* Initiate the Bot */
BotInit();