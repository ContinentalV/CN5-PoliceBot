import chalk from "chalk";
import fs from "fs";
import path from "path";

// Assurez-vous que le chemin du dossier de logs existe
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
	fs.mkdirSync(logDirectory, { recursive: true });
}

// Définissez le chemin du fichier de logs
const logFilePath = path.join(logDirectory, "bot-logs.txt");

// Fonction pour écrire dans le fichier de logs
function writeToLogFile(message: string): void {
	const logMessage = `${message}\n`;
	fs.appendFile(logFilePath, logMessage, (err) => {
		if (err) {
			console.error("Erreur lors de l'écriture dans le fichier de logs", err);
		}
	});
}

// Fonction pour obtenir la date et l'heure formatées
function getTimestamp(): string {
	return new Date().toLocaleString();
}

// Fonction pour formater les objets
function formatObject(obj: Record<string, unknown>): string {
	return Object.entries(obj)
		.map(([key, value]) => `${chalk.blue(key)}: ${chalk.cyan(value)}`)
		.join(", ");
}

// Fonction de journalisation générique avec le niveau de log, le message, et éventuellement le nom de la commande
function logWithMetadata(level: "error" | "warn" | "info" | "response" | "object" | "number" | "commandCharged" | "eventCharged", message: string | number | Record<string, unknown>, commandOrEventName?: string): void {
	const timestamp = getTimestamp();
	let formattedMessage = `[${timestamp}]`;

	if (commandOrEventName) {
		formattedMessage += ` [${commandOrEventName}]`;
	}

	if (level === "response") {
		const responseMessage = typeof message === "object" ? JSON.stringify(message, null, 2) : message;
		formattedMessage += ` ${chalk.greenBright("API RESPONSE:")} ${responseMessage}`;
	}
	else {
		switch (level) {
		case "error":
			formattedMessage += ` ${chalk.red("ERROR:")} ${message}`;
			break;
		case "warn":
			formattedMessage += ` ${chalk.yellow("WARN:")} ${message}`;
			break;
		case "info":
			formattedMessage += ` ${chalk.blue("INFO:")} ${message}`;
			break;
		case "object":
			formattedMessage += ` ${formatObject(message as Record<string, unknown>)}`;

			break;
		case "number":
			formattedMessage += ` ${chalk.magenta(message.toString())}`;
			break;
		case "commandCharged":
			formattedMessage += ` ${chalk.magenta("COMMAND CHARGED:")} ${message}`;
			break;
		case "eventCharged":
			formattedMessage += ` ${chalk.cyan("EVENT CHARGED:")} ${message}`;
			break;
		}
	}

	console.log(formattedMessage);

	writeToLogFile(formattedMessage);
}

export const logError = (message: string, commandName?: string) => logWithMetadata("error", message, commandName);
export const logWarning = (message: string, commandName?: string) => logWithMetadata("warn", message, commandName);
export const logInfo = (message: string, commandName?: string) => logWithMetadata("info", message, commandName);
export const logApiResponse = (response: string, commandName?: string) => logWithMetadata("response", response, commandName);
export const logObject = (obj: Record<string, unknown>, commandName?: string) => logWithMetadata("object", obj, commandName);
export const logNumber = (number: number, commandName?: string) => logWithMetadata("number", number, commandName);
export const logCommandCharged = (message: string, commandName?: string) => logWithMetadata("commandCharged", message, commandName);
export const logEventCharged = (message: string, eventName?: string) => logWithMetadata("eventCharged", message, eventName);
