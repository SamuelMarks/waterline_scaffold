/// <reference path="./typings/lodash/lodash.d.ts"/>

import _ = require('lodash');

export function url_to_config(url: string) {
    url = url.substr(url.search('//') + 2);
    return _.extend(function() {
        const col_at = url.search(':');
        return col_at !== -1 ? {
            user: url.substr(0, col_at),
            password: url.substr(col_at + 1, url.search('@') - col_at - 1)
        } : {}
    } (),
        function() {
            const at_at = url.search('@');
            const host_db = url.substr(at_at !== -1 ? at_at + 1 : 0);
            const slash_at = host_db.search('/');
            return slash_at !== -1 ? {
                host: host_db.substr(0, slash_at),
                database: host_db.substr(1 + slash_at)
            } : { host: host_db }
        } ())
}
