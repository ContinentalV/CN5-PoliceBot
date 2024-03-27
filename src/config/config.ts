// Interfaces pour typer la configuration
interface IGuildConfig {
    id: string;
}

interface ILogsConfig {
    logsMsgLSPD: string;
    logsMsgBCSO: string;
}

interface IPermWL {
    sherif: string,
    commandant: string,
}

interface IChannelMessaeg {
    reunionB: string,
    reunionL: string,
    logsB: string,
    logsL: string
}

interface IConfig {
    guild: IGuildConfig;
    channel: ILogsConfig;
    permWL: IPermWL;
    channelsMsg: IChannelMessaeg,
    initRoles: IInitRoles
    role: any;
    webAccess: IWebAccess,
	serviceOnOff: servicePermChannel
	colorState: colorState
	tagRole: tagRole
}

// Objet de configuration exporté
export const config: IConfig = {
	guild: {
		id: "1111360018818797688",
	},
	channel: {
		logsMsgLSPD: "1197307893947576421",
		logsMsgBCSO: "1197191312550666320",
	},
	permWL: {
		sherif: "465144095996772369",
		commandant: "465144095996772369",
	},
	channelsMsg: {

		reunionB: "1147241733873209414",
		logsB: "1197191312550666320",
		reunionL: "1054147008023248896",
		logsL: "1197307893947576421",
	},
	initRoles: {
		rolesLspd: ["621711885456375848", "844988688886267964", "621716298598187008", "919582292060545084"],
		rolesBcso: ["1147211942759518312", "1147211942742736905", "1147211942663032945", "1147211942663032947"],
	},

	webAccess: {
		lspd: "916440191080751165",
		bcso: "1218977832286425248",
	},
	serviceOnOff: {
		bcso: {
			on: "1147211942663032944",
			off: "1147211942663032943",
			},
		lspd: {
			on: "907707270895394827",
			off: "907707457772597268",
		}

	},
	colorState: {
		success: "#3ed108",
		error: "#d10816",
		warning: "#ed9702",
		info: "#19a7fa",
		random: "Random",
	},
	tagRole: {
		lspd: "621711885456375848",
		bcso: "1147211942663032945"
	},



	role: {},
};

interface IInitRoles {
    rolesLspd: string[],
    rolesBcso: string[];
}

interface IWebAccess {
    lspd: string,
    bcso: string,

}
interface servicePermChannel {
	bcso: {
		on:string,
		off: string
	},
	lspd: {
		on: string,
		off: string,
	}
}

interface colorState {
	success: string,
	error: string,
	warning: string,
	info: string,
	random: string
}

interface tagRole {
	lspd: string,
	bcso: string
}