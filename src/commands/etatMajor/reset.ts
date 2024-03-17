import { CommandOptions } from "../../types";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { logApiResponse, logInfo } from "../../functions/chalkFn";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { sendRequest } from "../../functions/utilsFunctions";

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

		if (args.getString("confirmation") === "no") {
			await interaction.reply({ content: "Reset annuler ✅" });
			return;
		}
		const company = interaction.guild!.nameAcronym.toUpperCase();
		const embed = new EmbedBuilder()
			.setDescription(`> \`\`Les data des services ${company} ont bien été rénitialiser: ✅\`\` `)
			.setColor("Random")
			.setTimestamp()
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
			});


		try {
			const body = { company: company };
			logInfo(company);
			const response = await sendRequest("post", "service/resetAll", body);
			const data = response.data;
			logApiResponse(data.message);
		}
		catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				embed.setFields({ name: "📛 - Erreur lors de la requette:", value: `${err}` });
			}
		}
		finally {
			await interaction.reply({ embeds: [embed] });
		}


	},

} satisfies CommandOptions;