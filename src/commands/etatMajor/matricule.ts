import { CommandOptions } from "../../types";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { logApiResponse, logError } from "../../functions/chalkFn";
import axios from "axios";
import { EmbedBuilder } from "discord.js";
import { sendRequest } from "../../functions/utilsFunctions";
// TODO AJOUTER QUE SI LE MAT EST DIFFERENT DE BDD ON MET A JOUR PSEUDO DISCORD AVEC NEW MAT
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
		const embed = new EmbedBuilder()
			.setDescription(`Mise a jour de l'agent: <@${target}>`)
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
			logApiResponse(response);
			statusRequest = response.message;
			await guildMember.setNickname(newNickname, "Mise à jour du matricule")
				.then(() => {
					embed.setFields({ name: "Nouveau pseudonyme: ", value: newNickname });
				})
				.catch(err => {
					logError("Erreur lors de la mise à jour du pseudonyme:", err);
					interaction.reply("Erreur lors de la mise à jour du pseudonyme.");
				});

		}
		catch (err) {
			if (axios.isAxiosError(err) && err.response) {
				logError(err.response.data.message);
				statusRequest = err.response.data.message;
				embed.setColor("DarkRed");
				embed.setFields({ name: "Nouveau pseudonyme: ", value: `${err.response.data.message}` });


			}
			else {
				statusRequest = "Erreur inattendue";
				embed.setColor("DarkRed");

			}
		}
		finally {
			await interaction.reply({ embeds: [embed] });


		}


	},

} satisfies CommandOptions;