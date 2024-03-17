// guildMemberAdd.ts
import Bot from "../../core/client";
import { EventOptions } from "../../types";
import { AuditLogEvent, GuildAuditLogs, Role } from "discord.js";
import { sendRequest } from "../../functions/utilsFunctions";


// TODO peut etre devoir ajouter de mettre le role vu qu'il rejoint le serveur il en a pas.
export default {
	event: "roleDelete",
	listener: async (client: Bot, role: Role) => {
		const body = {
			roleId: role.id,
			serverId: role.guild.id,
		};

		console.log(body);

		try {
			const response = await sendRequest("delete", `${body.serverId}/roles/delete`, body);
			console.log(response);

			const auditLogs: GuildAuditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete });
			// @ts-ignore
			const auditEntry = auditLogs.entries.find(entry => entry.target.id === role.id);
			if (response && auditEntry) {
				const user = auditEntry.executor;
				console.log(`Rôle supprimer par: ${user?.username || null} `);
			}
		}
		catch (e) {
			console.log("Une erreur est surveenue", e);
		}


	},
} satisfies EventOptions<"roleDelete">;
