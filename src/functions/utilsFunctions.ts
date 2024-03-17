import dayjs from "dayjs";
import axios, { AxiosResponse } from "axios";
import { logWarning } from "./chalkFn";
import Bot from "../core/client";

export const expressReplace = (content: string, date: string, time: string, min: string): string => {
	return content.replace("[DATE]", date).replace("[TIME]", time).replace("[MIN]", min);
};


export const saveLogsReact = async (reaction: any, user: any, mode: string, from: string): Promise<string | undefined> => {
	const date = Date.now();
	const userName = user.username;
	logWarning(from);

	if (mode === "collect") {
		if (reaction.emoji.name === "✅") {
			return ` \`\`[${dayjs(date).format("DD-MM-YYYY - HH:mm:ss")}] -[${from}] - L'agent: ${userName} - a validé sa présence a la réunion\`\` `;
		}
		else {
			return `\`\`[${dayjs(date).format("DD-MM-YYYY - HH:mm:ss")}] -[${from}] - L'agent: ${userName} - a indiquez qu'il ne serait pas présent a la réunion\`\` `;
		}
	}
	else if (mode === "remove") {
		if (reaction.emoji.name === "✅") {
			return `\`\`[${dayjs(date).format("DD-MM-YYYY - HH:mm:ss")}] -[${from}] - L'agent: ${userName} - a retirer sa reaction de présence a la réunion\`\` `;
		}
		else {
			return `\`\`[${dayjs(date).format("DD-MM-YYYY - HH:mm:ss")}] -[${from}] -  L'agent: ${userName} - a retirer ca reaction qui indiquait qu'il ne serait pas présent\`\``;
		}
	}
	else {
		return;
	}
};
export const collectReactionFunction = async (collector: any, chan: any, from: string): Promise<void> => {
	collector.on("collect", async (reaction: any, user: any) => {
		const logsToSend = await saveLogsReact(reaction, user, "collect", from);
		chan.send(`${logsToSend}`);

	});
	collector.on("remove", async (reaction: any, user: any) => {
		const logsToSend = await saveLogsReact(reaction, user, "remove", from);
		chan.send(`${logsToSend}`);

	});

	collector.on("end", (collected: any) => {
		console.log(`Collected ${collected.size} items`);
	});
};

export const IdSalaryRoleInit = {
	BCSO: [
		"1147211942818238489", // Sheriff
		"1147211942818238486", // Sheriff Adjoint
		"1147211942818238485", // Colonel
		"1147211942797262947", // Major
		"1162834027368165569", // Chief-Deputy
		"1147211942797262938", // Captain
		"1163531941891551362", // Lieutenant-Chef
		"1147211942780473351", // Lieutenant
		"1147211942780473345", // Sergaent-Chef
		"1147211942780473344", // Sergaent
		"1147211942759518316", // Senior Deputy
		"1147211942759518311", // Deputy III
		"1147211942759518310", // Deputy II
		"1147211942759518309", // Deputy I
		"1147211942742736905", // Deputy Trainee
	], LSPD: [
		"621715593032105985", // Commandant
		"628421188796022794", // Capitaine
		"665872607534383109", // Chef
		"765331738804092929", // Chef-adjoint
		"680221494604988437", // Inspecteur-interne
		"671801929910976513", // Inspecteur
		"924423493695733821", // Inspecteur-Adjoint
		"628420954061537290", // Lieutenant
		"924422016902238279", // Sergent-Chef
		"621715823567962132", // Sergent
		"1147969471672229978", // SLO
		"924420875183329321", // Officier-II
		"621716188363227136", // Officier
		"924419872329465926", // Sous-Officier
		"621716298598187008", // Cadet
	],
};

export function generateUniqueMatricule(existingMatricules: number[]): number | null {
	const maxMatricule = 99;
	const availableMatricules = Array.from({ length: maxMatricule }, (_, i) => i + 1)
		.reduce((acc, matricule) => {
			if (!existingMatricules.includes(matricule)) {
				acc.push(matricule);
			}
			return acc;
		}, [] as number[]);

	if (availableMatricules.length === 0) return null; // Si aucun matricule n'est disponible

	// Sélectionne un matricule aléatoire parmi les matricules disponibles
	const randomIndex = Math.floor(Math.random() * availableMatricules.length);
	return availableMatricules[randomIndex];
}


