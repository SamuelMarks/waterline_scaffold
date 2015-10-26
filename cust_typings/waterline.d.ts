///<reference path="../typings/node/node.d.ts"/>
///<reference path="../typings/es6-promise/es6-promise.d.ts"/>

declare var waterline: WaterlineMod.Wl;

declare module WaterlineMod {
    export interface Wl {
        new (): Wl;
        _collections: string[];
        _connections: {};
        loadCollection(collection: {}): Model;
        initialize(options: {}, cb: (err: any, ontology: any) => void): Model;
        teardown(cb: (err: any, res: any) => void): void;
        bootstrap(cb: (err: any, res: any) => void): void;
        Collection: Collection;
        Model: Model;
    }

    interface Collection extends Core {
        new (waterline: Wl, connections: {}, cb: cb): Collection;

        connections: {};
        waterline: Wl;
        attributes: {};
        extend(model: {}): Collection;
    }

    interface Core {
        _attributes: {};
        _cast: Cast;
        _schema: Schema;
        _validator: Validator;
        _callbacks: {};
        _instanceMethods;
        new (options: {}): Core;

        hasSchema: boolean;
        migrate: string;

        adapter: {};
        connections: {};
        defaults: {};
    }

    interface Cast {
        _types: {};
        new (): Cast;
        initialize(attrs: {}): Cast;
        run(values: {}): {};
        string(str: string): string;
        integer(key: string, value: any): number;
        float(value: number): number;
        boolean(value: boolean): boolean;
        date(value: typeof Date): typeof Date;
        array(value: any): any[];
    }

    interface Schema {
        new (self: any): Cast;
        initialize(attrs: {}, hasSchema: boolean, reservedAttributes: {}): Schema;
        context: {};
        schema: {};
        objectAttribute(attrName: string, value: {}): {};
        cleanValues(values: {}): {};
    }

    interface Validator {
        new (adapter: string): Validator;
        validations: {};
        initialize(attrs: {}, types: {}, defaults: {}): {};
        validate(values: {}, presentOnly: boolean, cb: cb): Error[];
    }

    interface Query {
        adapter: AdapterBase;
        sync(cb: cb): any;
    }

    interface AdapterBase extends Adapter {
        /* anything go here? */
    }

    interface Adapter extends Dql, Ddl, compoundQueries, aggregateQueries, sync, stream {
        new (options: {}): Adapter;
        connections: {};
        dictionary: {};
        query: {};
        collection: string;
        identity: string;
    }

    interface Dql {
        hasJoin(): boolean;
        join(criteria: {}, cb: cb): void;
        create(values: {}, cb: cb): {};
        find(criteria: {}, cb: cb): {};
        findOne(criteria: {}, cb: cb): {};
        count(criteria: {}, cb: cb): number;
        update(criteria: {}, values: {}, cb: cb): {};
        destroy(criteria: {}, cb: cb): {};
    }

    interface Ddl {
        define(cb: cb): { describe(err, existingAttributes): any };
        describe(cb: cb): any;
        drop(relations: {}, cb: cb): any;
        alter(cb: cb): any;
    }

    interface compoundQueries {
        findOrCreate(criteria: {}, values: {}, cb: cb): {};
        findOne(criteria: {}, cb: cb): {};
    }

    interface aggregateQueries {
        createEach(valuesList: any[], cb: cb): cbList;
        findOrCreateEach(attributesToCheck: any[], valuesList: any[], cb: cb): cbList;
    }

    interface setupTeardown {
        teardown(cb: cb): any;
    }

    interface sync {
        migrateDrop(cb: cb): any;
        migrateAlter(cb: cb): any;
        migrateCreate(cb: cb): any;
        migrateSafe(cb: cb): any;
    }

    interface stream {
        stream(criteria: {}, stream: any): any;
    }

    interface Model extends Adapter {
        new (context: {}, mixins: {}): Model;
        create(params: Object): WaterlinePromise<QueryResult>;
        create(params: Array<Object>): WaterlinePromise<QueryResult>;
        create(params: Object, cb: (err: Error, created: QueryResult) => void): void;
        create(params: Array<Object>, cb: (err: Error, created: Array<QueryResult>) => void): void;
        toObject(): Object;
        save(options: {}, cb: cb): any; // Promise
        destroy(cb: cb): any; // Promise
        _defineAssociations(): void;
        _normalizeAssociations(): void;
        _cast(values: {}): void;
        validate(cb: cb): any; // Promise
        toJSON(): JSON;
    }

    export interface WaterlinePromise<T> extends Promise<T> {
        exec(cb: (err: Error, results: Array<QueryResult>) => void);
        exec(cb: (err: Error, result: QueryResult) => void);
    }

    export interface QueryResult extends Record {
        destroy(): Promise<Array<QueryResult>>;
        toJSON(): Object;
    }

    export interface Record {
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }

    interface BaseModel {
        _properties: {};
        inspect: any;
    }

    interface cb {
        (err: Error, res: any);
    }

