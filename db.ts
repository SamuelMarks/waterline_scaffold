/// <reference path='./typings/node/node.d.ts' />
/// <reference path='./typings/lodash/lodash.d.ts' />
/// <reference path='./cust_typings/waterline.d.ts' />
/// <reference path='./cust_typings/sails-postgresql.d.ts' />
/// <reference path='./cust_typings/sails-postgresql.d.ts' />
/// <reference path='./models/user.d.ts' />

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
        if (err !== null) throw err;

        // Tease out fully initialised models.
        const User: Waterline.Query = ontology.collections.user_tbl;

        // First we create a user.
        User.create({
            email: 'foo@bar.com',
            password: 'bfsdfsdf'
        }, function(e, u) {
            if (err !== null) throw e;
            console.info('create::u = ', u);
        });
        User.findOne({ email: 'foo@bar.com' }, (error: Error, user: user.user) => {
            if (err !== null) throw error;
            console.info('findOne::user = ', user);
            console.info('findOne::user.email =', user.email)
            console.info('findOne::user.toJSON() =', user.toJSON())
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