export const monitorEventListeners = (client: Bot) => {
	const eventNames = client.eventNames();
	const listenerData = eventNames.map(eventName => {
		const listeners = client.listeners(eventName);
		return {
			event: eventName,
			count: listeners.length, // Nombre de listeners pour cet événement
		};
	});

	return listenerData;
};

export function generateListeAvailableMatricule(existingMatricules: number[]): number[] | null {
	const maxMatricule = 99;
	const availableMatricules = Array.from({ length: maxMatricule }, (_, i) => i + 1)
		.reduce((acc, matricule) => {
			if (!existingMatricules.includes(matricule)) {
				acc.push(matricule);
			}
			return acc;
		}, [] as number[]);

	return availableMatricules;
}

// @ts-ignore
export const areObjectsEqual = (objA, objB) => {
	if (objA === null || objA === undefined) return console.log("empty data");
	if (objB === null || objB === undefined) return console.log("empty data");
	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) {
		return false;
	}

	for (const key of keysA) {
		if (objA[key] !== objB[key]) {
			return false;
		}
	}

	return true;
};

export function getInitials(name: string): string {
	return name.split("")
		.map(word => word[0])
		.join("");
}

// TODO HERE CI PROBLEME EXTRACT MATRICULE
export function extractMatricule(username: string): number | null {
	const matriculeMatch = username.match(/\d+/);
	if (matriculeMatch === null) {
		return null;
	}
	return parseInt(matriculeMatch[0], 10);
}


export const formatterDate = (dateToFormat: string | number, format: string): string => {
	const dateFormated = dayjs(dateToFormat).format(format);
	return dateFormated;
};
export const minToHours = (minutes: number) => {
	if (minutes >= 60) {
		const hours = Math.floor(minutes / 60);
		const minute = minutes % 60;
		return `${hours} H ${minute} Min`;
	}
	else {
		return `${minutes} Min`;
	}
};
export const jsonData = async (): Promise<{ data: any, playerCount: any }> => {

	try {
		const response = await axios("https://servers-frontend.fivem.net/api/servers/single/eazypm", {
			headers: {
				"Host": "servers-frontend.fivem.net",
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0",
				"Accept": "application/json, text/plain, */*",
				"Origin": "https://servers.fivem.net/",
				"DNT": "1",
				"Connection": "keep-alive",
				"Alt-Used": "servers-frontend.fivem.net",
				"Sec-Fetch-Dest": "Document",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Site": "none",
				"Pragma": "no-cache",
				"Upgrade-Insecure-Requests": "1",
				"Cache-Control": "no-cache",
				"TE": "trailers",
			},
		});
		return { data: response.data.Data.players, playerCount: response.data.Data.clients };
	}
	catch (e) {
		throw e;
	}


};

export const sendRequest = async (method: string, route: string, data?: any): Promise<any> => {
	let response: AxiosResponse;
	const baseRoute = "http://vibrant-darwin.37-60-246-29.plesk.page:8000/";
	const trueRoute = baseRoute + route;
	axios.defaults.withCredentials = true;
	const headers = {
		"Authorization": `Bearer ${process.env.TOKEN}`, // Assurez-vous que BOT_TOKEN est défini dans vos variables d'environnement
	};

	const config = {
		headers: headers,
		data: data ? data : undefined,
	};

	try {
		switch (method.toLowerCase()) {
		case "get":
			response = await axios.get(trueRoute, { headers: headers });

			break;
		case "post":
			response = await axios.post(trueRoute, data, { headers: headers });
			break;
		case "put":
			response = await axios.put(trueRoute, data, { headers: headers });
			break;
		case "delete":
			// Pour une requête DELETE, axios attend la configuration en deuxième argument
			response = await axios.delete(trueRoute, config);
			break;
		case "patch":
			response = await axios.patch(trueRoute, data, { headers: headers });
			break;
		default:
			throw new Error("Invalid HTTP method");
		}

		return response.data;
	}
	catch (error) {
		console.error(`Error ${method.toUpperCase()}ing data:`, error);
		throw error;
	}
};