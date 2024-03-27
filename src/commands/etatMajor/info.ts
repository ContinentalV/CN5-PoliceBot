import {CommandOptions} from "../../types";
import {formatterDate, generateLogMessage, sendRequest} from "../../functions/utilsFunctions";
import {ColorResolvable, EmbedBuilder} from "discord.js";
import {config} from "../../config/config";
import {errorLogger, mainLogger} from "../../logger";
import axios from "axios";
import {v4 as uuidv4} from "uuid";

interface AgentData {
    discordId: string;
    username: string;
    nomRP: string;
    avatar: string;
    codeMetier: string;
    dateJoin: string;
    matricule: number;
    dernierPDS: number | null; // Ou ajustez le type selon vos besoins
    inService: number;
    tempsTotalService: number;
}

export default {
	data: {
		name: "informations",
		description: "Consultez les information relative a votre Agence",

	},
	category: "etatMajor",
	cooldown: 5000,
	execute: async (client, interaction, args): Promise<void> => {
		let success = false;
		let statusRequest;
		const company = interaction.guild!.nameAcronym;
		const embed = new EmbedBuilder()

			.setTimestamp()
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
			});


		try {
			const response = await sendRequest("get", `stats/stats/service?codeMetier=${company}`);
			const dataFilered = response.map((agent: AgentData) => agent).filter((agent: AgentData) => ((agent.codeMetier === company) && (agent.inService === 1)));
			const fieldsAgent = dataFilered.map((agent: AgentData) => {
				const enService = agent.inService !== null && agent.inService === 1 ? "🟢🟢" : "🔴🔴";
				const lastpdsstart = agent.dernierPDS ?? 0;

				return {
					name: `\u200b`, value: `
\`\`Agent: 👮\`\` <@${agent.discordId}>					
\`\`🔋En service: \`\` \`\`${enService}\`\`
${enService ? ` \`\`📍 Date\`\` \`\`${formatterDate(lastpdsstart, "DD-MM-YYYY")}\`\`     ` : ""}
${enService ? ` \`\`⏱️Heure\`\`  \`\`${formatterDate(lastpdsstart, "HH:mm:ss")}\`\`     ` : ""}
 
\u200b
`, inline: true,
				};
			});
			if (fieldsAgent.length > 25) {
				embed.addFields(fieldsAgent.slice(0, 24))
				embed.setDescription("Resumer des agent en service. Plus de 20 agents en service, l'affichage ne pourra en afficher que 20.");
			}else {
				embed.addFields(fieldsAgent);
			}
			success = true;
			statusRequest = dataFilered.length > 0 ? `## \`👮 Il y a actuellement: ${dataFilered.length} agent ${company} en service\` ` : "## \`🪫Aucun agent en service\`";
			const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
			mainLogger.info(logMessage);

		}
		catch (err: any) {
			success = false;
			if (axios.isAxiosError(err) && err.response) {
				embed.setFields({ name: "📛 - Erreur lors de la requette:", value: `${err.response.data.message}` });
				statusRequest = err.response.data.message;
				const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest + " - " + err.response.data.errorId + " error on API");
				mainLogger.warn(logMessage);
				embed.setFooter({text: `📍 errorId: ${ err.response.data.errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			} else {
				const errorId = uuidv4();
				errorLogger.error({ message: err.message, errorId });
				statusRequest = "❌ Pas de communications avec l'AP";
				embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			}
		}
		finally {
			embed.setColor(success ? config.colorState.info as ColorResolvable : config.colorState.error as ColorResolvable)
			embed.setDescription(statusRequest);
			await interaction.reply({ embeds: [embed] });
		}
		return;


	},

} satisfies CommandOptions;