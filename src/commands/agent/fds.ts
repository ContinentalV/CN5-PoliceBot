import { CommandOptions } from "../../types";
import { logApiResponse, logError } from "../../functions/chalkFn";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import dayjs from "dayjs";
import { sendRequest } from "../../functions/utilsFunctions";

export default {
	data: {
		name: "fds",
		description: "Prendre sa fin de service",

	},
	category: "agent",
	cooldown: 5000,
	execute: async (client, interaction, args) => {
		let statusRequest;
		const date = new Date(Date.now());
		const body = { end: date, target: interaction.user.id };
		const embed = new EmbedBuilder()
			.setTitle("Fin de service")

			.setTimestamp()
			.setColor("Random")
			.setThumbnail(client.user?.displayAvatarURL({ dynamic: true } as any) || "")
			.setFooter({
				text: `Request by: ${interaction.user.username}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any) || "",
			});

		try {
			const response = await sendRequest("post", "service/end", body);
			const data = response;
			logApiResponse(data);
			statusRequest = data;
		}
		catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				logError(err.response.data.message);
				statusRequest = err.response.data.message;
				embed.setColor("DarkRed");
			}
			else {
				logError("Une erreur inattendue est survenue");
				statusRequest = "Erreur inattendue";
				embed.setColor("DarkRed");


			}
		}
		finally {
			embed.setDescription(`
			- Agent: ${interaction.member}
			- service terminer a: \`\`${dayjs(date).format("DD-MM-YYYY | HH:mm:ss")}\`\`
			- **status: \`\`${statusRequest}\`\`**
			`);
			await interaction.reply({ embeds: [embed] });
		}


	},

} satisfies CommandOptions;