/// <reference path="../cust_typings/waterline.d.ts"/>

'use strict';

export const User = {
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

interface Bar {
    can: string;
    haz: boolean;
}

export const bar: Bar = { can: 'foo', haz: true };
