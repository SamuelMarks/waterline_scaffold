waterline_scaffold
==================

Simple baseline scaffold to get you started using Waterline with TypeScript.


## Install prerequisites

  0. node & npm (tested with node v4 and npm v3.3.4 on Ubuntu 15.04 x64)
  1. Run: `npm install -g tsd typescript`
  2. `cd` to directory you've cloned this repo into
  3. Run: `npm install`
  4. Run: `tsd install`

## Compile+run app

    tsc --sourcemap --module commonjs db.ts && npm start

## Generate TypeScript definitions from Model
Example with "models/TUser.js", contains two variables `FFOOOOOOOOOOOOOOOOOOOO` and `BARRRRRR` containing:

```typescript
{
    identity: 'user_tbl',
    connection: 'postgres',
    attributes: {
        email: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: false
        },
        name: {
            type: 'string'
        }
    }
};
```

Generating the interfaces; extending with `waterline.Record, waterline.Model`:

    tsc --sourcemap --module commonjs codegen/model_to_def.ts
    node codegen/model_to_def.js models/TUser.js 'extends waterline.Record, waterline.Model'

Will create file "models/TUser.d.ts" containing:

```typescript
export interface FFOOOOOOOOOOOOOOOOOOOO extends waterline.Record, waterline.Model {
    email: string;
    password?: string;
    name?: string;
}

export interface BARRRRRR extends waterline.Record, waterline.Model {
    email: string;
    password?: string;
    name?: string;
}
```
