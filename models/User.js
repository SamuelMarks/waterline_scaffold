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
exports.bar = { can: 'foo', haz: true };
