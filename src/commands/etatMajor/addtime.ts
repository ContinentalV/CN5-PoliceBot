import { CommandOptions } from "../../types";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { logApiResponse } from "../../functions/chalkFn";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { sendRequest } from "../../functions/utilsFunctions";

export default {
	data: {
		name: "change-time",
		description: "Rajouter du temps sur le service d'un employer! (en minute) ",
		options: [
			{
				name: "temps",
				description: "Indiquez le temps en minute",
				type: ApplicationCommandOptionType.Number,
				required: true,
			},
			{
				name: "agent",
				description: "Indiquez l'agent concerner",
				type: ApplicationCommandOptionType.User,
				required: true,
			},
			{
				name: "mode",
				description: "Indiquez si vous voulez retirer ou ajouter",
				type: ApplicationCommandOptionType.String,
				choices: [
					{ name: "ajout", value: "add" },
					{ name: "retrait", value: "remove" },
				],
				required: true,
			},
		],

	},
	category: "etatMajor",
	cooldown: 5000,
	execute: async (client, interaction, args) => {

		const embed = new EmbedBuilder()
			.setColor("Random")
			.setTimestamp()
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true } as any),
			});
		const user = args.getUser("agent");
		const targetId = user ? user.id : null;

		const body = {
			temps: args.getNumber("temps"),
			targetId: targetId,
			mode: args.getString("mode"),
		};

		try {
			const response = await sendRequest("put", "service/add", body);
			const data = response;
			embed.setFields({
				name: "Mise a jour des heures pour l'agent: ",
				value: `${args.getUser("agent")}\n\`\`${data.message}\`\` `,
			});
			logApiResponse(data.message);
		}
		catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				embed.setFields({ name: "📛 - Erreur lors de la requette:", value: `${err.response.data.message}` });
			}
		}
		finally {
			await interaction.reply({ embeds: [embed] });
		}


	},

} satisfies CommandOptions;