import { CommandOptions } from "../../types";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import {ColorResolvable, EmbedBuilder, MessageReaction, TextChannel, User} from "discord.js";
import { config } from "../../config/config";
import {collectReactionFunction, expressReplace, generateLogMessage} from "../../functions/utilsFunctions";
import { OperationText, reunionText, vacationText } from "../../functions/BCSOContentText";
import { OperationTextL, reunionTextL } from "../../functions/LSPDContentText";
import axios from "axios";
import {errorLogger, mainLogger} from "../../logger";
import {v4 as uuidv4} from "uuid";

export default {
	data: {
		name: "annonce",
		description: "Permet d'envoyer des annonces automatiques.",
		options: [
			{
				name: "selection-annonce",
				description: "Selectionnez quel annonce envoyer",
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{ name: "Réunion", value: "meeting" },
					{ name: "Opération", value: "OP" },
					{ name: "Vacation", value: "vacation" },
				],
			},
			{
				name: "date",
				description: "Indiquez la date",
				type: ApplicationCommandOptionType.String,
				required: true,
			},
			{
				name: "heure",
				description: "Indiquez l'heure",
				type: ApplicationCommandOptionType.Number,
				required: true,

			},
			{
				name: "min",
				description: "Indiquez les minutes",
				type: ApplicationCommandOptionType.String,
				required: true,

			},

		],

	},
	category: "etatMajor",
	cooldown: 5000,
	execute: async (client, interaction, args) => {

		const choiceAnnonce = args.getString("selection-annonce");
		const company = interaction.guild ? interaction.guild.nameAcronym : "no guilds";
		const date = args.getString("date");
		const time = args.getNumber("heure");
		const minute: string = args.getString("min") || "Pas de minute renseigner";
		const minuteString = typeof minute === "string" ? minute : "Pas de minute renseigner";
		let tag: string;
		const collectorFilter = (reaction: MessageReaction, user: User) => {
			return (reaction.emoji.name === "✅" && !user.bot) || (reaction.emoji.name === "❌" && !user.bot);
		};
		// TRAITEMENT DATA
		if (company === "BCSO") {
			let success = false;
			let statusRequest;
			const channel = interaction.guild!.channels.cache.get(config.channelsMsg.reunionB) || null;
			const logsChannel = interaction.guild!.channels.cache.get(config.channelsMsg.logsB) || null;
			tag = config.tagRole.bcso;
			const x = interaction.guild!.roles.cache.find((r) => r.id === tag);
			const embed = new EmbedBuilder()
				.setColor("Random")
				.setFooter({
					text: "Blaine Country Sheriff's Office",
					iconURL: client.user?.displayAvatarURL({ dynamic: true } as any),
				})
				.setTimestamp();

			if (choiceAnnonce === "meeting") {
				embed.setTitle("ANNONCE REUNION / REMISE DES PAYES / MONTEES EN GRADES");
				const dateNonNull = date ?? "Date non renseignée";
				// @ts-ignore
				embed.setDescription(expressReplace(reunionText, dateNonNull, time, minuteString));
				embed.setImage("https://media.discordapp.net/attachments/1147241672124674199/1190033545054396477/REU.jpg?ex=65b2c91a&is=65a0541a&hm=b0d0f183f2543847563433287beebe59d3e9ba6506664df9d16e8d160be9783a&=&format=webp");
				const annonce = await (channel as TextChannel).send({
					content: `${x}`,
					embeds: [embed],
					allowedMentions: { parse: ["everyone", "roles"] },
					fetchReply: true,} as any);


				try {
					await annonce.react("✅");
					await annonce.react("❌");
					const collector = annonce.createReactionCollector({
						filter: collectorFilter,
						time: 300_000,
						dispose: true,
					});
					await collectReactionFunction(collector, logsChannel, choiceAnnonce);
					success = true;
					statusRequest = "✅ Annonce envoyée avec succès";
					const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
					mainLogger.info(logMessage);}
				catch (err: any) {
						success = false
						const errorId = uuidv4();
						errorLogger.error({ message: err.message, errorId });
						statusRequest = "❌ Une erreur est survenue lors de l'envoie de l'annonce";
						embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});

				}
				finally {
					await interaction.reply({ content: success ? `**Annonce: ${choiceAnnonce}** - Envoyer dans ${channel}` : statusRequest });
				}
			}
			else if (choiceAnnonce === "OP") {
				embed.setTitle("ANNONCE OPÉRATION");
				// @ts-ignore
				embed.setDescription(expressReplace(OperationText, date, time, minute));
				embed.setImage("https://media.discordapp.net/attachments/740965773643612221/1198225867248238662/OP_BCSO.png?ex=65be21cc&is=65abaccc&hm=9cfc7c27d1d7e6a21b75d7ee1f684acb7f30d51d8db54e33c95f3bf67c520932&=&format=webp&quality=lossless&width=1440&height=525");


				try {
					const annonce = await (channel as TextChannel).send({
						content: `${x}`,
						embeds: [embed],
						allowedMentions: { parse: ["everyone", "roles"] },
						fetchReply: true,

					} as any);
					await annonce.react("✅");
					await annonce.react("❌");
					const collector = annonce.createReactionCollector({
						filter: collectorFilter,
						time: 300_000,
						dispose: true,
					});
					await collectReactionFunction(collector, logsChannel, choiceAnnonce);
					success = true;
					statusRequest = "✅ Annonce envoyée avec succès";
					const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
					mainLogger.info(logMessage);}
				catch (err: any) {
					success = false
					const errorId = uuidv4();
					errorLogger.error({ message: err.message, errorId });
					statusRequest = "❌ Une erreur est survenue lors de l'envoie de l'annonce";
					embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});

				}
				finally {
					await interaction.reply({ content: success ? `**Annonce: ${choiceAnnonce}** - Envoyer dans ${channel}` : statusRequest });
				}


			}
			else if (choiceAnnonce === "vacation") {
				embed.setTitle("ANNONCE VACATION");
				// @ts-ignore
				embed.setDescription(expressReplace(vacationText, date, time, minute));
				embed.setImage("https://media.discordapp.net/attachments/740965773643612221/1198225867768344636/VACA_BCSO.png?ex=65be21cc&is=65abaccc&hm=03fa9de109c758a60ce02a792d12b915544ebaa62099e78be8b2b1920bb5229c&=&format=webp&quality=lossless&width=1440&height=525");
				try {
					const annonce = await (channel as TextChannel).send({
						content: `${x}`,
						embeds: [embed],
						allowedMentions: { parse: ["everyone", "roles"] },
						fetchReply: true,
					} as any);
					await annonce.react("✅");
					await annonce.react("❌");
					const collector = annonce.createReactionCollector({
						filter: collectorFilter,
						time: 300_000,
						dispose: true,
					});
					await collectReactionFunction(collector, logsChannel, choiceAnnonce);
					success = true;
					statusRequest = "✅ Annonce envoyée avec succès";
					const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
					mainLogger.info(logMessage);}
				catch (err: any) {
					success = false
					const errorId = uuidv4();
					errorLogger.error({ message: err.message, errorId });
					statusRequest = "❌ Une erreur est survenue lors de l'envoie de l'annonce";
					embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});

				}
				finally {
					await interaction.reply({ content: success ? `**Annonce: ${choiceAnnonce}** - Envoyer dans ${channel}` : statusRequest });

				}
			}


		}
		else if (company === "LSPD") {
			let success = false;
			let statusRequest;
			// DATA BCSO
			const channel = interaction.guild ? interaction.guild.channels.cache.get(config.channelsMsg.reunionL) : null;
			const logsChannel = interaction.guild ? interaction.guild.channels.cache.get(config.channelsMsg.logsL) : null;
			tag =config.tagRole.lspd
			const x = interaction.guild!.roles.cache.find((r) => r.id === tag);
			const embed = new EmbedBuilder()
				.setColor("Random")
				.setFooter({
					text: "Los Santos Police Departement",
					iconURL: client.user?.displayAvatarURL({ dynamic: true } as any),
				})
				.setTimestamp();

			if (choiceAnnonce === "meeting") {
				embed.setTitle("ANNONCE REUNION / REMISE DES PAYES / MONTEES EN GRADES");
				// @ts-ignore
				embed.setDescription(expressReplace(reunionTextL, date, time, minute));
				embed.setImage("https://media.discordapp.net/attachments/855780885260795914/1197305739455234108/LSPD.jpg?ex=65bac8dd&is=65a853dd&hm=8bc2c9e5e2b7166eb48b73ee5bdd1cf2065f72f6534ec7423cf4d71d26a587f2&=&format=webp");
				const annonce = await (channel as TextChannel).send({
					content: `${x}`,
					embeds: [embed],
					allowedMentions: { parse: ["everyone", "roles"] },
					fetchReply: true,

				} as any);

				try {
					await annonce.react("✅");
					await annonce.react("❌");
					const collector = annonce.createReactionCollector({
						filter: collectorFilter,
						time: 300_000,
						dispose: true,
					});
					await collectReactionFunction(collector, logsChannel, choiceAnnonce);
					success = true;
					statusRequest = "✅ Annonce envoyée avec succès";
					const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
					mainLogger.info(logMessage);
				}
				catch (err: any) {
					success = false
					const errorId = uuidv4();
					errorLogger.error({ message: err.message, errorId });
					statusRequest = "❌ Une erreur est survenue lors de l'envoie de l'annonce";
					embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});

				}
				finally {
					await interaction.reply({ content: success ? `**Annonce: ${choiceAnnonce}** - Envoyer dans ${channel}` : statusRequest });

				}
			}
			else if (choiceAnnonce === "OP") {
				embed.setTitle("ANNONCE OPÉRATION");
				// @ts-ignore
				embed.setDescription(expressReplace(OperationTextL, date, time, minute));
				embed.setImage("https://media.discordapp.net/attachments/740965773643612221/1198225905764532314/OP_LSPD.png?ex=65be21d5&is=65abacd5&hm=ec551e501fb5462a1b606e5665c4351c6b2a9aa77712281d3fd4928830e1fb73&=&format=webp&quality=lossless&width=1440&height=525");

				try {
					const annonce = await (channel as TextChannel).send({
						content: `${x}`,
						embeds: [embed],
						allowedMentions: { parse: ["everyone", "roles"] },
						fetchReply: true,
					} as any);
					await annonce.react("✅");
					await annonce.react("❌");
					const collector = annonce.createReactionCollector({
						filter: collectorFilter,
						time: 300_000,
						dispose: true,
					});
					await collectReactionFunction(collector, logsChannel, choiceAnnonce);
					success = true;
					statusRequest = "✅ Annonce envoyée avec succès";
					const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
					mainLogger.info(logMessage);}
				catch (err: any) {
					success = false
					const errorId = uuidv4();
					errorLogger.error({ message: err.message, errorId });
					statusRequest = "❌ Une erreur est survenue lors de l'envoie de l'annonce";
					embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});

				}
				finally {
					await interaction.reply({ content: success ? `**Annonce: ${choiceAnnonce}** - Envoyer dans ${channel}` : statusRequest });
				}



			}
			else if (choiceAnnonce === "vacation") {
				embed.setTitle("ANNONCE VACATION");
				// @ts-ignore
				embed.setDescription(expressReplace(vacationText, date, time, minute));
				embed.setImage("https://media.discordapp.net/attachments/740965773643612221/1198225905189924904/VACA_LSPD.png?ex=65be21d5&is=65abacd5&hm=899a99e7c43aa4bf8d012f1cce853dd67ff0c7c8964616163ffdd4ce4f8321dd&=&format=webp&quality=lossless&width=1440&height=525");
				try {
					const annonce = await (channel as TextChannel).send({
						content: `${x}`,
						embeds: [embed],
						allowedMentions: { parse: ["everyone", "roles"] },
						fetchReply: true,
					} as any);
					await annonce.react("✅");
					await annonce.react("❌");
					const collector = annonce.createReactionCollector({
						filter: collectorFilter,
						time: 300_000,
						dispose: true,
					});
					await collectReactionFunction(collector, logsChannel, choiceAnnonce);
					success = true;
					statusRequest = "✅ Annonce envoyée avec succès";
					const logMessage = generateLogMessage(interaction.user.id, interaction.user.username, interaction.commandName, success, statusRequest);
					mainLogger.info(logMessage);}
				catch (err: any) {
					success = false
					const errorId = uuidv4();
					errorLogger.error({ message: err.message, errorId });
					statusRequest = "❌ Une erreur est survenue lors de l'envoie de l'annonce";
					embed.setFooter({text: `📍 errorId: ${errorId}`, iconURL: interaction.user?.displayAvatarURL({ dynamic: true } as any)});

				}
				finally {
					await interaction.reply({ content: success ? `**Annonce: ${choiceAnnonce}** - Envoyer dans ${channel}` : statusRequest });
				}
			}


		}
		else {
	await interaction.reply({embeds: [new EmbedBuilder().setTimestamp().setColor(config.colorState.error as ColorResolvable).setDescription(`   \`\`❌ Guild Inconnu => impossible d'envoyer l'annonce.  \`\`  `)] })
		}


	},

} satisfies CommandOptions;