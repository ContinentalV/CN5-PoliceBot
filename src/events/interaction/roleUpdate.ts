// guildMemberAdd.ts
import Bot from "../../core/client";
import { EventOptions, Roles } from "../../types";
import { sendRequest } from "../../functions/utilsFunctions";
import { AuditLogEvent, GuildAuditLogs } from "discord.js";


export default {
	event: "roleUpdate",
	listener: async (client: Bot, old, newRole) => {

		const body: Roles = {
			roleId: newRole.id,
			name: newRole.name,
			color: newRole.hexColor,
			serverId: newRole.guild.id,
		};


		try {
			const response = await sendRequest("post", `${newRole.guild.id}/roles/update`, body);

			const auditLogs: GuildAuditLogs = await newRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate });
			// @ts-ignore
			const auditEntry = auditLogs.entries.find(entry => entry.target.id === newRole.id);
			if (response && auditEntry) {
				const user = auditEntry.executor;
				console.log(`Rôle update par: ${user?.username || null} `);
			}
		}
		catch (e) {
			console.log("Une erreur est surveenue", e);
		}


	},
} satisfies EventOptions<"roleUpdate">;
