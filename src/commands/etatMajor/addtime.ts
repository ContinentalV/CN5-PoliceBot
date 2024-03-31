import {CommandOptions} from "../../types";
import {ApplicationCommandOptionType} from "discord-api-types/v10";
import {logApiResponse} from "../../functions/chalkFn";
import axios from "axios";
import {EmbedBuilder, ColorResolvable, GuildMember} from "discord.js";
import {generateLogMessage, sendRequest} from "../../functions/utilsFunctions";
import {errorLogger, mainLogger} from "../../logger";
import {config} from "../../config/config";
import {v4 as uuidv4} from "uuid";

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

		let success = false;
		let statusRequest
		const embed = new EmbedBuilder()
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
			const data = await sendRequest("put", "service/add", body);
			success = true;
			statusRequest = data.message;
			const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
			mainLogger.info(logMessage);

			embed.setFields({
				name: "Mise a jour des heures pour l'agent: ",
				value: `${args.getUser("agent")}\n\`\`${data.message}\`\` `,
			});


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
- \`\`|🪪| DataCommand:\`\`   \`\` ${body.temps} - ${body.targetId} - ${body.mode} \`\` - ${args.getUser("agent")}
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