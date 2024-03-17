import Bot from "../core/client";
import { Awaitable, ClientEvents, GuildMember } from "discord.js";
// TODO Verifier si on utilise bien les export comme guildMemberUpdate
// Define an interface for EventOptions
export interface EventOptions<K extends keyof ClientEvents> {
    event: K;
    once?: boolean; // Boolean to specify if the event should be executed only once
    listener: (client: Bot, ...args: ClientEvents[K]) => Awaitable<any>;
}

// Event handler pour guildMemberAdd
export const guildMemberAdd: EventOptions<"guildMemberAdd"> = {
	event: "guildMemberAdd",
	listener: (client: Bot, ...args: ClientEvents["guildMemberAdd"]) => {
		// Votre logique de gestion pour l'événement guildMemberAdd
	},
};
export const guildMemberUpdate: EventOptions<"guildMemberUpdate"> = {
	event: "guildMemberUpdate",
	// @ts-ignore
	listener: (client: Bot, oldMember: GuildMember, newMember: GuildMember) => {
		// Votre logique ici
	},
};

export const guildCreate: EventOptions<"guildCreate"> = {
	event: "guildCreate",
	listener: (client: Bot, ...args: ClientEvents["guildCreate"]) => {
		console.log(args);
	},
};

// Event handler pour messageCreate
export const messageCreate: EventOptions<"messageCreate"> = {
	event: "messageCreate",
	listener: (client: Bot, ...args: ClientEvents["messageCreate"]) => {
		// Votre logique de gestion pour l'événement messageCreate
	},
};
