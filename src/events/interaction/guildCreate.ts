import Bot from "../../core/client";
import { EventOptions } from "../../types";
import { ChannelType, EmbedBuilder, Guild, PermissionsBitField } from "discord.js";
import { logApiResponse, logError } from "../../functions/chalkFn";
import { extractMatricule, IdSalaryRoleInit, sendRequest } from "../../functions/utilsFunctions";


export default {
	event: "guildCreate",
	listener: async (client: Bot, guild: Guild) => {
		const lspdOrBcso = guild.nameAcronym.toUpperCase();
		let statusRequest: any = "";
		const settingChan = await guild.channels.create({
			name: "$CN5-POLICE",
			type: ChannelType.GuildText,
			topic: "Ici le liens de communication du bot police",
			permissionOverwrites: [
				{
					id: guild.id,
					deny: [PermissionsBitField.Flags.SendMessages],
					allow: [PermissionsBitField.Flags.ViewChannel],
				},
			],
		});

		try {


			const members = await guild.members.fetch();
			const usersArray: {
                discordId: string;
                username: string;
                avatar: string;
                codeMetier: string;
                dateJoin: Date;
                matricule: number | null;
                idServeur: string;
                roles: string[] | undefined;
                nomRP: string | undefined;
                grade?: {
                    id: string;
                    name: string;
                    color: `#${string}`
                }[]
            }[] = [];

			members.forEach(member => {
				if (member.user.bot) return;

				const memberGrades = member.roles.cache.map(role => ({
					id: role.id,
					name: role.name,
					color: role.hexColor,
				}));
				const x = member.nickname ? extractMatricule(member.nickname) : 0;
				let bcsoRoles;
				let lspdRoles;
				if (lspdOrBcso === "LSPD") lspdRoles = member?.roles?.cache.filter((r) => IdSalaryRoleInit.LSPD.includes(r.id)).map(r => r.id);
				if (lspdOrBcso === "BCSO") bcsoRoles = member?.roles?.cache.filter((r) => IdSalaryRoleInit.BCSO.includes(r.id)).map(r => r.id);


				{
					usersArray.push({
						discordId: member.id,
						username: member.user.username,
						avatar: member.user.displayAvatarURL({ size: 1024, extension: "png" }),
						codeMetier: guild.nameAcronym.toUpperCase(),
						dateJoin: member.joinedTimestamp ? new Date(member.joinedTimestamp) : new Date(),
						matricule: x,
						idServeur: guild.id,
						roles: lspdRoles ? lspdRoles : bcsoRoles,
						nomRP: member?.nickname ?? undefined,
						grade: memberGrades,


					});
				}

			});


			// logObject(usersData.map((m => `\n${m.username}\n${m.discordId}\n${m.avatar}\n${m.dateJoin}\n`)));


			const invite = await settingChan.createInvite({
				maxAge: 0, maxUses: 0,
			});
			const rolesArray = guild.roles.cache.map(role => ({
				id: role.id,
				name: role.name,
				color: role.hexColor,
			}));
			const body = {
				serverId: guild.id,
				serverName: guild.name,
				owner: guild.ownerId,
				totalUsers: guild.memberCount,
				creationDate: guild.createdAt,
				defaultChannelId: settingChan.id,
				iconUrl: guild.iconURL({ size: 1024, extension: "png" }),
				inviteUrl: invite.url,
				listRole: rolesArray,


			};


			try {
				const serverInitResponse = await sendRequest("post", "servers/init", body);
				logApiResponse(serverInitResponse);
				statusRequest += "\n - ✅Succès de l'initialisation du serveur. ";
			}
			catch (err: any) {
				console.log(err);
				statusRequest += "\n - 📛 chec de l'initialisation du serveur. ";
			}

			try {
				const membersInitResponse = await sendRequest("post", "members/init", usersArray);

				console.log(membersInitResponse);
				statusRequest += "\n - ✅ Succès de l'ajout des membres. ";

			}
			catch (err: any) {
				logError(err.message);
				logError(err.response ? JSON.stringify(err.response.data) : "Pas de réponse de l'API");
				statusRequest += "\n - 📛 Échec de l'ajout des membres. ";
			}
			finally {
				const embedWelcomServer = new EmbedBuilder()
					.setAuthor({ name: `Welcome on ${guild.name}`, iconURL: client.user?.displayAvatarURL() })
					.setColor("Random")
					.setDescription(`# Status de l'initialisation: ${statusRequest}`)
					.setTimestamp()
					.setThumbnail("https://images-ext-1.discordapp.net/external/Wp7F8TQ41r2pBS8PpDOg96ejsseJpowQmObrQIWmQT4/https/cdn.midjourney.com/6f115512-f893-449b-8861-bfeacdc364a5/0_3.webp?format=webp&width=671&height=671");


				await settingChan.send({ embeds: [embedWelcomServer], content: "<@465144095996772369>" });
			}


		}
		catch (error: any) {
			console.error("Erreur lors de la récupération des membres du serveur:", error);
		}


		// logObject(body);
	},
} satisfies EventOptions<"guildCreate">;
