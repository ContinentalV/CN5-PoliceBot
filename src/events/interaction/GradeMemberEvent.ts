import Bot from "../../core/client";
import { AuditLogEvent, GuildMember, PartialGuildMember } from "discord.js";
import { EventOptions } from "../../types";
import { sendRequest } from "../../functions/utilsFunctions";
import { config } from "../../config/config";

// TODO remplacer console log par systeme de log avancé
export default {
	event: "guildMemberUpdate",

	listener: async (client: Bot, oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {


		const newRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
		const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

		if (newRoles.size > 0 || removedRoles.size > 0) {
			const auditLogs = await newMember.guild.fetchAuditLogs({
				type: AuditLogEvent.MemberRoleUpdate,
				limit: 1,
			});

			const auditEntry = auditLogs.entries.first();
			const user = auditEntry?.executor;

			if (newRoles.size > 0) {
				await sendRequest("post", "roles/members/grades/add", {
					agentId: newMember.id,
					roleId: newRoles.map(role => role.id).join(","),
				});
				const roleUpdated = newRoles.map(role => role.id).join(",").toString();
				if (roleUpdated === config.webAccess.bcso || roleUpdated === config.webAccess.lspd) {
					const response = await sendRequest("post", "roles/members/grades/webAccess", { agentId: newMember.id });
					console.log(response);


				}


				console.log(`Nouveaux rôles ajoutés à ${newMember.displayName} par ${user?.username}: ${newRoles.map(role => role.name).join(", ")}`);
			}
			if (removedRoles.size > 0) {
				await sendRequest("delete", "roles/members/grades/delete", {
					agentId: newMember.id,
					roleId: removedRoles.map(role => role.id).join(","),
				});
				const RemoveroleUpdated = removedRoles.map(role => role.id).join(",").toString();
				if (RemoveroleUpdated === config.webAccess.bcso || RemoveroleUpdated === config.webAccess.lspd) {
					const response = await sendRequest("post", "roles/members/grades/noAccess", { agentId: newMember.id });
					console.log(response);
				}
				console.log(`Rôles supprimés de ${newMember.displayName} par ${user?.username}: ${removedRoles.map(role => role.name).join(", ")}`);
			}
		}


	},
} satisfies EventOptions<"guildMemberUpdate">;
