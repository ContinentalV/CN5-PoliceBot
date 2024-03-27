import {CommandOptions} from "../../types";
import {ColorResolvable, EmbedBuilder, GuildMemberRoleManager} from "discord.js";
import axios from "axios";
import {
	createProgressBar,
	formatterDate,
	generateLogMessage,
	minToHours,
	sendRequest
} from "../../functions/utilsFunctions";
import {config} from "../../config/config";
import {v4 as uuidv4} from "uuid";
import {errorLogger, mainLogger} from "../../logger";

export default {
	data: {
		name: "me",
		description: "Consultez son profil",

	},
	category: "agent",
	cooldown: 5000,
	execute: async (client, interaction, args) => {
		let statusRequest;
		let success = false;
		const me = interaction.user.id;
		const embed = new EmbedBuilder()
			.setTimestamp()
			.setThumbnail(client.user?.displayAvatarURL({ dynamic: true } as any) || "")
			.setFooter({
				text: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true } as any),
			})
			.setAuthor({
				name: `Profile de: ${interaction.user.globalName}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true } as any),
			})
			.setColor(config.colorState.info as ColorResolvable);
		try {
			const response = await sendRequest("get", `profile/${me}`);
			success = true;
			statusRequest = response?.message;
			const profileInfo = response.profileInfo;
			let percentage = (profileInfo.tempsTotalService / 690) * 100;
			const progressBar = createProgressBar(parseInt(percentage.toFixed(2)), 10);
			const matricule: string = profileInfo.matricule || "Pas de matricule";
			const salary = response.salary.toLocaleString("en-US", { style: "currency", currency: "USD" });
			let agentRole = "Unknown";
			if (interaction.member?.roles instanceof GuildMemberRoleManager) {
				agentRole = interaction.member.roles.highest.id;
			}

			const fieldsGeneralInfo: { name: string; value: string; inline: boolean } = {
				name: "\u200b",
				value: `
##  📍**Informaiton général:** 				
- Agent: <@&${agentRole}> - ${matricule}  ${interaction.member}
- First day: \`\`${formatterDate(profileInfo.dateJoin, "DD-MM-YYYY")}\`\`
- En service: ${!profileInfo.inService ? " \`\`🔴🔴\`\`  " : "\`\`🟢🟢\`\`"}
`.trim(),
				inline: false,
			};
			const fieldsWorkInfo: { name: string; value: string; inline: boolean } = {
				name: "\u200b ", value: `
##  📍** Information service:** 		
  - début: \`\`${formatterDate(profileInfo.dernierPDS, "DD-MM-YYYY | HH:mm:ss")}\`\`
  - Fin: \`\`${formatterDate(profileInfo.dernierFDS, "DD-MM-YYYY | HH:mm:ss")}\`\`
  - Temps service: \`\`${minToHours(profileInfo.serviceTime)}\`\` 
 
				`, inline: false,
			};
			const fieldsResumeInfo: { name: string; value: string; inline: boolean } = {
				name: "\u200b", value: `##  📍**Résumé de la semaine:**\n
\`\`Quota %\`\`:  ${progressBar} 				 
\`\`\`md
 - Total service: ${minToHours(profileInfo.tempsTotalService)} 
 - Salaire estimé:${salary} 
\`\`\`				`, inline: true,
			};
			embed.addFields([fieldsGeneralInfo as any, fieldsWorkInfo as any, fieldsResumeInfo as any]);
			const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
			mainLogger.info(logMessage);
		}
		catch (err: any) {
			success = false;
			if (axios.isAxiosError(err) && err.response) {
				statusRequest = err.response.data.message + (" FROM API");
				const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
				mainLogger.warn(logMessage);
				embed.setFooter({text: `📍 errorId: ${err.response.data.errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			}
			else {
				const errorId = uuidv4();
				errorLogger.error({ message: err.message, errorId });
				statusRequest = "❌ Pas de communications avec l'API";
			}
			embed.addFields([]);
			embed.setColor(config.colorState.error as ColorResolvable);
		}
		finally {
			embed.addFields({ name: "📈 Status: ", value: ` \`\`${statusRequest} \`\`  `, inline: false } as any);
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}


	},

} satisfies CommandOptions;