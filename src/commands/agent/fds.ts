import { CommandOptions } from "../../types";
import axios from "axios";
import {ColorResolvable, EmbedBuilder} from "discord.js";
import dayjs from "dayjs";
import {generateLogMessage, sendRequest} from "../../functions/utilsFunctions";
import {config} from "../../config/config";
import {errorLogger, mainLogger} from "../../logger";
import {v4 as uuidv4} from "uuid";


export default {
	data: {
		name: "fds",
		description: "Prendre sa fin de service",

	},
	category: "agent",
	cooldown: 5000,
	execute: async (client, interaction, args) => {
		let statusRequest;
		let policeOn:string ;
		let policeOff:string ;
		let success = false;
		if (interaction.guild) {
			if (interaction.guild.nameAcronym.toUpperCase() === "LSPD") {
				policeOn = config.serviceOnOff.lspd.on
				policeOff = config.serviceOnOff.lspd.off
			} else if (interaction.guild.nameAcronym.toUpperCase() === "BCSO") {
				policeOn = config.serviceOnOff.bcso.on
				policeOff = config.serviceOnOff.bcso.off
			}
			const roleToApply = interaction.guild.roles.cache.find((r: any) => r.id === policeOff);
			const roleToRemove = interaction.guild.roles.cache.find((r: any) => r.id === policeOn);
			const date = new Date(Date.now());
			const body = {end: date, target: interaction.user.id};
			const embed = new EmbedBuilder()
				.setTitle("Fin de service")
				.setTimestamp()
				.setThumbnail(client.user?.displayAvatarURL({dynamic: true} as any) || "")
				.setFooter({
					text: `Request by: ${interaction.user.username}`,
					iconURL: interaction.user?.displayAvatarURL({dynamic: true} as any) || "",
				});

			try {
				const response = await sendRequest("post", "service/end", body);
				statusRequest  = response;
				success = true;
				const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
				mainLogger.info(logMessage);

			} catch (err:any) {
				success = false;
				if (axios.isAxiosError(err) && err.response) {
					statusRequest = err.response.data.message;
					const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
					mainLogger.warn(logMessage);

				} else {
					const errorId = uuidv4();
					errorLogger.error({ message: err.message, errorId });
					statusRequest = "Pas de communications avec la base de données";
					embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
				}
			} finally {
				embed.setDescription(`
- Agent: ${interaction.member} 👮
- service terminer a: \`\`🕗 ${dayjs(date).format("DD-MM-YYYY | HH:mm:ss")}\`\`  
- **status: \`\`${statusRequest}\`\`**
			`);
				embed.setColor(success ? config.colorState.success as ColorResolvable :config.colorState.error as ColorResolvable)

				if (interaction.member){
					//@ts-ignore
					await interaction.member.roles.add(roleToApply)
					//@ts-ignore
					await interaction.member.roles.remove(roleToRemove)
				}
				await interaction.reply({embeds: [embed]});
			}

		}
	},

} satisfies CommandOptions;