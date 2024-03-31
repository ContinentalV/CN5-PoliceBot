import {CommandOptions} from "../../types";
import {ApplicationCommandOptionType} from "discord-api-types/v10";
import axios from "axios";
import {ColorResolvable, EmbedBuilder} from "discord.js";
import {generateLogMessage, sendRequest} from "../../functions/utilsFunctions";
import {config} from "../../config/config";
import {errorLogger, mainLogger} from "../../logger";
import {v4 as uuidv4} from "uuid";

export default {
	data: {
		name: "reset",
		description: "Reset les heures de services. ",
		options: [
			{
				name: "confirmation",
				description: "Confirmez le reset",
				type: ApplicationCommandOptionType.String,
				choices: [
					{ name: "OUI", value: "yes" },
					{ name: "NON", value: "no" },
				],
				required: true,
			},


		],

	},
	category: "etatMajor",
	cooldown: 5000,
	execute: async (client, interaction, args): Promise<void> => {
	let statusRequest;
	let success = false;
		if (args.getString("confirmation") === "no") {
			await interaction.reply({ content: "Reset annuler ✅" });
			return;
		}
		const company = interaction.guild!.nameAcronym.toUpperCase();
		const embed = new EmbedBuilder()

			.setTimestamp()
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
			});


		try {
			const body = { company: company };
			statusRequest = await sendRequest("post", "service/resetAll", body);
			success = true;
			const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
			mainLogger.info(logMessage);
		}
		catch (err:any) {
			if (axios.isAxiosError(err) && err.response) {
				statusRequest = err.response.data.message;
				const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
				mainLogger.warn(logMessage);
			}else {
				const errorId = uuidv4();
				errorLogger.error({ message: err.message, errorId });
				statusRequest = "❌ Pas de communications avec l'API";
				embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			}
		}
		finally {
			embed.setColor(success? config.colorState.success as ColorResolvable : config.colorState.error as ColorResolvable)
		 	embed.setDescription(`## Reset des heures de services \n\n \`\`${success ? statusRequest.message :  statusRequest}\`\``)
			await interaction.reply({ embeds: [embed] });
		}


	},

} satisfies CommandOptions;