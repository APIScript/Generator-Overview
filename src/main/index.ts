
import * as chalk from "chalk";
import {Config, Generator, API, PropertyType, RequestMethod, Property} from "apiscript";

export class OverviewGenerator implements Generator {

    generate(api: API, config: Config) {
        print();
        printTitle(`API ${api.name}`);
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

            printPropertyType(entity.closure);
            print();
        });

        api.forEachEndpoint((endpoint) => {
            let heading = `${RequestMethod[endpoint.requestMethod]} ${endpoint.url}`;
            printEndpointHeading(heading);

            if (endpoint.requestType) { printPropertyType(endpoint.requestType); }
            if (endpoint.bodyType) { printPropertyType(endpoint.bodyType); }
            if (endpoint.responseType) { printPropertyType(endpoint.responseType); }

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

function printProperty(property: Property) {
    printValue(propertyToString(property));
}

function printPropertyType(type: PropertyType) {
    printValue(propertyTypeToString(type));
}

function propertyToString(property: Property): string {
    let message = '';
    if (property.isOptional) { message += `Optional `; }

    message += `${property.name} ${propertyTypeToString(property.type)}`;

    if (property.defaultValue) {
        if (property.type.asPrimitive && property.type.asPrimitive.asString) {
            message += ` = "${property.defaultValue}"`;
        } else {
            message += ` = ${property.defaultValue}`;
        }
    }

    if (property.constraints) { message += ` (${property.constraints})`; }

    return message;
}

function propertyTypeToString(type: PropertyType): string {

    if (type.asPrimitive) {
        let primitive = type.asPrimitive;

        if (primitive.asInteger) { return 'integer'; }
        if (primitive.asFloat) { return 'float'; }
        if (primitive.asBoolean) { return 'boolean'; }
        if (primitive.asString) { return 'string'; }

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
        let closure = type.asClosure;
        let result = '{ ';

        closure.forEachProperty((property, index) => {
            result += propertyToString(property);
            if (index < closure.propertyCount - 1) { result += ', '; }
        });

        result += ' }';
        return result;
    }
}

let instance = new OverviewGenerator();
module.exports = instance;