/// <reference path="./typings/node/node.d.ts"/>
/// <reference path="./typings/lodash/lodash.d.ts"/>
/// <reference path="./cust_typings/waterline.d.ts"/>
/// <reference path="./cust_typings/sails-postgresql.d.ts"/>

///// <reference path="typescript/src/lib/es6"/>

'use strict';

import Waterline = require('waterline');
import sails_postgresql = require('sails-postgresql');
import _ = require('lodash');

import User = require('./models/User');
import Utils = require('./utils');


export var waterline: typeof Waterline = new Waterline();

export function init_models() {
    waterline.loadCollection(Waterline.Collection.extend(User.User));
}

export function init_db_conn() {
    const config = {
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

    waterline.initialize(config, function(err, ontology) {
        if (err) {
            return console.error(err);
        }

        // Tease out fully initialised models.
        var User: WaterlineMod.Model = ontology.collections.user_tbl;

        // First we create a user.
        User.create({
            email: 'foo@bar.com',
            password: 'bfsdfsdf'
        }, function(err, model) {
            console.error('err = ', err);
            console.info('model = ', model);
        });
        User.findOne({ email: 'foo@bar.com' }, (err, res) => {
            console.error('err = ', err);
            console.info('res = ', res);
            var rec: WaterlineMod.QueryResult = res;
            console.log('email = ' + rec['email']);
            console.log(rec.toJSON());
        })
    });
}

export function init_all() {
    init_models();
    init_db_conn();
}

if (require.main === module) {
    init_all()
}
