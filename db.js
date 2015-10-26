/// <reference path='./typings/node/node.d.ts' />
/// <reference path='./typings/lodash/lodash.d.ts' />
/// <reference path='./cust_typings/waterline.d.ts' />
/// <reference path='./cust_typings/sails-postgresql.d.ts' />
/// <reference path='./cust_typings/sails-postgresql.d.ts' />
/// <reference path='./models/user.d.ts' />
'use strict';
var Waterline = require('waterline');
var sails_postgresql = require('sails-postgresql');
var _ = require('lodash');
var User = require('./models/User');
var Utils = require('./utils');
exports.waterline = new Waterline();
function throw_if_err(err) {
    if (err !== null) {
        throw new Error(err);
    }
}
function init_models() {
    exports.waterline.loadCollection(Waterline.Collection.extend(User.User));
}
exports.init_models = init_models;
function init_db_conn() {
    var config = {
        adapters: {
            url: process.env.RDBMS_URI,
            postgres: sails_postgresql
        },
        connections: {
            postgres: _.extend({
                adapter: 'postgres'
            }, Utils.url_to_config(process.env.RDBMS_URI))
        }
    };
    exports.waterline.initialize(config, function (err, ontology) {
        if (err !== null)
            throw err;
        // Tease out fully initialised models.
        var User = ontology.collections.user_tbl;
        // First we create a user.
        User.create({
            email: 'foo@bar.com',
            password: 'bfsdfsdf'
        }, function (e, u) {
            if (err !== null)
                throw e;
            console.info('create::u = ', u);
        });
        User.findOne({ email: 'foo@bar.com' }, function (error, user) {
            if (err !== null)
                throw error;
            console.info('findOne::user = ', user);
            console.info('findOne::user.email =', user.email);
            console.info('findOne::user.toJSON() =', user.toJSON());
        });
    });
}
exports.init_db_conn = init_db_conn;
function init_all() {
    init_models();
    init_db_conn();
}
exports.init_all = init_all;
if (require.main === module) {
    init_all();
}
//# sourceMappingURL=db.js.map