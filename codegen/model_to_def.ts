/// <reference path='../typings/node/node.d.ts'/>
/// <reference path='../typings/esprima/esprima.d.ts'/>

import esprima = require('esprima');
import fs = require('fs');
import path = require('path');


interface ModelToDef {
    file: ESTree.Program;
    content: ESTree.Program;
}

interface ModelToEstreeRes {
    filename: string;
    model_name: string;
    model_attr: Array<Array<ESTree.Property>>;
}

interface IProperty {
    type: string,
    key: {
        name: string;
        type: string;
    };
    value: any | { value: ESTree.Property } | ESTree.FunctionExpression;
    kind: string;
    computed: boolean;
    static: boolean;
}

enum Property {
    // See: https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#data-types
    string
}

declare type type = Property;
interface AttributeToType {
    [attribute: string]: type;
}

export function path_to_estree(filepath, cb: (err: NodeJS.ErrnoException, res?: ModelToDef) => void): void {
    fs.readFile(filepath, 'utf8', (err, res) => {
        return err ? cb(err) : cb(null, {
            file: esprima.parse(filepath),
            content: esprima.parse(res)
        });
    });
}

export function model_estree_to_interface(obj: ModelToDef, cb: (err: Error, res: Array<ModelToEstreeRes>) => void): void {
    return cb(null, obj.content.body.map(elem => handle_from_elem_type(obj, elem)[0]));
}

function handle_from_elem_type(obj, elem): ModelToEstreeRes[] {
    switch (elem.type) {
        case 'VariableDeclaration':
            return (<ESTree.VariableDeclaration>elem).declarations.map(e => {
                return <ModelToEstreeRes>{
                    filename: obj.filename,
                    model_name: <string>get_model_name(e),
                    model_attr: <Array<Array<ESTree.Property>>>get_model_attr(e).filter(_ => _)[0]
                }
            })
            break;
        default:
            console.warn(`Parsing not implemented for ${elem.type}.`)
            return [<ModelToEstreeRes>{ filename: obj.filename, model_name: undefined, model_attr: Array<Array<ESTree.Property>>() }];
    }
}

function get_model_name(e: ESTree.VariableDeclarator) {
    switch (e.id.type) {
        case 'Identifier':
            return (<ESTree.Identifier>e.id).name;
        default:
            console.warn(`Parsing not implemented for ${e.id.type}.`)
            return null;
    }
}

function get_model_attr(e: ESTree.VariableDeclarator) {
    switch (e.init.type) {
        case 'ObjectExpression':
            return (<ESTree.ObjectExpression>e.init).properties.map(property => {
                const name = (<{ name?: string }>property.key).name;
                switch (name) {
                    case 'attributes':
                        const attributes: { properties?: Array<ESTree.Property> } = property.value; // Casting failed, so here's a wasted var
                        return attributes_to_interface(attributes.properties, (er, re) => {
                            if (er) throw er;
                            return re;
                        });
                    default:
                        console.warn(`Parsing not implemented for property.type=='${property.key.type}' && property.name=='${name}'`)
                }
            });
            break;
        default:
            console.warn(`Parsing not implemented for ${e.init.type}.`);
    }
}

function attributes_to_interface(attributes: any/*Array<ESTree.Property>*/, cb: (err: Error, res: any) => any) {
    return cb(null, named_type_to_interface_type(obj_array_to_obj(attributes.map(property_to_named_type))));
}

function obj_array_to_obj(obj_array: any[]) {
    let obj: any = {};
    obj_array.forEach(elem => { for (const key in elem) obj[key] = elem[key] });
    return obj;
}

function property_to_named_type(property: IProperty): AttributeToType {
    if (property.computed) console.warn(`Computed property with key ${property.key}`);
    if (property.type !== 'Property') return;
    if (property.key.type !== 'Identifier') return;

    const attributes: { properties?: Array<IProperty> } = property.value; // Casting failed, so here's a wasted var

    let ret: AttributeToType = <AttributeToType>{};
    ret[property.key.name] = function get_type() {
        return attributes.properties.filter(function(e: IProperty) {
            return e.key.type === 'Identifier' && e.key.name === 'type'
        })[0].value.value
    } ()

    return required_property_handler(property, attributes, ret);
}

function required_property_handler(property: IProperty, attributes: { properties?: Array<IProperty> }, ret: AttributeToType) {
    let required: IProperty = attributes.properties.filter(function(e: IProperty) {
        return e.key.type === 'Identifier' && e.key.name === 'required'
    })[0];

    const new_name = (() => {
        switch (required) {
            case undefined:
                return `${property.key.name}?`
            default:
                return required.value.value ? property.key.name : `${property.key.name}?`
        }
    })();

    if (property.key.name !== new_name) {
        ret[new_name] = ret[property.key.name];
        delete ret[property.key.name];
    }

    return ret;
}

function named_type_to_interface_type(named_type: AttributeToType) {
    return Object.keys(named_type).map(key => `${key}: ${named_type[key]};`)
}

function interface_dsl_to_interface(result, parsed_path: path.ParsedPath, extends_str: string, cb: (err: Error, res?: any) => void): void {
    const filename: string = path.join(parsed_path.dir, path.sep, parsed_path.name + '.d.ts');
    console.log(`Writing to: "${filename}"`);
    if (extends_str) extends_str[0] === ' ' ? null : extends_str = ' ' + extends_str;
    else extends_str = '';
    fs.writeFile(filename,
        result.map(elem => `export interface ${elem.model_name}${extends_str} {\n${elem.model_attr.map(e => '    ' + e).join('\n')}\n}`).join('\n\n') + '\n',
        { encoding: 'utf8', flag: 'w' }, cb
    );
}

if (require.main === module) {
    fs.stat(process.argv[2], (err, _) => {
        if (err) {
            console.info('Usage:', process.argv[0], process.argv[1], '<js_filepath>', '<extends string>');
            console.info('Example:', process.argv[0], process.argv[1], 'foo.js', 'extends IBar, ICan')
            console.info('Example:', process.argv[0], process.argv[1], path.join('foo', path.sep, 'haz.js'))
            console.error(err.message);
            process.exit(2);
        }
    });

    path_to_estree(process.argv[2], (err, res) => {
        if (err) throw err;
        model_estree_to_interface(res, (error, result) => {
            if (error) throw error;
            interface_dsl_to_interface(result, path.parse(process.argv[2]), process.argv[3], (e) => {
                if (e) throw e;
            })
        });
    });
}
