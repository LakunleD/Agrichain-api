"use strict";

const bcrypt = require('bcrypt');
const tokenManagement = require('./token_mgmt');


function doAuth(db, email, password, callback) {
    console.log("Authenticating...")
    let usersCollection = db.collection("users");
    usersCollection.findOne({"email": email}, (e, doc) => {
        if (doc !== null) {
            bcrypt.compare(password, doc.password, function (e, result) {
                if (result) {
                    callback(true, doc);
                }
                else {
                    callback(false, "Invalid username/Password");
                }
            });
        }
        else {
            callback(false, "Error Authenticating...");
        }
    });
}


function addAuthRoutes(server, db) {
    server.route({
        method: "POST",
        path: "/auth",
        handler: function (request, reply) {
            let {email, password} = request.payload;


            doAuth(db, email, password, (status, response) => {
                if (status) {
                    let doc = response;
                    doc._id = undefined;
                    doc.password= undefined;
                    tokenManagement.createToken(doc, (success, token) => {
                        if (success) {
                            let response = {
                                "message":"Login Successful",
                                "token": token,
                                "user": doc
                            }
                            reply(response);
                        }
                        else {
                            let response = {
                                "message":"Login Failed",
                                "token": null
                            }
                            reply(response);
                        }
                    });
                }
                else {
                    reply({
                        message: response
                    }).code(403);
                }
            })
        }
    });

    server.route({
        method: "GET",
        path: "/getUser",
        handler: function (request, reply) {
            let {token} = request.payload || request.headers;

            tokenManagement.checkToken(token, (success, userDoc) => {
                if (success) {
                    let response = {
                        "message":"token found",
                        "userDoc": userDoc.userObj
                    }
                    reply(response);
                }
                else {
                    let response = {
                        "message":"unknown token",
                        "userDoc": null
                    }
                    reply(response);
                }
            });
        }
    });

}

module.exports = addAuthRoutes;
