import Bot from "../../core/client";
import { GuildMember, PartialGuildMember } from "discord.js";
import { EventOptions } from "../../types";
import { logError } from "../../functions/chalkFn";
import { IdSalaryRoleInit, sendRequest } from "../../functions/utilsFunctions";
// TODO optimiser laisser que si c un grade salarial ici, et pour tout le reste faire des requette specifique, pour update avatar, name. comme on ajoutera aussi sur l'event message
export default {
	event: "guildMemberUpdate",

	listener: async (client: Bot, oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {

		const body: any = {
			id: newMember.id,
			avatar: newMember.user.avatarURL({ size: 1024, extension: "png" }),
		};

		const salaryRoles = IdSalaryRoleInit;
		const companyRolesIds = {
			"BCSO": salaryRoles.BCSO,
			"LSPD": salaryRoles.LSPD,
		};


		const newRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
		if (newRoles.size > 0) {

			const relevantRoleAdded = newRoles.some(role =>
				Object.values(companyRolesIds).some(rolesArray => rolesArray.includes(role.id)));

			if (relevantRoleAdded) {
				body.role = newRoles.map((r) => r.id)[0];
			}
			else {
				console.log("Rôle secondaire ajouté, aucune action nécessaire.");
				return;
			}
		}

		if (oldMember.nickname !== newMember.nickname) {
			body.nickname = newMember.nickname;
		}

		try {
			await sendRequest("put", "members/rolesUpdate", body);

		}
		catch (e: any) {
			logError(e);
		}


		// ##################################


	},
} satisfies EventOptions<"guildMemberUpdate">;
