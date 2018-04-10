'use strict';
const Hapi = require("hapi");
const server = new Hapi.Server();
const corsHeaders = require('hapi-cors-headers');
const MongoClient = require('mongodb').MongoClient;

let userRoutes = require('./routes/user');
let authRoutes = require('./routes/auth');

// const mongodbLocation = process.env.MONGODB_LOCATION;
// const mongodbDatabase = process.env.MONGODB_DATABASE;
// const mongoUser = process.env.TAJA_MONGODB_USER;
// const mongoPasswd = process.env.TAJA_MONGODB_PWD;


// let mongoDbConnectionString = "mongodb://" + mongoUser + ":" + mongoPasswd + "@" + mongodbLocation + ":27017/" + mongodbDatabase;
let mongoDbConnectionString = process.env.MONGODB_URI;


MongoClient.connect(mongoDbConnectionString, function (err, db) {
    if(err){
        console.log(err);
        return;
    }
    console.log("Connected correctly to server");
    addRoutes(server, db);
    startServer(server);
});


server.connection({
    "port": process.env.PORT,
    "routes": {
        "cors": {
            "headers": ["Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language", "Origin"],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    }
});

server.ext('onPreResponse', corsHeaders)

function addRoutes(server, db) {
    userRoutes(server, db);
    authRoutes(server, db);
}

function startServer(server) {
    server.start(function () {
        console.log('Server running at: ' + server.info.uri);
        server.log('info', 'Server running at: ' + server.info.uri);
    });
}

