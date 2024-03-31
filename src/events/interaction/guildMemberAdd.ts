// guildMemberAdd.ts
import Bot from "../../core/client";
import { EventOptions } from "../../types";
import { logApiResponse, logError } from "../../functions/chalkFn";
import {
	generateLogMessage, generateLogMessageEvent,
	generateUniqueMatricule,
	IdSalaryRoleInit,
	sendRequest
} from "../../functions/utilsFunctions";
import { EmbedBuilder } from "discord.js";
import { config } from "../../config/config";
import {errorLogger, mainLogger} from "../../logger";
import {v4 as uuidv4} from "uuid";




export default {
	event: "guildMemberAdd",
	listener: async (client: Bot, member) => {
		const lspdOrBcso = member.guild.nameAcronym.toUpperCase();
		const guildAcr = member.guild.nameAcronym;
		const guild: string = member.guild.id;
		let success = false;
		let statusRequest;
		let channel: any;
		let bcsoRoles;
		let lspdRoles;
		let nicknameCategory;
		let roleInitToAdd: any = [];
		if (guildAcr.toUpperCase() === "LSPD") {
			console.log("LSPD")

			channel = member.guild.channels.cache.get(config.channel.logsMsgLSPD);
			roleInitToAdd = config.initRoles.rolesLspd;
			nicknameCategory = "Cadet"
		}
		else if (guildAcr.toUpperCase() === "BCSO") {
			console.log("BCSO")
			channel = member.guild.channels.cache.get(config.channel.logsMsgBCSO);
			roleInitToAdd = config.initRoles.rolesBcso;
			nicknameCategory = "Deputy-Trainee"

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
			member.setNickname(`${nicknameCategory}-${newMatricule} | Nom`);

			const lspdDM: string = `Bienvenue dans la LSPD, ${nicknameCategory} **${body.matricule}**

> Où l'engagement et le professionnalisme sont nos mots d'ordre. Ensemble, nous veillons à la sécurité et à la tranquillité de Los Santos. Prêt à servir avec honneur et intégrité ? Nous sommes ravis de t'avoir à bord ! 🚔👮‍♂️🌟

 Pour t'aider dans tes débuts, voici les channels que tu dois impérativement lire : 
- <#621709851805876244>
- <#1165634586236166214>
> - si tu as la moindre question tu peux ouvrir un ticket dans le channel <#736941058448949259> ou poser directement t'a question à un membre de  __l'Etat Major__ 

Cordialement, 
Commdandant Magnum `;

const BCSODM = `
**Bienvenue chez la BCSO,** ${nicknameCategory} ${body.matricule}

Nous vous souhaitons une bonne carrière au sein de la bcso. 
Pour toute question ou des renseignements, merci :
- de lire le salon <#1147211944747618369> 
- ou de faire un ticket <#1147211944747618366>  
- ou d'aller voir un membre du __l'Etat Major__. 

Cordialement Le Shériff

`
			embedDM.setTitle("Bienvenue! ");
			embedDM.setDescription(`${guildAcr === "LSPD" ? lspdDM : BCSODM }`);
			embedDM.setColor("Random");
			embedDM.setTimestamp();
			embedDM.setThumbnail(member?.displayAvatarURL({ dynamic: true } as any));
			embedWelcomServer.setColor(guildAcr === "LSPD" ? "Blue" : "DarkOrange");
			embedWelcomServer.setTimestamp();
			embedWelcomServer.setFooter({text: `Bienvenue au nouveau ${lspdOrBcso} -> ${nicknameCategory} ${body.matricule}`, iconURL: member.displayAvatarURL()})
			const response2 = await sendRequest("post", "members/members", body);
			statusRequest = response2;
			success = true;
			const logMessage = generateLogMessageEvent(client, body.username, body.discordId,  success,  statusRequest);
			mainLogger.info(logMessage);


		}
		catch (err: any) {
			const errorId = uuidv4();
			errorLogger.error({ message: err.message, errorId });
			statusRequest = "❌Une erreur est survenue.I";
			embedWelcomServer.setFooter({text: `📍 errorId: ${errorId}`, iconURL: client.user?.displayAvatarURL({ dynamic: true } as any)});
		 

		}
		finally {
			embedWelcomServer.setDescription(`${statusRequest}`);
			await channel.send({ embeds: [embedWelcomServer], content: `${member}` });
			await member.send({ embeds: [embedDM] });
		}
	},
} satisfies EventOptions<"guildMemberAdd">;
