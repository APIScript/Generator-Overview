
import * as chalk from "chalk";
import * as apiscript from "apiscript";
import {PropertyType} from "apiscript";

export class OverviewGenerator implements apiscript.Generator {

    generate(api: apiscript.API, config: apiscript.Config) {
        print();
        printTitle(`API "/${api.name}"`);
        print();

        api.forEachEnum((enumerator) => {
            printEnumHeading(`Enum ${enumerator.name}`);

            enumerator.forEachValue((value) => {
                printValue(`${value}`);
            });

            print();
        });

        api.forEachEntity((entity) => {
            if (entity.inherits) {
                printEntityHeading(`Entity ${entity.name} Inherits ${entity.inherits}`);
            } else {
                printEntityHeading(`Entity ${entity.name}`);
            }

            printProperties(entity);
            print();
        });

        api.forEachEndpoint((endpoint) => {

            let heading = `${apiscript.RequestMethod[endpoint.requestMethod]} ` +
                `"/${endpoint.url}"`;

            if (endpoint.requestType) { heading += ` requests ${endpoint.requestType}`; }
            if (endpoint.returnType) { heading += ` returns ${endpoint.returnType}`; }

            printEndpointHeading(heading);

            printProperties(endpoint);
            print();
        });
    }

}

function print(message: any = '') {
    console.log(' ' + message);
}

function printTitle(message: string) {
    print(chalk.bold.white.bgRed(` ${message} `));
}

function printEnumHeading(message: string) {
    print(' ' + chalk.bgMagenta.white.bold(` ${message} `));
}

function printEntityHeading(message: string) {
    print(' ' + chalk.bgGreen.white.bold(` ${message} `));
}

function printEndpointHeading(message: string) {
    print(' ' + chalk.bgCyan.white.bold(` ${message} `));
}

function printValue(message: string) {
    print(chalk.white.bold(`  ${message} `));
}

function printProperties(propertyHolder: apiscript.Endpoint | apiscript.Entity) {

    if (propertyHolder.propertyCount == 0) {
        printValue('-');
    } else {
        propertyHolder.forEachProperty((property) => {

            let message = '';
            if (property.isOptional) { message += `Optional `; }

            message += `${property.name} `;
            message += `${propertyTypeToString(property.type)}`;

            if (property.defaultValue) {

                if (property.type.asPrimitive && property.type.asPrimitive.asString) {
                    message += ` = "${property.defaultValue}"`;
                } else {
                    message += ` = ${property.defaultValue}`;
                }
            }

            if (property.constraints) { message += ` (${property.constraints})`; }
            printValue(message);
        });
    }
}

function propertyTypeToString(type: PropertyType): string {

    if (type.asPrimitive) {
        let primitive = type.asPrimitive;

        if (primitive.asInteger) { return 'Integer'; }
        if (primitive.asFloat) { return 'Float'; }
        if (primitive.asBoolean) { return 'Boolean'; }
        if (primitive.asString) { return 'String'; }

    } else if (type.asCollection) {
        let collection = type.asCollection;

        if (collection.asList) {
            let list = collection.asList;
            return `[${propertyTypeToString(list.type)}]`;
        }

        if (collection.asSet) {
            let set = collection.asSet;
            return `<${propertyTypeToString(set.type)}>`;
        }

        if (collection.asMap) {
            let map = collection.asMap;
            return `<${propertyTypeToString(map.keyType)} -> ${propertyTypeToString(map.keyType)}>`;
        }

    } else if (type.asCustom) {
        return type.asCustom.type;

    } else if (type.asClosure) {
        let properties = type.asClosure.properties;
        let result = '{ ';

        properties.forEach((property, index) => {
            result += property.name + ': ' + propertyTypeToString(property.type);
            if (index < properties.length - 1) { result += ', '; }
        });

        result += ' }';
        return result;
    }
}

let instance = new OverviewGenerator();
module.exports = instance;