///<reference path="../cust_typings/waterline.d.ts"/>

declare var user: user.user;

declare module user {
    export interface user extends waterline.Record, waterline.Model {
        email: string;
        password: string;
    }
}

declare module "user" {
    export = user;
}
