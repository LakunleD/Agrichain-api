"use strict";

const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');

const userRoutes = function (server, db) {
    let usersCollection = db.collection('users');

    server.route({
        method: "GET",
        path:"/defaultUsers",
        handler: function (request, reply) {
            usersCollection.remove({}, (err, numberRemoved)=>{});

            let salt = bcrypt.genSaltSync(11);
            let password = bcrypt.hashSync('123456', salt);

            let data1 = {
                email: 'as@gmail.com',
                password: password,
                firstName: 'as',
                lastName: 'las',
                permission:{
                    farmer: 'false',
                    supervisor: 'false',
                    admin: 'true'
                }
            }

            let data2 = {
                email: 'qw@gmail.com',
                password: password,
                firstName: 'qw',
                lastName: 'qw',
                permission:{
                    farmer: 'true',
                    supervisor:'false',
                    admin:'false'
                }
            }

            let data3 = {
                email: 'zx@gmail.com',
                password: password,
                firstName: 'Qwe',
                lastName: 'Asd',
                permission:{
                    farmer: 'false',
                    supervisor: 'true',
                    admin: 'false'
                }
            }

            usersCollection.findOne({email: data1.email}, function (err, user) {
                if (err) {
                    reply({message: 'error'}).code(400);
                }
                if (user === null) {
                    usersCollection.insertOne(data1, function (err, result) {
                        if (err) {
                            reply({message: 'error'}).code(400);
                        }
                        usersCollection.findOne({email: data2.email}, function (err, user) {
                            if (err) {
                                reply({message: 'error'}).code(400);
                            }
                            if (user === null) {
                                usersCollection.insertOne(data2, function (err, result) {
                                    if (err) {
                                        reply({message: 'error'}).code(400);
                                    }
                                    usersCollection.findOne({email: data3.email}, function (err, user) {
                                        if (err) {
                                            reply({message: 'error'}).code(400);
                                        }
                                        if (user === null) {
                                            usersCollection.insertOne(data3, function (err, result) {
                                                if (err) {
                                                    reply({message: 'error'}).code(400);
                                                }
                                                reply({message: 'created default users', password:'123456', user1: data1, user2:data2, user3: data3});
                                            });
                                        }
                                        else {
                                            reply({message: 'user already exist'});
                                        }
                                    });
                                });
                            }
                            else {
                                reply({message: 'user already exist'});
                            }
                        });
                    });
                }
                else {
                    reply({message: 'user already exist'});
                }
            });

        }
    })

    server.route({
        method: "POST",
        path: "/users",
        handler: function (request, reply) {
            let { email, password, firstName, lastName, permission } = request.payload;

            let salt = bcrypt.genSaltSync(11);
            let encPassword = bcrypt.hashSync(password, salt);

            let data = { email, password: encPassword, firstName, lastName, permission };

            usersCollection.findOne({email: email}, function (err, user) {
                if (err) {
                    reply({message: 'error'}).code(400);
                }
                if (user === null) {
                    usersCollection.insertOne(data, function (err, result) {
                        if (err) {
                            reply({message: 'error'}).code(400);
                        }
                        reply({message: 'created a user', user: data});
                    });
                }
                else {
                    reply({message: 'user already exist'});
                }
            });
        }
    });

    server.route({
        method: "GET",
        path: "/users",
        handler: (request, reply) => {
            usersCollection.find({}).toArray((err, users) => {
                if (err) {
                    reply({message: 'error'})
                        .code(500);
                }
                users.map(user=>{
                    delete user["password"];
                });
                reply(users);
            });
        }
    });

    server.route({
        method: "GET",
        path: "/users/{id}",
        handler: function (request, reply) {
            let id = request.params.id;
            usersCollection.findOne({_id: new ObjectID(id)}, function (err, userDetail) {
                if (err) {
                    reply({message: 'error'}).code(400);
                }
                userDetail.password = undefined;
                reply(userDetail);
            });
        }
    });

    server.route({
        method: "DELETE",
        path: "/users/{id}",
        handler: function (request, reply) {
            let id = new ObjectID(request.params.id);
            usersCollection.deleteOne({_id: id}, function (err, result) {
                if (err) {
                    reply({message: 'error'}).code(400);
                }
                reply({message:`Removed the game with id ${request.params.id}`});
            });
        }
    });
}

module.exports = userRoutes;
