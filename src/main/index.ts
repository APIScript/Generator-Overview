
import * as chalk from 'chalk';
import * as apiset from 'apiset';

export class OverviewGenerator implements apiset.Generator {

    generate(api: apiset.API, config: apiset.Config) {
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
            if (endpoint.returnType) {
                printEndpointHeading(`${apiset.requestMethodToString(endpoint.requestMethod)} ` +
                    `"/${endpoint.url}" returns ${endpoint.returnType}`);
            } else {
                printEndpointHeading(`${apiset.requestMethodToString(endpoint.requestMethod)} ` +
                    `"/${endpoint.url}"`);
            }

            printProperties(endpoint);
            print();
        });
    }

}

function clear() {
    print('\x1bc');
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

function printProperties(propertyHolder: apiset.Endpoint | apiset.Entity) {

    if (propertyHolder.propertyCount == 0) {
        printValue('-');
    } else {
        propertyHolder.forEachProperty((property) => {

            let message = '';
            if (property.isOptional) { message += `Optional `; }

            message += property.type;
            message += ` ${property.name}`;

            if (property.defaultValue) {

                if (property.type.isString) {
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

let instance = new OverviewGenerator();
module.exports = instance;