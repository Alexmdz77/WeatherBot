// import { ApplicationCommandType, Message } from "discord.js";
// import { Command } from "../../../structures/Command";
// import { lang } from "../../../helpers";
// import { createMessage } from "../helpers";
// import { client } from "../../../..";

// export default new Command({
//     name: "Update Location",
//     description: "Update the location of a weather message",
//     type: ApplicationCommandType.Message,
//     deferReply: true,
//     ephemeral: true,
//     run: async ({ interaction }) => {
//         const message = (await interaction.channel?.messages.fetch(interaction.targetId)) as Message;
//         if(!message) return interaction.followUp({content: await configReplace("messages.messageNotFound"), ephemeral: true});
//         if(!message.author.bot) return interaction.followUp({content: await configReplace("messages.messageNotBot"), ephemeral: true});

//         // get the config path from the message in db
//         const {authorId, configPath} = await getMessage({ messageId: message.id, guildId: interaction.guild.id, channelId: message.channelId });
//         if(!configPath || !authorId) return interaction.followUp({content: await configReplace("messages.messageNotInDb"), ephemeral: true});
//         if(authorId !== interaction.user.id && client.config.OnlyEditableByAuthor) return interaction.followUp({content: await configReplace("messages.messageNotAuthor"), ephemeral: true});

//         // get the config from the config path
//         const config = await parseConfig(configPath);
//         if(!config) return interaction.followUp({content: await configReplace("messages.configPathNotFound"), ephemeral: true});

//         const newMessage = await createMessage(config);

//         // update the message
//         await message.edit(newMessage);

//         await interaction.followUp({content: await configReplace("messages.updated"), ephemeral: true});
//     }});
    