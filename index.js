var request = require('request');
var express = require('express');
var parser = require('fast-xml-parser');
var cors = require('cors');
var app = express();
var PORT = process.env.PORT || 3001;
var corsOptions = {
    origin: 'https://gillette-staging.mybigcommerce.com',
    optionsSuccessStatus: 200 // For legacy browser support
}
app.use(cors(corsOptions));

app.get("/", function(req, res) {
    const requestString = req.query.requestString;
    var options = {
      'method': 'GET',
      'url': `https://returns.usps.com/services/GetLabel?externalReturnLabelRequest=${requestString}`
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        var xmlData = response.body;
        var jsonObj = null;
        if( parser.validate(xmlData) === true) { //optional (it'll return an object in case it's not valid)
            jsonObj = parser.parse(xmlData,options);
        }
        console.log(jsonObj)
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