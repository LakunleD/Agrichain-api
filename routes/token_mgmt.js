"use strict";
const jwt = require("jsonwebtoken");

let secret = process.env.JWT_SECRET_KEY;

let create_token = function (userObj, callback) {
    console.log(secret);
    jwt.sign({userObj}, secret, (err, token) => {
        if (err) {
            callback(false, 'unexpected error');
        }
        else {
            callback(true, token);

        }
    });
}


let get_token_info = function (token, callback) {
    jwt.verify(token, secret, (err, decode) => {
        if(err){
            callback(false, "Invalid Token");
        }
        else{
            callback(true, decode);
        }
    });
}

let tokenMamangement = {
    createToken: create_token,
    checkToken: get_token_info
}

module.exports = tokenMamangement;
