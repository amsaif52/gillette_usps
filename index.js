var request = require('request');
var express = require('express');
var parser = require('fast-xml-parser');
var app = express();
var PORT = process.env.PORT || 3001;

app.get("/", function(req, res) {
    const requestString = req.query.requestString;
    var options = {
      'method': 'GET',
      'url': `https://returns.usps.com/services/GetLabel?externalReturnLabelRequest=${requestString}`
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        var xmlData = response.body;
        if( parser.validate(xmlData) === true) { //optional (it'll return an object in case it's not valid)
            var jsonObj = parser.parse(xmlData,options);
        }
        var base64string = jsonObj.ExternalReturnLabelResponse.ReturnLabel;
        var data = [];
        data.push(Buffer.from(base64string, 'base64'));
        data = Buffer.concat(data);
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=usps-tracking.pdf',
            'Content-Length': data.length
        });
        res.end(data);
    });
});

app.listen(PORT, function(err){
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});