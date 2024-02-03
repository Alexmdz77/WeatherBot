import { CommandInteractionOptionResolver, GuildMember, TextChannel, InteractionType, MessageContextMenuCommandInteraction, AutocompleteInteraction } from "discord.js";
import { client } from "../../../../index";
import { Event } from "../../../structures/Event";
import type { ExtendedInteraction } from "../../../typings/Command";

export default new Event("interactionCreate", async (interaction: ExtendedInteraction) => {

    // Chat Input Commands
    if (interaction.type === InteractionType.ApplicationCommand && interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({embeds: [{description: 'Error: Command not Found'}] , ephemeral: true});

        const authorPerms = (interaction.channel as TextChannel).permissionsFor(interaction.member as GuildMember)
        if(command.userPermissions && !authorPerms.has(command.userPermissions)) return interaction.reply({embeds: [{description: 'Error: Missing Permissions'}] , ephemeral: true})
        
        if(command.deferReply && !interaction.replied) await interaction.deferReply({ephemeral: command.ephemeral || false});

        command.run({
            client,
            args: interaction.options as CommandInteractionOptionResolver,
            interaction: interaction as ExtendedInteraction
        });
    }

    if(interaction.isMessageContextMenuCommand()) {

        const contextInteraction = interaction as MessageContextMenuCommandInteraction

        const command = client.commands.get(contextInteraction.commandName);
        if (!command) return contextInteraction.reply({embeds: [{description: 'Error: Command not Found'}] , ephemeral: true});

        if(command.deferReply && !contextInteraction.replied) await contextInteraction.deferReply({ephemeral: command.ephemeral || false});

        command.run({
            client,
            args: contextInteraction.options as CommandInteractionOptionResolver,
            interaction: contextInteraction
        });
    }

    if (interaction.isAutocomplete()) {

        const autocompleteInteraction = interaction as AutocompleteInteraction

		const command = client.commands.get(autocompleteInteraction.commandName);

		if (!command) {
			console.error(`No command matching ${autocompleteInteraction.commandName} was found.`);
			return;
		}

		try {
			await command.autocomplete(autocompleteInteraction);
		} catch (error) {
			console.error(error);
		}
	}
});