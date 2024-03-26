import Handlers from "./handlers";
import {Client, ClientEvents, ClientOptions, Collection, Snowflake} from "discord.js";
import { ButtonOptions, CommandOptions, EventOptions } from "../types";


export default class Bot extends Client {
	public commands: Collection<string, CommandOptions> = new Collection();
	public events: Collection<string,  EventOptions<keyof ClientEvents>> = new Collection();
	public buttons: Collection<string, ButtonOptions> = new Collection(); // Ajout de la collection de boutons
	public cooldowns: Collection<string, Collection<Snowflake, number>> = new Collection();
	private readonly handlers = new Handlers(this);

	public constructor(options: ClientOptions) {
		super(options);
	}

	public async start() {
		this.setMaxListeners(0);
		void this.login(process.env.TOKEN);
		await this.handlers.init();

	}
}