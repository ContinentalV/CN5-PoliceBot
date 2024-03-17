import { CommandOptions } from "../../types";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { ClientEvents } from "discord.js";
// TODO mettrea jour la db pour agent grade quand on modifie des grade
// TODO Supprimer les entre de l'agent sur les nouvelle table creer ya pas longtemps

export default {


	data: {
		name: "emitters",
		description: "emit an event",
		options: [

			{
				type: ApplicationCommandOptionType.String,
				name: "params",
				description: "params for emitter",
				required: true,
				choices: [
					{ name: "MemberAdd", value: "guildMemberAdd" },
					{ name: "guildCreate", value: "guildCreate" },
					{ name: "MemberRemove", value: "guildMemberRemove" },
				],
			},

		],
	},
	category: "admin",
	cooldown: 5,
	execute: async (client, interaction, args) => {
		const { member, guild } = interaction;
		const query: string | null = args.getString("params", true);

		if (query === "guildCreate") {
			try {
				client.emit(query as keyof ClientEvents, guild as any);
			}
			catch (e) {
				console.error(e);
			}

		}
		else {
			try {
				client.emit(query as keyof ClientEvents, member as any);
			}
			catch (e) {
				console.error(e);
			}
		}


		await interaction.reply({ content: `test emit: ${query} sucessful` });


	},


} satisfies CommandOptions;