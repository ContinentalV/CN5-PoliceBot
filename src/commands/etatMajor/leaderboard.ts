import {AgentData, CommandOptions} from "../../types";
import { logInfo } from "../../functions/chalkFn";
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	GuildMember,
} from "discord.js";
import {formatterDate, generateLogMessage, minToHours, sendRequest} from "../../functions/utilsFunctions";
import { config } from "../../config/config";
import {errorLogger, mainLogger} from "../../logger";
import axios from "axios";
import {v4 as uuidv4} from "uuid";




export default {
	data: {
		name: "leaderboards",
		description: "Consultez les information relative au agents, heures, payes..",
		options: [
			{
				name: "cr-logs",
				description: "Confirmer pour avoir le logs",
				type: ApplicationCommandOptionType.String,
				choices: [
					{
						name: "OUI", value: "cr-logs",

					},
				],
			},
		],

	},
	category: "etatMajor",
	cooldown: 5000,
	execute: async (client, interaction, args) => {
		const row = new ActionRowBuilder();
		let logs: AgentData[] = [];
		let success = false;
		let statusRequest;

		const company = interaction.guild!.nameAcronym;

		const embed = new EmbedBuilder()
			.setColor("Random")
			.setTimestamp()
			.setDescription("**👮 Liste des quotas non remplis sur la derniere page.**")
			.setTitle("FICHE SALARIALE GLOBAL");


		try {
			// Data traitement
			const response = await sendRequest("get", `profile/p/leaderboards?codeMetier=${company}`);
			const data: AgentData[] = response.dataAll;
			data.sort((a, b) => {
				return b.tempsTotalService - a.tempsTotalService;
			});
			logs = data;
			const noHoursQuota = data.filter((agent) => agent.tempsTotalService <= 690).map((agent) => `- 🔴 **Quota non remplis** <@${agent.discordId}> \`\`Nombre d'heure: ${minToHours(agent.tempsTotalService)}\`\``).join("\n");
			 let securityLength = 4000;
			 console.log(noHoursQuota)
			// pagination setup
			const itemPerPage = 6;
			const numberOfPage = Math.ceil(data.length / itemPerPage);
			let current = 0;

			const updatedEmbed = (page: number) => {
				const start = page * itemPerPage;
				const end = start + itemPerPage;
				const fieldsAgent = data.slice(start, end).map((agent) => {
					const trueName = agent.username;
					const nomRP = agent.nomRP;
					const mat = agent.matricule;
					const firstDay = agent.dateJoin;
					const salary = agent.salary;
					const worktime = agent.tempsTotalService;
					const enService = agent.inService ? "🟢🟢" : "🔴🔴";
					const lastpdsstart = agent.dernierPDS;
					return {
						name: `\u200b👮 ${nomRP} - ${trueName} - ${mat}`, value: `
					
- First Day: \`\`${formatterDate(firstDay, "DD-MM-YYYY")}\`\`					
- Service: \`\`${enService}\`\`
- H:\`\`${minToHours(worktime)}\`\`
- S:\`\`${salary.toLocaleString("en-US", { style: "currency", currency: "USD" })}\`\`
\`\`\`
- ${lastpdsstart !== null ? `${formatterDate(lastpdsstart, "DD-MM-YYYY")}` : "no pds"}
- ${lastpdsstart !== null ? `${formatterDate(lastpdsstart, "HH:mm:ss")}` : "no pds"}
\`\`\`
<@${agent.discordId}>
\u200b
`, inline: true,
					};
				});
				embed.setFields(fieldsAgent);
				embed.setFooter({
					text: `Request by ${interaction.user.username} - Page ${current + 1} sur ${numberOfPage}`,
					iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any),
				});
			};
			updatedEmbed(0);
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`previous:${current}`)
					.setLabel("Precedent")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(current === 0),
				new ButtonBuilder()
					.setCustomId(`next:${current}`)
					.setLabel("Next")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(current === numberOfPage - 1),
			);
			// @ts-ignore
			const ListEmbed = await interaction.reply({ embeds: [embed], components: [row] });
			const collector = ListEmbed.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 3_600_000,
			});


			// Handling button interaction.
			collector.on("collect", async (i) => {

				console.log("Button clicked:", i.customId);
				const [buttonType, buttonPage] = i.customId.split(":");


				if (buttonType === "previous" && current > 0) {
					current = parseInt(buttonPage) - 1;
				}
				else if (buttonType === "next" && current < numberOfPage - 1) {
					current = parseInt(buttonPage) + 1;
				}
				// @ts-ignore
				updatedEmbed(current);
				// @ts-ignore
				row.components[0].setCustomId(`previous:${current}`);
				// @ts-ignore
				row.components[0].setDisabled(current === 0);
				row.components[1].setCustomId(`next:${current}`);
				// @ts-ignore
				row.components[1].setDisabled(current === numberOfPage - 1);
				if ((current === numberOfPage - 1) && (noHoursQuota.length > 0)) embed.setDescription(`${noHoursQuota}`);
				if ((current === numberOfPage - 1) && (noHoursQuota.length <= 0)) embed.setDescription("# 👮 Tous les officier ont bien réaliser leur quota: ✅");
				if ((current !== numberOfPage - 1)) embed.setDescription(null);
				// @ts-ignore
				await i.update({ embeds: [embed], components: [row] });
			});

			collector.on("end", collected => logInfo(`Collected ${collected.size} interactions.`));
			success = true;
			statusRequest = data;
			const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
			mainLogger.info(logMessage);
		}
		catch (err:any) {
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
			if (config.permWL.sherif === interaction.user.id) {
				const matMap = logs.filter((agent) => agent.salary !== 0).map((agent) => agent.matricule + "          " + agent.salary.toLocaleString("en-US", {
					style: "currency",
					currency: "USD",
				}));
				const totalSalary = logs.reduce((total, agent) => {
					if (agent.salary !== 0) {
						return total + agent.salary;
					}
					return total;
				}, 0);
				const tauxTva = 0.20;
				const montantTva = totalSalary * tauxTva;
				const totalTTC = totalSalary + montantTva;
				if (args.getString("cr-logs") !== "cr-logs" || args.getString("cr-logs") === null) return;
				const content = `
\`\`\` 
--------------------------- 
Matricule  |   SALARY
---------------------------
${matMap.join("\n")} 
------------   TOTAL
hors taxes: ${totalSalary.toLocaleString("en-US", { style: "currency", currency: "USD" })}
Montant TVA: ${montantTva.toLocaleString("en-US", { style: "currency", currency: "USD" })}	
Total TTC: ${totalTTC.toLocaleString("en-US", { style: "currency", currency: "USD" })}		 
\`\`\`
`;
				if (interaction.member instanceof GuildMember) {
					const member = interaction.member!;
					await member.send({ embeds: [new EmbedBuilder().setDescription(content)] });
				}
			}
		}

	},

} satisfies CommandOptions;