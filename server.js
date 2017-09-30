var path = require('path'),
    express = require('express'),
    app = express(),   
    Twit = require('twit');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');


var config = {     
        twitter: {
          consumer_key: process.env.CONSUMER_KEY,
          consumer_secret: process.env.CONSUMER_SECRET,
          access_token: process.env.ACCESS_TOKEN,
          access_token_secret: process.env.ACCESS_TOKEN_SECRET
        }
      }
      
var Bot = new Twit(config.twitter),
      // stream = Bot.stream('statuses/sample'),
      TWITTER_SEARCH_PHRASE = 'cowspiracy',
      blockedUsernames = [
        'SSF_BERF_DEFM', 'DefendingBeef', 'Unit_3947'
      ];

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
  auth: {
    api_key: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

// nodemailerMailgun.sendMail({
//         from: 'no-reply@sandbox71482a33e9e24b67901975719d717d59.mailgun.org',
//         to: 'phocks@gmail.com', // An array if you have multiple recipients.
//         // cc:'second@domain.com',
//         // bcc:'secretagent@company.gov',
//         subject: 'Cowspiracy bot log',
//         // 'h:Reply-To': 'reply2this@company.com',
//         //You can use "html:" to send HTML email content. It's magic!
//         // html: JSON.stringify(data),
//         //You can use "text:" to send plain-text content. It's oldschool!
//         text: "Hello there !!!!!"
//       }, function (err, info) {
//         if (err) {
//           console.log('Error: ' + err);
//         }
//         else {
//           console.log('Response: ' + JSON.stringify(info));
//         }
//       });


app.use(express.static('public'));

app.all("/" + process.env.BOT_ENDPOINT, function (request, response) {
  
  var query = {
    q: TWITTER_SEARCH_PHRASE,
    result_type: "recent",
    lang: "en"
  }

  Bot.get('search/tweets', query, function (error, data, response) {
    if (error) {
      console.log('Bot could not find latest tweet, - ' + error);
    }
    else {
      var id = {
        id : data.statuses[0].id_str
      }
      
      var currentUser = data.statuses[0].user.screen_name;
      
      nodemailerMailgun.sendMail({
        from: 'no-reply@sandbox71482a33e9e24b67901975719d717d59.mailgun.org',
        to: 'phocks@gmail.com', // An array if you have multiple recipients.
        // cc:'second@domain.com',
        // bcc:'secretagent@company.gov',
        subject: 'Cowspiracy bot log',
        // 'h:Reply-To': 'reply2this@company.com',
        //You can use "html:" to send HTML email content. It's magic!
        // html: JSON.stringify(data),
        //You can use "text:" to send plain-text content. It's oldschool!
        text: JSON.stringify(data.statuses[0], null, 4)
      }, function (err, info) {
        if (err) {
          console.log('Error: ' + err);
        }
        else {
          console.log('Response: ' + JSON.stringify(info));
        }
      });
      
      // console.log(data);
      // console.log('hello');
      
      console.log(currentUser);
      console.log(data.statuses[0].text);
      
      
      // Check if user is blocked otherwise continue
      if (blockedUsernames.indexOf(currentUser) > -1) {
        // In the array
        console.log('Blocked user ' + currentUser + " found. Not continuing...");
      } else {
        // Not in the array
        Bot.post('statuses/retweet/:id', id, function (error, response) {
          if (error) {
            console.log('Bot could not retweet, - ' + error);
          }
          else {
            console.log('Bot retweeted : ' + id.id);
          }
        });

        Bot.post('favorites/create', id, function (error, response) {
          if (error) {
            console.log('Bot could not fav, - ' + error);
          }
          else {
            console.log('Bot faved : ' + id.id);
          }
        });
      }
    } // else not error
  });
  response.sendStatus(200);
}); // app.all Express call

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});
