import {CommandOptions} from "../../types";
import {ApplicationCommandOptionType} from "discord-api-types/v10";

export default {
    data: {
        name: "test",
        description: "tesdddt",
        options: [
            {
                name: "choice",
                description:"insere un chiffre",
                type: ApplicationCommandOptionType.String,
                choices: [
                    { name: 'Member', value: 'member' },
                    { name: 'Guild', value: 'guild' },
                ],
                required:true
            },
            {
                name: "number2",
                description:"insere un chiffre",
                type: ApplicationCommandOptionType.Number,
                required:true
            },

        ]
    },
    category: "admin",
    cooldown: 5000,
    execute: async (client, interaction, args) => {

        console.log(args.getString("choice"))
        console.log(args.getString("number2"))
      //const n2 =





    },

} satisfies CommandOptions;