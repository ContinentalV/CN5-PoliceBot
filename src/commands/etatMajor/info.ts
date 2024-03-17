import { CommandOptions } from "../../types";
import { formatterDate, sendRequest } from "../../functions/utilsFunctions";
import { EmbedBuilder } from "discord.js";

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
		const company = interaction.guild!.nameAcronym;
		const embed = new EmbedBuilder()
			.setColor("Random")
			.setDescription("Resumer des agent en service: ")
			.setTimestamp()
			.setFooter({
				text: `Request by ${interaction.user.username}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
			});


		try {
			const response = await sendRequest("get", `stats/stats/service?codeMetier=${company}`);
			const data = response;

			const dataFilered = data.map((agent: AgentData) => agent).filter((agent: AgentData) => ((agent.codeMetier === company) && (agent.inService === 1)));

			const fieldsAgent = dataFilered.map((agent: AgentData) => {
				const name = agent.username;
				const enService = agent.inService !== null && agent.inService === 1 ? "🟢🟢" : "🔴🔴";

				const lastpdsstart = agent.dernierPDS ?? 0;

				return {
					name: `\u200b👮 ${name}`, value: `
					
> service: \`\`${enService}\`\`
${enService ? `> \`\`${formatterDate(lastpdsstart, "DD-MM-YYYY")}\`\`     ` : ""}
${enService ? `> \`\`${formatterDate(lastpdsstart, "HH:mm:ss")}\`\`     ` : ""}
 <@${agent.discordId}>
\u200b
`, inline: true,
				};
			});


			if (fieldsAgent.length > 20) {
				embed.addFields(fieldsAgent.slice(0, 20)) && embed.setDescription("Resumer des agent en service. Plus de 20 agents en service, l'affichage ne pourra en afficher que 20.");

			}
			embed.addFields(fieldsAgent);

		}
		catch (e) {
			if (e instanceof Error) {
				console.log(e);
				embed.setDescription(`${e.message}`);
			}
			else {
				console.log(e);
				embed.setDescription("Une erreur est survenue");
			}

		}
		finally {

			await interaction.reply({ embeds: [embed] });
		}
		return;


	},

} satisfies CommandOptions;