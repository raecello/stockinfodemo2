'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
 
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.post('/stockprice', (request, response) => {
    const action = request.body.queryResult.action;
    //response.setHeader('Content-Type', 'application/json');     
    if (action != 'input.getStockPrice') {
        response.send(buildChatResponse("I'm sorry, I don't know this"))
        return;
    }
    const parameters = request.body.queryResult.parameters;
    var companyName = parameters['company_name'];
    var priceType = parameters['price_type'];
    var date = switchdates(parameters['date'].substr(0, 10));
    console.log(date);

    var stockinfo;
    
    var chat;
    getStockPrice(companyName, priceType, date, response);
 
});
    
function getStockPrice(companyName, priceType, date, response, cloudFnResponse) {
    var tickerMap = {
        "apple": "AAPL",
        "microsoft": "MSFT",
        "ibm": "IBM",
        "google": "GOOG",
        "facebook": "FB",
        "amazon": "AMZN"
    };
    var priceMap = {
        "opening": "open_price",
        "closing": "close_price",
        "maximum": "high_price",
        "high": "high_price",
        "low": "low_price",
        "minumum": "low_price"
    };
    var stockTicker = tickerMap[companyName.toLowerCase()];
    var priceTypeCode = priceMap[priceType.toLowerCase()];  
    const username = "931e0fdc733a8bef8101cea0b26781a0";
    const password = "e104a6a110d67dcc6cd6da4f0c01e047";
    var pathString = "/prices?identifier=" + stockTicker + "&start_date=" + date + "&end_date=" + date;
    var auth = "Basic " + new Buffer(username + ":" + password).toString('base64');
  
    var req = https.get({
        host: "api.intrinio.com",
        path: pathString,
        headers: {
            "Authorization": auth
        }
        //headers: 
    }, function(res) {
        var json = "";
        res.on('data', function(chunk) {
            json += chunk;
        });
        res.on('end', function() {
            var jsonData = JSON.parse(json);
            
            var stockPrice = jsonData.data[0].open;
            var chat = "The " + priceType + " price for " + companyName +
            " on " + date + " was " + stockPrice;     
            
            return response.json({
                fulfillmentText: chat,
                source: 'chattalk'
            });
        });
        
    }
    
    
    );
    
}  

function switchdates(date) {
    var month = date.substring(5,7);
    var day = date.substring(8,10); 
    return date.substring(0,5) + day + date.substring(7,8) + month;    
}




app.listen(process.env.PORT || 5000), () => {
    console.log("Server is up and running...");
};
