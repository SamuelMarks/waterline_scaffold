'use strict';
var Waterline = require('waterline');
var sails_postgresql = require('sails-postgresql');
var _ = require('lodash');
var User = require('./models/User');
var Utils = require('./utils');
exports.waterline = new Waterline();
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
        if (err) {
            return console.error(err);
        }
        var User = ontology.collections.user_tbl;
        User.create({
            email: 'foo@bar.com',
            password: 'bfsdfsdf'
        }, function (err, model) {
            console.error('err = ', err);
            console.info('model = ', model);
        });
        User.findOne({ email: 'foo@bar.com' }, function (err, res) {
            console.error('err = ', err);
            console.info('res = ', res);
            var rec = res;
            console.log('email = ' + rec['email']);
            console.log(rec.toJSON());
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
