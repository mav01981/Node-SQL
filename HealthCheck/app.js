// BASE SETUP
var Request = require('tedious').Request;
// =============================================================================

// call the packages we need
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var data = require("./data");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('superSecret', "secret"); // secret variable 

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.get('/', function (req, res) {
    res.json({ message: 'Node API ' });
});


router.get('/authenticate:key?', function (req, res) {
    let key = req.query.key;

    if (key = "secret") {
        //JWT Claims
        var payload = {
            "iss": "Issuer",
            "name": "APIUser",
            "admin": true
        };

        var token = jwt.sign(payload, app.get('superSecret'), {
            expiresIn: 86400 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
            success: true,
            message: 'Token Granted.',
            token: token
        });
    }
});

router.get('/getCustomerData:id?', function (req, res) {
    let id = req.query.id;

    data.getDirectory("EXEC sp_ScoreData " + id, function (err, results) {

        res.json(results);

        if (err)
            console.log(err);
    });
});

router.get('/getCompanies', function (req, res) {
    data.getDirectory("EXEC sp_GetCompanys", function (err, results) {
        res.json(results);

        if (err)
            console.log(err);
    });
});

app.use(function (req, res, next) {
    var route = req.url;
 
    if (route.indexOf("authenticate") == -1) {
        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token
        if (token) {

            // verifies secret and checks exp
            jwt.verify(token, app.get('superSecret'), function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {

            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    }
    next();
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Node API Started on ' + port);
