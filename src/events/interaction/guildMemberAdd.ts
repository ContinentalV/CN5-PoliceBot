// guildMemberAdd.ts
import Bot from "../../core/client";
import { EventOptions } from "../../types";
import { logApiResponse, logError } from "../../functions/chalkFn";
import { generateUniqueMatricule, IdSalaryRoleInit, sendRequest } from "../../functions/utilsFunctions";
import { EmbedBuilder } from "discord.js";
import { config } from "../../config/config";


// TODO peut etre devoir ajouter de mettre le role vu qu'il rejoint le serveur il en a pas.
// TODO quand membre rejoins serveur => mettre role, renomer, ajouter le necessaire.
export default {
	event: "guildMemberAdd",
	listener: async (client: Bot, member) => {
		const lspdOrBcso = member.guild.nameAcronym.toUpperCase();
		const guildAcr = member.guild.nameAcronym;
		const guild: string = member.guild.id;
		let channel: any;
		let bcsoRoles;
		let lspdRoles;
		let roleInitToAdd: any = [];
		if (guildAcr.toUpperCase() === "LSPD") {
			channel = member.guild.channels.cache.get(config.channel.logsMsgLSPD);
			roleInitToAdd = config.initRoles.rolesLspd;
		}
		else if (guildAcr.toUpperCase() === "BCSO") {
			channel = member.guild.channels.cache.get(config.channel.logsMsgBCSO);
			roleInitToAdd = config.initRoles.rolesBcso;

		}

		const applyInitRole = (rolesArray: [], user: any) => {
			rolesArray.forEach((role) => {
				const roleToApply = member.guild.roles.cache.find((r: any) => r.id === role);
				user.roles.add(roleToApply);
				console.log("Role ajouter :: " + roleToApply?.name);
			});
		};
		applyInitRole(roleInitToAdd, member);

		const embedDM = new EmbedBuilder();
		const embedWelcomServer = new EmbedBuilder();

		if (lspdOrBcso === "LSPD") lspdRoles = member?.roles?.cache.filter((r) => IdSalaryRoleInit.LSPD.includes(r.id)).map(r => r.id);
		if (lspdOrBcso === "BCSO") bcsoRoles = member?.roles?.cache.filter((r) => IdSalaryRoleInit.BCSO.includes(r.id)).map(r => r.id);
		const body = {
			discordId: member.id,
			username: member.user.username,
			avatar: member.user.avatarURL({ size: 1024, extension: "png" }),
			dateJoin: member.joinedTimestamp ? new Date(member.joinedTimestamp) : new Date(),
			codeMetier: guildAcr.toUpperCase(),
			matricule: 0,
			idServeur: guild,
			roles: lspdRoles ? lspdRoles : bcsoRoles,
			initRole: roleInitToAdd,
		};


		try {
			const response = await sendRequest("get", "stats/stats/matricules");
			const matricules = response;
			const matriculesArray = lspdOrBcso === "LSPD" ? matricules.LSPD : matricules.BCSO;
			const matriculesFiltered = matriculesArray.filter((matricule: number | null) => matricule !== null) as number[];
			const newMatricule = generateUniqueMatricule(matriculesFiltered);
			body.matricule = newMatricule ?? 0;
			member.setNickname(`Cadet/deputy-${newMatricule} | Nom`);

			const lspdDM: string = `Bienvenue dans la LSPD, Cadet **${body.matricule}**

> Où l'engagement et le professionnalisme sont nos mots d'ordre. Ensemble, nous veillons à la sécurité et à la tranquillité de Los Santos. Prêt à servir avec honneur et intégrité ? Nous sommes ravis de t'avoir à bord ! 🚔👮‍♂️🌟

 Pour t'aider dans tes débuts, voici les channels que tu dois impérativement lire : 
- <#621709851805876244>
- <#1165634586236166214>
> - si tu as la moindre question tu peux ouvrir un ticket dans le channel <#736941058448949259> ou poser directement t'a question à un membre de  __l'Etat Major__ 

Cordialement, 
Commdandant Magnum `;
			embedDM.setTitle("Bienvenue! ");
			embedDM.setDescription(`${guildAcr === "LSPD" ? lspdDM : "PAS ENCORE FAIT"}`);
			embedDM.setColor("Random");
			embedDM.setTimestamp();
			embedDM.setThumbnail(member?.displayAvatarURL({ dynamic: true } as any));

			embedWelcomServer.setColor(guildAcr === "LSPD" ? "Blue" : "DarkOrange");
			embedWelcomServer.setTimestamp();
			embedWelcomServer.setThumbnail(member?.displayAvatarURL({ dynamic: true } as any));
			embedWelcomServer.setDescription(`Bienvenue au nouveau cadet ${body.matricule}! Acceuillons le comme il se doit! `);


			const response2 = await sendRequest("post", "members/members", body);
			logApiResponse(`${response2}`);


		}
		catch (err: any) {

			logError(err.message);
			embedWelcomServer.setDescription(`${err.message}`);
			embedWelcomServer.setColor("Red");
		}
		finally {
			await channel.send({ embeds: [embedWelcomServer] });
			await member.send({ embeds: [embedDM] });
		}
	},
} satisfies EventOptions<"guildMemberAdd">;
