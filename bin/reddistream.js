#!/usr/bin/env node


var http = require('http');
var cheerio = require('cheerio');

var displayed = Array();
var options = {
  host: 'www.reddit.com',
  path: ''
};

if(process.argv[2].indexOf('/comments/') == -1)
  console.log('Not a valid URL');
else{

  
  var start = process.argv[2].indexOf('/r/');
  var end = process.argv[2].lastIndexOf('/');
  options.path = process.argv[2].substring(start, end) + '?sort=new';

  var Runner = {
  apply : function(){  
    var req = http.get(options, function(res) { 

    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);  
      var comments = Runner.processBody(body); 
      
      var length = 0;
      var toPrint = Array();
      for(var key in comments)
      {
	if(!(key in displayed))
	{
	  displayed[key] = key;
	  length ++;
	  toPrint[length] = comments[key];
	} 
      } 
      
      for(var i = length; i > 0; i--)
      {
	console.log(toPrint[i]); 
      }
    });
    });


  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  })

  },


  processBody: function(body)
  {   
    $ = cheerio.load(body);
    var comments = $('.sitetable.nestedlisting');
    var items = Array();
    $('.comment', comments).each(function()
    {
	items[$(this).attr('data-fullname')] = "\033[1m" + $(this).find('.author').html() + "\033[0m: " + $(this).find('.md').text().trim();
    }); 
    return items;
  } 

  };
  
  setInterval(Runner, 5000);
  Runner.apply();
} 


