import { CommandOptions } from "../../types";
import { EmbedBuilder } from "discord.js";
import { generateListeAvailableMatricule, sendRequest } from "../../functions/utilsFunctions";
// TODO ajouter handling error here
export default {
	data: {
		name: "available",
		description: "Liste les matricule disponnible.",

	},
	category: "etatMajor",
	cooldown: 10000,
	execute: async (client, interaction, args) => {

		// const response = await axios.get("http://localhost:8000/stats/stats/matricules", { headers: { "Authorization": `Bearer ${process.env.TOKEN}` } });
		const response = await sendRequest("get", "stats/stats/matricules");
		const dataList: { LSPD: number[]; BCSO: number[] } = response;


		const lspdOrBsco = interaction.guild!.nameAcronym === "LSPD" ? dataList.LSPD : dataList.BCSO;
		const availableList = generateListeAvailableMatricule(lspdOrBsco.filter(mat => mat !== null));
		console.log(availableList);


		const embedsList = new EmbedBuilder()
			.setDescription(`
            **Voici la liste des matricules disponnible pour la ${interaction.guild!.nameAcronym}:**
            ----------------------------------
            ${JSON.stringify(availableList).split(",").join(" | ").slice(1, -1)}
		`)
			.setColor("Random")
			.setTimestamp()
			.setFooter({
				text: `request by: ${interaction.user.username} #${interaction.guild!.nameAcronym}`,
				iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
			});


		await interaction.reply({ embeds: [embedsList] });

	},
} satisfies CommandOptions;