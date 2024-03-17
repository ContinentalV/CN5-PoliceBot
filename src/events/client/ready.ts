import { EventOptions } from "../../types";
import { ActivityType } from "discord.js";
import chalk from "chalk";
import axios, { AxiosError } from "axios";
import { monitorPerformance } from "../../functions/monitorFunctions";
import { logError } from "../../functions/chalkFn";
import { areObjectsEqual, monitorEventListeners, sendRequest } from "../../functions/utilsFunctions";
import Bot from "../../core/client";

export default {
	event: "ready",
	listener: async (client: Bot) => {
		console.log(chalk.yellowBright(`${client.user?.tag} is ready!`));

		await client.application?.commands.set(client.commands.map((command) => command.data));


		let currentActivity = 0;


		const fetchSafe = async (url: string, options: any = null): Promise<{
            success: boolean;
            data?: any;
            error?: string
        }> => {

			try {
				// const response = await axios.get(url, options);
				const response = await sendRequest("get", url, options);

				return { success: true, data: response };
			}
			catch (e) {
				if (e instanceof AxiosError) {
					return { success: false, error: e.message };
				}
				else if (e instanceof Error) {
					return { success: false, error: e.message };
				}
				else {
					return { success: false, error: "Une erreur est survenue" };
				}

			}

		};


		setTimeout(() => {
			const updatedActivity = async () => {
				const requests = [
					await fetchSafe("stats/stats/json/conti"),
					await fetchSafe("stats/stats/service?codeMetier=BCSO"),
					await fetchSafe("stats/stats/service?codeMetier=LSPD"),
				];

				const results = await Promise.allSettled(requests);
				const responses = results.map(result => {
					if (result.status === "fulfilled" && result.value.success) {
						return result.value.data;
					}
					else {
						// Gestion des erreurs ou valeurs par défaut
						return null; // Ou une valeur par défaut si nécessaire
					}
				});
				const playerCount = responses[0] ? `${responses[0].Data.clients} Citoyens en ville` : "Données citoyen indisponibles";
				const serviceBCSO = responses[1] ? `${responses[1].filter((a: {
                    inService: number
                }) => a.inService > 0).length} BCSO en service` : "Données indisponibles";
				const serviceLSPD = responses[2] ? `${responses[2].filter((a: {
                    inService: number
                }) => a.inService > 0).length} LSPD en service` : "Données indisponibles";


				const activities = [serviceBCSO, serviceLSPD, playerCount];
				const activity = activities[currentActivity % activities.length];
				client.user?.setActivity(activity, { type: ActivityType.Watching });
				currentActivity++;
			};

			setInterval(updatedActivity, 15000);
			updatedActivity();

			const body: {
                data?: any;
                time?: any;
                event?: any;
            } = {};

			let previousHealth: any = null;

			const sendHealthDataToApî = async () => {
				const currentHealthData = await monitorPerformance();
				const botHealth = {
					uptime: process.uptime(),
					isReady: client.isReady(),

				};
				const eventData = monitorEventListeners(client);

				// TODO FIX UPDATE COMMANDE QUI SE CLEAR PAS DASH BOT DISCORD REAL TIM UPDATE
				if (!areObjectsEqual(currentHealthData, previousHealth)) {

					previousHealth = currentHealthData;
					body.data = currentHealthData;
					body.time = botHealth;
					body.event = eventData;

					try {

						const response = await axios.post("http://localhost:8000/health/bot", body);
						console.log(response?.data?.message);
					}
					catch (e) {
						console.log(e);
					}
				}
				else {
					return logError("PAS DE CHANGEMENT");
				}

			};
			sendHealthDataToApî();
			setInterval(sendHealthDataToApî, 160000);
		}, 60000);


	},
} satisfies EventOptions<"ready">;

