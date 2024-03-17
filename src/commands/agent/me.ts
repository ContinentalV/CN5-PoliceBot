import { CommandOptions } from "../../types";
import { EmbedBuilder, GuildMemberRoleManager } from "discord.js";
import axios from "axios";
import { logApiResponse, logError } from "../../functions/chalkFn";
import { formatterDate, minToHours, sendRequest } from "../../functions/utilsFunctions";

export default {
	data: {
		name: "me",
		description: "Consultez son profil",

	},
	category: "agent",
	cooldown: 5000,
	execute: async (client, interaction, args) => {
		let statusRequest;
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
			.setColor("Random");


		try {
			const response = await sendRequest("get", `profile/${me}`);
			const dataState = response?.message;
			const profileInfo = response.profileInfo;
			console.log(profileInfo);
			const matricule: string = profileInfo.matricule || "Pas de matricule";

			const salary = response.salary.toLocaleString("en-US", { style: "currency", currency: "USD" });
			console.log(salary);
			logApiResponse(dataState);
			let agentRole = "Unknown";
			if (interaction.member?.roles instanceof GuildMemberRoleManager) {
				agentRole = interaction.member.roles.highest.id;
			}

			const fieldsGeneralInfo: { name: string; value: string; inline: boolean } = {
				name: "Informaiton général: ",
				value: `
- Agent: <@&${agentRole}> - ${matricule}  ${interaction.member}
- First day: \`\`${formatterDate(profileInfo.dateJoin, "DD-MM-YYYY")}\`\`
- En service: ${!profileInfo.inService ? " \`\`🔴🔴\`\`  " : "\`\`🟢🟢\`\`"}
`.trim(),
				inline: false,
			};
			const fieldsWorkInfo: { name: string; value: string; inline: boolean } = {
				name: "Information service: ", value: `
- **Derniere pds:**
 - début: \`\`${formatterDate(profileInfo.dernierPDS, "DD-MM-YYYY | HH:mm:ss")}\`\`
 - Fin: \`\`${formatterDate(profileInfo.dernierFDS, "DD-MM-YYYY | HH:mm:ss")}\`\`
 - Temps service: \`\`${minToHours(profileInfo.serviceTime)}\`\`
 
				`, inline: true,
			};
			const fieldsResumeInfo: { name: string; value: string; inline: boolean } = {
				name: "Résumé de la semaine: ", value: `
 - Total service: \`\`${minToHours(profileInfo.tempsTotalService)}\`\`
 - Salaire estimé:   \`\`${salary}\`\`
				`, inline: true,
			};
			embed.addFields([fieldsGeneralInfo as any, fieldsWorkInfo as any, fieldsResumeInfo as any]);


		}
		catch (err: any) {
			logError(err);
			if (axios.isAxiosError(err) && err.response) {
				statusRequest = err.response.data.message;
				embed.addFields([]);
				embed.setColor("DarkRed");
				embed.setDescription(statusRequest);
			}
		}
		finally {

			await interaction.reply({ embeds: [embed], ephemeral: true });
		}


	},

} satisfies CommandOptions;