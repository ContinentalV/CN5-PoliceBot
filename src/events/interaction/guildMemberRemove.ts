// guildMemberAdd.ts
import Bot from "../../core/client";
import { EventOptions } from "../../types";
import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { config } from "../../config/config";
import axios from "axios";
import { logError } from "../../functions/chalkFn";
import {generateLogMessage, generateLogMessageEvent, sendRequest} from "../../functions/utilsFunctions";
import {errorLogger, mainLogger} from "../../logger";
import {v4 as uuidv4} from "uuid";

// TODO peut etre devoir ajouter de mettre le role vu qu'il rejoint le serveur il en a pas.
export default {
	event: "guildMemberRemove",
	listener: async (client: Bot, member) => {
		const guild: Guild = member.guild;
		let statusRequest;
		let success = false;
		let channel: any;
		const idTarget: string = member.id;
		const embed: EmbedBuilder = new EmbedBuilder();
		if (guild.nameAcronym.toUpperCase() === "LSPD") {
			channel = guild.channels.cache.get(config.channel.logsMsgLSPD);
		}
		else if (guild.nameAcronym.toUpperCase() === "BCSO") {
			channel = guild.channels.cache.get(config.channel.logsMsgBCSO);
		}


		try {
			const response = await sendRequest("delete", `members/leave/${idTarget}`);
			const result = response;
			console.log(result);
			embed.setColor("Random");
			embed.setTimestamp();
			embed.setFooter({text:`L'agent | ${member.nickname ? member.nickname : member.user.username} | vient de quitté le serveur.`, iconURL: member.displayAvatarURL()})
			statusRequest = response;
			success = true;
			const logMessage = generateLogMessageEvent(client, member.user.username, member.id,  success,  statusRequest);
			mainLogger.info(logMessage);
		}
		catch (err:any) {
			if (axios.isAxiosError(err) && err.response) {

				const errorMessage = err.response.data.message;
				statusRequest = errorMessage;
				const logMessage = generateLogMessageEvent(client,  member.user.username, member.id,  success, statusRequest);
				mainLogger.warn(logMessage);
			}
			else {
				const errorId = uuidv4();
				errorLogger.error({ message: err.message, errorId });
				statusRequest = "❌ Pas de communications avec l'API";
				embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: client.user?.displayAvatarURL({ dynamic: true } as any)});

			}
		}
		finally {
			embed.setDescription(`${statusRequest}`);
			await (channel as TextChannel).send({ embeds: [embed], content: `${member}` });

		}


	},
} satisfies EventOptions<"guildMemberRemove">;
