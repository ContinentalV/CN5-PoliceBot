import Bot from "../core/client";
import {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	Guild,
	GuildMember,
	User,
} from "discord.js";


// Define an interface for CommandOptions
export interface CommandOptions {
    data: ChatInputApplicationCommandData;
    category: string;
    cooldown?: number; // Optional cooldown for the command
    execute: (client: Bot, interaction: CommandInteraction, args: CommandInteractionOptionResolver) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
    user: User;
    guild: Guild;
}
