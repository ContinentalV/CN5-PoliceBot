import { createLogger, format, transports, config } from "winston";
import chalk from "chalk";
import { v4 as uuidv4 } from 'uuid';

// Configuration des couleurs avec Chalk pour la console
const consoleFormat = format.combine(
    format.timestamp({ format: "DD-MM-YYYY | HH:mm:ss" }),
    format.printf((info) => {
        const timestamp = chalk.bgBlack.whiteBright(` ${info.timestamp} `) + chalk.bgGrey.whiteBright('|::|');
        let level = '';
        let message = info.message;

        switch (info.level) {
            case 'error':
                level = chalk.bgRedBright.black(` ${info.level.toUpperCase()} `);
                message = chalk.red(message);
                break;
            case 'warn':
                level = chalk.bgYellowBright.black(` ${info.level.toUpperCase()} `);
                message = chalk.yellow(message);
                break;
            case 'info':
                level = chalk.bgGreenBright.black(` ${info.level.toUpperCase()} `);
                message = chalk.green(message);
                break;
            case 'db':
                level = chalk.bgHex('#e89a00').black(` ${info.level.toUpperCase()} `);
                message = chalk.hex('#e89a00')(message);
                break;
                case 'command':
                level = chalk.bgYellowBright.black(` ${info.level.toUpperCase()} `);
                message = chalk.blueBright(message); //overwrite message color
    break;
            default:
                level = chalk.bgWhite(` ${info.level.toUpperCase()} `);
                message = chalk.white(message);
                break;
        }

        return `${timestamp}${level}: ${message}`;
    })
);

// Format standard pour les fichiers (sans Chalk)
const fileFormat = format.combine(
    format.timestamp({ format: "DD-MM-YYYY | HH:mm:ss" }),
    format.printf(info => `${info.timestamp} |::| ${info.level} |::| ${info.message}`)
);

// Niveaux de journalisation personnalisés par defaut
config.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'green',
    actionUser: "cyan",
    actionBot: "magenta",


});


// Logger principal pour les logs d'information, d'avertissement et de base de données
const mainLogger = createLogger({
    levels: config.npm.levels,
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
        new transports.File({
            filename: 'logs/discord-interaction.log',
            level: 'info',
            format: fileFormat
        }),
    ]
});

// Logger spécifique pour les erreurs
const errorLogger = createLogger({
    levels: config.npm.levels,
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
        new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: format.combine(
                format.timestamp({ format: "DD-MM-YYYY | HH:mm:ss" }),
                format.printf(info => `${info.timestamp} |::| ${info.level} |::| ${info.message} | Error ID: ${uuidv4()}`) // Ajout d'un ID d'erreur unique
            )
        }),
    ]
});

// Exposition des loggers
export { mainLogger, errorLogger  };
