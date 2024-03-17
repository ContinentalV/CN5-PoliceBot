// guildMemberAdd.ts
import Bot from "../../core/client";
import { EventOptions } from "../../types";
import { EmbedBuilder, Guild, TextChannel } from "discord.js";
import { config } from "../../config/config";
import axios from "axios";
import { logError } from "../../functions/chalkFn";
import { sendRequest } from "../../functions/utilsFunctions";

// TODO peut etre devoir ajouter de mettre le role vu qu'il rejoint le serveur il en a pas.
export default {
	event: "guildMemberRemove",
	listener: async (client: Bot, member) => {
		const guild: Guild = member.guild;
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
			embed.setThumbnail(member.displayAvatarURL());
			embed.setDescription(`L'agent ${member.nickname} - <@${idTarget}> - vient de quitté le serveur.  `);
		}
		catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				logError(err.response.data.message);
				embed.setColor("Red");
				embed.setDescription(`${err.response.data.message}`);


			}
			else {
				embed.setColor("Red");
				embed.setDescription("Une erreur est survenue pendant la requete de suppression de data.");

			}
		}
		finally {
			await (channel as TextChannel).send({ embeds: [embed] });

		}


	},
} satisfies EventOptions<"guildMemberRemove">;
