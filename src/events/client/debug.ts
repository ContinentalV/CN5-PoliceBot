import { EventOptions } from "../../types";

export default {
	event: "debug",
	listener: (client, info) => {
		// setTimeout(() => console.log(chalk.blue(info)), 5000);

	},
} satisfies EventOptions<"debug">;