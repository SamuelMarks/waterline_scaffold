var esprima = require('esprima');
var fs = require('fs');
var path = require('path');
var Property;
(function (Property) {
    Property[Property["string"] = 0] = "string";
    Property[Property["text"] = 1] = "text";
    Property[Property["integer"] = 2] = "integer";
    Property[Property["float"] = 3] = "float";
    Property[Property["date"] = 4] = "date";
    Property[Property["time"] = 5] = "time";
    Property[Property["datetime"] = 6] = "datetime";
    Property[Property["boolean"] = 7] = "boolean";
    Property[Property["binary"] = 8] = "binary";
    Property[Property["array"] = 9] = "array";
    Property[Property["json"] = 10] = "json";
})(Property || (Property = {}));
function path_to_estree(filepath, cb) {
    fs.readFile(filepath, 'utf8', function (err, res) {
        return err ? cb(err) : cb(null, {
            file: esprima.parse(filepath),
            content: esprima.parse(res)
        });
    });
}
exports.path_to_estree = path_to_estree;
function model_estree_to_interface(obj, cb) {
    return cb(null, obj.content.body.map(function (elem) { return handle_from_elem_type(obj, elem)[0]; }).filter(function (_) { return Object.keys(_).length !== 0; }));
}
exports.model_estree_to_interface = model_estree_to_interface;
function handle_from_elem_type(obj, elem) {
    switch (elem.type) {
        case 'VariableDeclaration':
            return elem.declarations.map(function (e) {
                return {
                    filename: obj.filename,
                    model_name: get_model_name(e),
                    model_attr: get_model_attr(e).filter(function (_) { return _; })[0]
                };
            });
            break;
        default:
            console.warn("Parsing not implemented for " + elem.type + ".");
            return [{}];
    }
}
function get_model_name(e) {
    switch (e.id.type) {
        case 'Identifier':
            return e.id.name;
        default:
            console.warn("Parsing not implemented for " + e.id.type + ".");
            return null;
    }
}
function get_model_attr(e) {
    switch (e.init.type) {
        case 'ObjectExpression':
            return e.init.properties.map(function (property) {
                var name = property.key.name;
                switch (name) {
                    case 'attributes':
                        var attributes = property.value;
                        return attributes_to_interface(attributes.properties, function (er, re) {
                            if (er)
                                throw er;
                            return re;
                        });
                    default:
                        console.warn("Parsing not implemented for property.type=='" + property.key.type + "' && property.name=='" + name + "'");
                }
            });
            break;
        default:
            console.warn("Parsing not implemented for " + e.init.type + ".");
    }
}
function attributes_to_interface(attributes, cb) {
    return cb(null, named_type_to_interface_type(obj_array_to_obj(attributes.map(property_to_named_type))));
}
function obj_array_to_obj(obj_array) {
    var obj = {};
    obj_array.forEach(function (elem) { for (var key in elem)
        obj[key] = elem[key]; });
    return obj;
}
function property_to_named_type(property) {
    if (property.computed)
        console.warn("Computed property with key " + property.key);
    if (property.type !== 'Property')
        return;
    if (property.key.type !== 'Identifier')
        return;
    var attributes = property.value;
    var ret = {};
    ret[property.key.name] = function get_type() {
        return attributes.properties.filter(function (e) {
            return e.key.type === 'Identifier' && e.key.name === 'type';
        })[0].value.value;
    }();
    return required_property_handler(property, attributes, ret);
}
function required_property_handler(property, attributes, ret) {
    var required = attributes.properties.filter(function (e) {
        return e.key.type === 'Identifier' && e.key.name === 'required';
    })[0];
    var new_name = (function () {
        switch (required) {
            case undefined:
                return property.key.name + "?";
            default:
                return required.value.value ? property.key.name : property.key.name + "?";
        }
    })();
    if (property.key.name !== new_name) {
        ret[new_name] = ret[property.key.name];
        delete ret[property.key.name];
    }
    return ret;
}
function named_type_to_interface_type(named_type) {
    return Object.keys(named_type).map(function (key) { return (key + ": " + named_type[key] + ";"); });
}
function interface_dsl_to_interface(result, parsed_path, extends_str, cb) {
    var filename = path.join(parsed_path.dir, path.sep, parsed_path.name + '.d.ts');
    console.log("Writing to: \"" + filename + "\"");
    if (extends_str)
        extends_str[0] === ' ' ? null : extends_str = ' ' + extends_str;
    else
        extends_str = '';
    fs.writeFile(filename, result.map(function (elem) { return ("export interface " + elem.model_name + extends_str + " {\n" + elem.model_attr.map(function (e) { return '    ' + e; }).join('\n') + "\n}"); }).join('\n\n') + '\n', { encoding: 'utf8', flag: 'w' }, cb);
}
function print_usage() {
    console.info('Usage:', process.argv[0], process.argv[1], '<js_filepath>', '<extends string>');
    console.info('Example:', process.argv[0], process.argv[1], 'foo.js', 'extends IBar, ICan');
    console.info('Example:', process.argv[0], process.argv[1], path.join('foo', path.sep, 'haz.js'));
}
if (require.main === module) {
    if (!process.argv[2]) {
        print_usage();
        process.exit(1);
    }
    try {
        var stat = fs.statSync(process.argv[2]);
        if (!stat.isFile()) {
            print_usage();
            console.error("Expected " + process.argv[2] + " to be a file, but it's a directory.");
            process.exit(2);
        }
    }
    catch (e) {
        print_usage();
        console.error(e.message);
        process.exit(2);
    }
    path_to_estree(process.argv[2], function (err, res) {
        if (err)
            throw err;
        model_estree_to_interface(res, function (error, result) {
            if (error)
                throw error;
            interface_dsl_to_interface(result, path.parse(process.argv[2]), process.argv[3], function (e) {
                if (e)
                    throw e;
            });
        });
    });
}