    interface cbList {
        (err: Error, res: any[]);
    }





    /*
    interface SimpleCb {
        err: any;
        ontology: any;
    }

    export interface Model {
        attributes: Object;

        create(params: Object): WaterlinePromise<QueryResult>;
        create(params: Array<Object>): WaterlinePromise<QueryResult>;
        create(params: Object, cb: (err: Error, created: QueryResult) => void): void;
        create(params: Array<Object>, cb: (err: Error, created: Array<QueryResult>) => void): void;

        find(): QueryBuilder;
        find(params: Object): QueryBuilder;
        find(params: Object): WaterlinePromise<Array<QueryResult>>;

        findOne(criteria: Object): WaterlinePromise<QueryResult>;

        count(criteria: Object): WaterlinePromise<number>;
        count(criteria: Array<Object>): WaterlinePromise<number>;
        count(criteria: string): WaterlinePromise<number>;
        count(criteria: number): WaterlinePromise<number>;

        count(criteria: Object, cb: (err: Error, found: number) => void);
        count(criteria: Array<Object>, cb: (err: Error, found: number) => void);
        count(criteria: string, cb: (err: Error, found: number) => void);
        count(criteria: number, cb: (err: Error, found: number) => void);

        destroy(criteria: Object): WaterlinePromise<Array<Record>>;
        destroy(criteria: Array<Object>): WaterlinePromise<Array<Record>>;
        destroy(criteria: string): WaterlinePromise<Array<Record>>;
        destroy(criteria: number): WaterlinePromise<Array<Record>>;

        destroy(criteria: Object, cb: (err: Error, deleted: Array<Record>) => void): void;
        destroy(criteria: Array<Object>, cb: (err: Error, deleted: Array<Record>) => void): void;
        destroy(criteria: string, cb: (err: Error, deleted: Array<Record>) => void): void;
        destroy(criteria: number, cb: (err: Error, deleted: Array<Record>) => void): void;

        update(criteria: Object, changes: Object): WaterlinePromise<Array<QueryResult>>;
        update(criteria: Array<Object>, changes: Object): WaterlinePromise<Array<QueryResult>>;
        update(criteria: string, changes: Object): WaterlinePromise<Array<QueryResult>>;
        update(criteria: number, changes: Object): WaterlinePromise<Array<QueryResult>>;

        update(criteria: Object, changes: Array<Object>): WaterlinePromise<Array<QueryResult>>;
        update(criteria: Array<Object>, changes: Array<Object>): WaterlinePromise<Array<QueryResult>>;
        update(criteria: string, changes: Array<Object>): WaterlinePromise<Array<QueryResult>>;
        update(criteria: number, changes: Array<Object>): WaterlinePromise<Array<QueryResult>>;

        update(criteria: Object, changes: Array<Object>, cb: (err: Error, updated: Array<QueryResult>) => void): void;
        update(criteria: Array<Object>, changes: Array<Object>, cb: (err: Error, updated: Array<QueryResult>) => void): void;
        update(criteria: string, changes: Array<Object>, cb: (err: Error, updated: Array<QueryResult>) => void): void;
        update(criteria: number, changes: Array<Object>, cb: (err: Error, updated: Array<QueryResult>) => void): void;

        query(sqlQuery: string, cb: (err: Error, results: Array<Record>) => void);
        native(cb: (err: Error, collection: Model) => void);

        stream(criteria: Object, writeEnd: Object): NodeJS.WritableStream;
        stream(criteria: Array<Object>, writeEnd: Object): NodeJS.WritableStream;
        stream(criteria: string, writeEnd: Object): NodeJS.WritableStream;
        stream(criteria: number, writeEnd: Object): NodeJS.WritableStream;

        stream(criteria: Object, writeEnd: Object): Error;
        stream(criteria: Array<Object>, writeEnd: Object): Error;
        stream(criteria: string, writeEnd: Object): Error;
        stream(criteria: number, writeEnd: Object): Error;
    }

    export interface WaterlinePromise<T> extends Promise<T> {
        exec(cb: (err: Error, results: Array<QueryResult>) => void);
        exec(cb: (err: Error, result: QueryResult) => void);
    }

    export interface Record {
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }
    export interface QueryResult extends Record {
        destroy(): Promise<Array<QueryResult>>;
        toJSON(): Object;
    }

    export interface QueryBuilder extends Promise<any> {
        exec(cb: (error: any, results: Array<QueryResult>) => void);

        where(condition: Object): QueryBuilder;
        limit(lim: number): QueryBuilder;
        skip(num: number): QueryBuilder;
        sort(criteria: string): QueryBuilder;
        populate(association: string): QueryBuilder;
        populate(association: string, filter: Object): QueryBuilder;
    }

    interface SingleResult {
        (err: Error, model: any): void;
    }

    interface MultipleResult {
        (err: Error, models: any[]): void;
    }

    interface Result<T> {
        done(callback: T): void;
    }
    */

}

declare module "waterline" {
    export = waterline;
}
