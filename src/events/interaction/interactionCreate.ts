import Bot from "../../core/client";
import { CommandOptions, EventOptions } from "../../types";
import {
	AutocompleteInteraction,
	Collection,
	CommandInteraction,
	CommandInteractionOptionResolver,
	inlineCode,
	InteractionType,
} from "discord.js";


type CommandStats = {
    command: string;
    totalTime: number;
    count: number;
    errorCount: number;
};

// Typage pour les informations de la guilde, y compris les statistiques des commandes
type GuildStats = {
    id: string;
    name: string;
    commands: Map<string, CommandStats>;
};

// Map globale pour stocker les statistiques par guilde
const guildStatsMap: Map<string, GuildStats> = new Map();


const guildInfo: GuildStats[] = [];
export default {
	event: "interactionCreate",
	listener: async (client, interaction) => {
		const startTime = process.hrtime.bigint();
		const guildId = interaction.guild?.id || "DM";
		const guildName = interaction.guild?.name || "Direct Message";
		guildInfo.push({ id: guildId, name: guildName, commands: new Map() });

		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = client.commands.get(interaction.commandName);
			console.log(interaction.commandName);
			if (!command) return;

			try {
				const cooldown = await handleCooldown(client, interaction, command);
				if (!cooldown) return;
				await command.execute(client, interaction, interaction.options as CommandInteractionOptionResolver);
				const endTime = process.hrtime.bigint();
				const respTime = Number(endTime - startTime) / 1_000_000;
				updateGuildCommandStats(guildId, guildName, interaction.commandName, respTime, false);

			}
			catch {
				updateGuildCommandStats(guildId, guildName, interaction.commandName, 0, true);
				return interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			}
		}
		else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			const command = client.commands.get(interaction.commandName) as CommandOptions & {
                autocomplete: (interaction: AutocompleteInteraction) => Promise<void>
            };

			if (!command) {
				console.error("Pas de commande correspondante.");
				return;
			}

			// Maintenant TypeScript sait que `command.autocomplete` existe et est une fonction.
			try {
				await command.autocomplete(interaction);
			}
			catch (e) {
				console.error(`Erreur d'autocomplétion: ${e}`);
			}
		}

	},
} satisfies EventOptions<"interactionCreate">;

async function handleCooldown(client: Bot, interaction: CommandInteraction, command: CommandOptions) {
	if (!command.cooldown) return;
	if (!client.cooldowns.has(command.data.name)) {
		client.cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = client.cooldowns.get(command.data.name);

	if (timestamps?.has(interaction.user.id)) {
		const expirationTime = Number(timestamps?.get(interaction.user.id)) + command.cooldown;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1_000);
			const nowTimestamp = Math.round(now / 1_000);
			const timeLeft = expiredTimestamp - nowTimestamp;
			await interaction.reply({
				content: `Please wait ${inlineCode(timeLeft.toString())} more second(s) before reusing the ${inlineCode(command.data.name)} command.`,
				ephemeral: true,
			});
			return false;
		}
	}

	timestamps?.set(interaction.user.id, now);
	setTimeout(() => timestamps?.delete(interaction.user.id), command.cooldown);
	return true;
}

function updateGuildCommandStats(guildId: string, guildName: string, commandName: string, responseTime: number, isError: boolean) {
	// Obtenir les statistiques de la guilde, ou en créer de nouvelles si elles n'existent pas
	let guildStats = guildStatsMap.get(guildId);
	if (!guildStats) {
		guildStats = { id: guildId, name: guildName, commands: new Map() };
		guildStatsMap.set(guildId, guildStats);
	}

	// Obtenir les statistiques de la commande, ou en créer de nouvelles si elles n'existent pas
	let commandStats = guildStats.commands.get(commandName);
	if (!commandStats) {
		commandStats = { command: commandName, totalTime: 0, count: 0, errorCount: 0 };
		guildStats.commands.set(commandName, commandStats);
	}

	// Mettre à jour les statistiques
	commandStats.count++;
	commandStats.totalTime += responseTime;
	if (isError) {
		commandStats.errorCount++;
	}

	// Pas besoin de 'set' car les objets sont modifiés par référence
}

export function getGuildCommandStats() {
	const guildsStatsArray: GuildStats[] = [];

	guildStatsMap.forEach(guildStats => {
		// Transformer la map des commandes en array
		const commandsArray: CommandStats[] = [...guildStats.commands.values()];


		guildsStatsArray.push({
			id: guildStats.id,
			name: guildStats.name,
			// @ts-ignore
			commands: commandsArray, // Ceci est un tableau d'objets de statistiques de commandes

		});
	});

	return guildsStatsArray;
}