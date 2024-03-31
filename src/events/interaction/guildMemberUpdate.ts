import Bot from "../../core/client";
import { GuildMember, PartialGuildMember } from "discord.js";
import { EventOptions } from "../../types";
import {generateLogMessageEvent, IdSalaryRoleInit, sendRequest} from "../../functions/utilsFunctions";
import {v4 as uuidv4} from "uuid";
import {errorLogger, mainLogger} from "../../logger";

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
			const logMessage = generateLogMessageEvent(client, newMember.user.username, newMember.id,  true);
			mainLogger.info(logMessage);
		}
		catch (err: any) {
			const errorId = uuidv4();
			errorLogger.error({ message: err.message, errorId });
			 console.log( {message: "❌ Pas de communications avec l'API", errorId: errorId})

		}


		// ##################################


	},
} satisfies EventOptions<"guildMemberUpdate">;
