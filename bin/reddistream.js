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
 
    var bodyChunks = [];
    res.on('data', function(chunk) { 
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
	var key = $(this).attr('data-fullname'); 
	var spaces = '';
	var parents = $(this).parents('.child').length;
	
	if(!(key in displayed))
	{ 
	  for(var i = 0; i < parents; i++)
	  {
	    spaces += '  ';
	  }
	  items[key] = "\033[1m" + spaces + $(this).find('.author').html() + "\033[0m: ";
	  
	  if(parents != 0)
	  {
	    items[key] += "Reply to: " + $(this).parents('.child').first().prev().find('.tagline .author').text() + " - ";
	  }
	  
	  $(this).find('.md').first().children().each(function()
	  {
	    if($(this).is('blockquote'))
	    {
	      items[key] += "\033[3m Quote: " + $(this).text().trim() + "\033[0m \n";
	    }else if($(this).is('p'))
	    {
	      items[key] += $(this).text().trim();
	    }
	  });  
	}
    }); 
    return items;
  } 

  };
  
  setInterval(Runner, 5000);
  Runner.apply();
} 


