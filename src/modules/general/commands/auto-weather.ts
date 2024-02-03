import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteractionOptionResolver, GuildChannel, TextChannel } from "discord.js";
import { Command } from "../../../structures/Command";
import { createMessage, getCities } from "../helpers";
import fetch from 'node-fetch';
import { createMeteo } from "../database";

export default new Command({
    name: "auto-weather",
    description: "Send an auto weather message",
    deferReply: true,
    ephemeral: true,
    options: [
        {
            name: "location",
            description: "The location of the weather",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true
        },
        {
            name: "channel",
            description: "The channel to send the message",
            type: ApplicationCommandOptionType.Channel,
        },
    ],
    autocomplete: async ( interaction: AutocompleteInteraction ) => {
		const focusedValue = interaction.options.getFocused();
        const choices = await getCities(focusedValue);
		await interaction.respond(
			choices.map(choice => ({ name: choice.name, value: choice.name.split(',')[0]+','+choice.value })),
		);
    },
    run: async ({ interaction }) => {
        const location = interaction.options.getString("location");
        const channel = (interaction.options.getChannel("channel") || interaction.channel) as GuildChannel;

        
        if(!(channel instanceof TextChannel)) {
            await interaction.editReply({content: "The channel is not a text channel"});
            return;
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.split(',')[1]}&lon=${location.split(',')[2]}&units=metric&appid=${process.env.WEATHER_API_KEY}`);
        const data = await response.json();
        if(!data || data.cod !== "200") return interaction.editReply({content: "An error occurred while fetching the weather"});

        const embed = await createMessage(data, location);
        
        const message = await channel.send({embeds: [embed]});

        createMeteo({
            guildId: interaction.guild.id,
            channelId: message.channel.id,
            messageId: message.id,
            authorId: interaction.user.id,
            type: "embed",
            location: location
        });

        await interaction.editReply({content: `The weather message has been sent in <#${message.channel.id}>`});
    }
});
