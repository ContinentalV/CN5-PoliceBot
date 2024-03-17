import { CommandOptions } from "../../types";
import { logApiResponse, logError } from "../../functions/chalkFn";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import dayjs from "dayjs";
import { sendRequest } from "../../functions/utilsFunctions";

export default {
	data: {
		name: "pds",
		description: "Prendre son service",

	},
	category: "agent",
	cooldown: 5000,
	execute: async (client, interaction, args) => {
		let statusRequest;
		const date = new Date(Date.now());
		const body = { start: date, target: interaction.user.id };
		const embed = new EmbedBuilder()
			.setTitle("Prise de service")

			.setTimestamp()
			.setColor("Random")
			.setThumbnail(client.user?.displayAvatarURL({ dynamic: true } as any) || "")
			.setFooter({
				text: `Request by: ${interaction.user.username}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
			});

		try {
			const response = await sendRequest("post", "service/start", body);
			const data = response;
			logApiResponse(data);
			statusRequest = data;
		}
		catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				const errorMessage = err.response.data.message;
				logError(errorMessage);
				statusRequest = errorMessage;
				embed.setColor("DarkRed");
			}
			else {
				console.log(err); // Loguer l'erreur complète pour le débogage
				logError("Une erreur inattendue est survenue");
				statusRequest = "Erreur inattendue";
				embed.setColor("DarkRed");
			}
		}
		finally {
			embed.setDescription(`
			- Agent: ${interaction.member}
			- service start a: \`\`${dayjs(date).format("DD-MM-YYYY | HH:mm:ss")}\`\`
			- **status: \`\`${statusRequest}\`\`**
			`);
			await interaction.reply({ embeds: [embed] });
		}


	},

} satisfies CommandOptions;