import { CommandOptions } from "../../types";
import { EmbedBuilder } from "discord.js";
import {generateListeAvailableMatricule, generateLogMessage, sendRequest} from "../../functions/utilsFunctions";
import {errorLogger, mainLogger} from "../../logger";
import axios from "axios";
import {v4 as uuidv4} from "uuid";
// TODO ajouter handling error here
export default {
	data: {
		name: "available",
		description: "Liste les matricule disponnible.",

	},
	category: "etatMajor",
	cooldown: 10000,
	execute: async (client, interaction, args) => {
		const embedsList = new EmbedBuilder()
		let success = false;
		let statusRequest;
		let availableList;

		try{
			const response = await sendRequest("get", "stats/stats/matricules");
			const dataList: { LSPD: number[]; BCSO: number[] } = response;
			const lspdOrBsco = interaction.guild!.nameAcronym === "LSPD" ? dataList.LSPD : dataList.BCSO;
			availableList = generateListeAvailableMatricule(lspdOrBsco.filter(mat => mat !== null));

			embedsList.setColor("Random")
			embedsList.setTimestamp()
			embedsList.setFooter({
					text: `request by: ${interaction.user.username} #${interaction.guild!.nameAcronym}`,
					iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
				});
			success = true;
			statusRequest = response;
			const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
			mainLogger.info(logMessage);
		}catch (err:any) {
			success = false;
			if (axios.isAxiosError(err) && err.response) {
				embedsList.setFields({ name: "📛 - Erreur lors de la requette:", value: `${err.response.data.message}` });
				statusRequest = err.response.data.message;
				const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest + " - " + err.response.data.errorId + " error on API");
				mainLogger.warn(logMessage);
				embedsList.setFooter({text: `📍 errorId: ${ err.response.data.errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			} else {
				const errorId = uuidv4();
				errorLogger.error({ message: err.message, errorId });
				statusRequest = "❌ Pas de communication avec l'API";
				embedsList.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			}
		}finally {

			const desc = (`
 \`\`\`md
>  ★・・・・・・・★・・MATRICULE・・★・・・・・・・★		
\`\`\`		
#  \`🗃️ LISTE MATRICULE\` -  \`${interaction.guild!.nameAcronym.toUpperCase()}\`
\n
###  \`\`${JSON.stringify(availableList).split(",").join(" | ").slice(1, -1)}\`\`           
\`\`\`md
#  ★・・・・・・・★・・・・・・★・・・・・・・★ \`\`\`			            
`)


			embedsList.setDescription(success ? desc : statusRequest);
			await interaction.reply({ embeds: [embedsList] });

		}




	},
} satisfies CommandOptions;