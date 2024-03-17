import { logError } from "./chalkFn";
import os from "os";
import { getGuildCommandStats } from "../events/interaction/interactionCreate";

export const monitorPerformance = async () => {


	try {
		const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
		const totalMemory = os.totalmem() / 1024 / 1024;
		const memoryUsage = {
			memUse: `${Math.round(usedMemory * 100) / 100}`,
			Total: `${Math.round(totalMemory * 100) / 100} `,
		};
		const cpus = os.cpus();
		const cpuLoad = cpus.map((cpu, index) => `[CPU] ${index}: ${(cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq) / cpu.times.idle}`);
		const x = getGuildCommandStats();

		return { cpu: cpuLoad, guildCommand: x, memory: memoryUsage };

	}
	catch (e: any) {
		logError(e);
	}

};