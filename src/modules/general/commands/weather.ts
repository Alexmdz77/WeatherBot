import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteractionOptionResolver } from "discord.js";
import { Command } from "../../../structures/Command";
import { createMessage, getCities } from "../helpers";
import fetch from 'node-fetch';

export default new Command({
    name: "weather",
    description: "Send a weather message",
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

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.split(',')[1]}&lon=${location.split(',')[2]}&units=metric&appid=${process.env.WEATHER_API_KEY}`);
        const data = await response.json();
        if(!data || data.cod !== "200") return interaction.editReply({content: "An error occurred while fetching the weather"});
        const embed = await createMessage(data, location);

        await interaction.editReply({embeds: [embed]});
    }
});
