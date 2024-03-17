import {CommandOptions} from "../../types";
import {ChannelType} from "discord-api-types/v10";
import { logError, logWarning, logInfo, logNumber, logApiResponse, logObject } from '../../functions/chalkFn';
export default {
    data: {
        name: "purge",
        description: "Purge command",

    },
    category: "category",
    cooldown: 5000,
    execute: async (client, interaction, args) => {
        const msg = interaction.channel?.messages.fetch({limit:100})
        if(interaction.channel?.type === ChannelType.DM) return;
         const deleted = await interaction.channel?.bulkDelete(100,true)
        if (deleted?.size === 0) await interaction.reply("No messages were deleted.")
        else await interaction.reply(`Successfully deleted ${deleted?.size} message(s)`)
        setTimeout(() => interaction.deleteReply(), 5000)


    },

} satisfies CommandOptions;