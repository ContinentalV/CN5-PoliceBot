import { CommandOptions } from "../../types";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import axios, {AxiosError} from "axios";
import {ColorResolvable, EmbedBuilder, GuildMember} from "discord.js";
import {generateLogMessage, sendRequest} from "../../functions/utilsFunctions";
import {config} from "../../config/config";
import {errorLogger, mainLogger} from "../../logger";
import {v4 as uuidv4} from "uuid";

export default {
	data: {
		name: "matricule",
		description: "Change le matricule d'un agent",
		options: [
			{
				name: "number",
				description: "insere le matricule souhaité.",
				type: ApplicationCommandOptionType.Number,
				required: true,
			},
			{
				name: "agent",
				description: "Selectionne un agent",
				type: ApplicationCommandOptionType.User,
				required: true,
			},

		],
	},
	category: "etatMajor",
	cooldown: 5000,
	execute: async (client, interaction, args) => {
		const { guild, user, member } = interaction;
		const isUser = args.getUser("agent");
		const newMat = args.getNumber!("number");
		const target = isUser ? isUser.id : null;
		// @ts-ignore
		const guildMember = await guild!.members.fetch(target);
		let statusRequest;
		let success = false;
		const embed = new EmbedBuilder()

			.setTimestamp()
			.setColor("DarkGreen")
			.setFooter({
				text: `Request by: ${interaction.user.username}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
			});


		const body = { newMat, target };

		try {
			const response = await sendRequest("put", "members/matriculeUpdate", body);
			const currentNickname = guildMember.nickname || guildMember.user.username;
			const formattedMatricule = newMat! < 10 ? `0${newMat}` : `${newMat}`;
			const newNickname = currentNickname.replace(/\b\d{2,3}\b/, formattedMatricule);
			success = true;
			statusRequest = response.message;
			const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
			mainLogger.info(logMessage);
			await guildMember.setNickname(newNickname, "Mise à jour du matricule")
				.then(() => {
					embed.setFields({ name: "Nouveau pseudonyme: ", value: newNickname });
				})
				.catch((err:any) => {
					const errorId = uuidv4();
					errorLogger.error({ message: err.message, errorId });
					interaction.reply("❌ Erreur lors de la mise à jour du pseudonyme.");
				});

		}
		catch (err: AxiosError | any) {
			if (axios.isAxiosError(err) && err.response) {
				embed.setFields({ name: "📛 - Erreur lors de la requette:", value: `${err.response.data.message}` });
				statusRequest = err.response.data.message;
				const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest + " - " + err.response.data.errorId + " error on API");
				mainLogger.warn(logMessage);
				embed.setFooter({text: `📍 errorId: ${ err.response.data.errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			}
			else {
				const errorId = uuidv4();
				errorLogger.error({ message: err.message, errorId });
				statusRequest = "❌ Pas de communications avec l'API";
				embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});
			}
		}
		finally {
			if (!(!(interaction.member instanceof GuildMember) || interaction.member.partial)) {
				embed.setDescription(`
 \`\`\`diff
${success ? "+ " : "- " }★・・・・・・・★・・${success? "SUCCESS" :"ERROR" }・・★・・・・・・・★ \`\`\`				
- \`\`|📢| Commands:\`\`   \`\` /${interaction.commandName}  \`\`
- \`\`|👮| Agent:\`\`  \`\`${interaction.member.nickname}  \`\` - ${interaction.member}
- \`\`|🪪| DataCommand:\`\`   \`\` ${newMat} - ${target} \`\` - }
- \`\`|📡| Status:\`\`   \`\`${statusRequest}\`\`  

\`\`\`diff
${success ? "+ " : "- " }★・・・・・・・★・・・・・・・・★・・・・・・・★ \`\`\`				
			`)
			}
			embed.setColor(success ? config.colorState.success as ColorResolvable : config.colorState.error as ColorResolvable)
			await interaction.reply({ embeds: [embed] });
		}
	},

} satisfies CommandOptions;