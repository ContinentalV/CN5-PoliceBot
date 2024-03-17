// guildMemberAdd.ts
import Bot from "../../core/client";
import { EventOptions, Roles } from "../../types";
import { AuditLogEvent, GuildAuditLogs, Role } from "discord.js";
import { sendRequest } from "../../functions/utilsFunctions";


// TODO ajoute un systeme de logs automatiser && trier pour tout les event, commande etc... POUR BOT & API & APP WEB

export default {
	event: "roleCreate",
	listener: async (client: Bot, role: Role) => {
		const body: Roles = {
			roleId: role.id,
			name: role.name,
			color: role.hexColor,
			serverId: role.guild.id,
		};


		try {
			const response = await sendRequest("post", `${role.guild.id}/roles/create`, body);
			console.log(response.message);
			const auditLogs: GuildAuditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate });
			// @ts-ignore
			const auditEntry = auditLogs.entries.find(entry => entry.target.id === role.id);
			if (response && auditEntry) {
				const user = auditEntry.executor;
				console.log(`Rôle créé par: ${user?.username || null} `);
			}
		}
		catch (e) {
			console.log("Une erreur est surveenue", e);
		}


	},
} satisfies EventOptions<"roleCreate">;
