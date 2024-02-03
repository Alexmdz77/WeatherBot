import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteractionOptionResolver } from "discord.js";
import { Command } from "../../../structures/Command";
import { createForecastMessage, getCities } from "../helpers";
import fetch from 'node-fetch';

export default new Command({
    name: "forecast",
    description: "Send a forecast message",
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
        console.log(process.env.WEATHER_API_KEY)

        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.split(',')[1]}&lon=${location.split(',')[2]}&units=metric&appid=${process.env.WEATHER_API_KEY}`);
        const data = await response.json();
        if(!data || data.cod !== "200" || !data.list) return interaction.editReply({content: "An error occurred while fetching the forecast"});
        const embed = await createForecastMessage(data, location);

        await interaction.editReply({embeds: [embed]});
    }
});
