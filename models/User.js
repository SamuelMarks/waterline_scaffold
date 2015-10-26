/// <reference path="../cust_typings/waterline.d.ts"/>
'use strict';
exports.User = {
    identity: 'user_tbl',
    connection: 'postgres',
    attributes: {
        email: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        }
    }
};
//# sourceMappingURL=User.js.map