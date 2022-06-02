import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { Chat } from '../models/index.js';

@Discord()
export class Common {

    /**
     * Handles Discord's `messageCreate` event. Since this is fired every time
     * there's a message in a channel in which Crofty is joined, we should throw
     * away everything that doesn't apply to Crofty as quickly as possible.
     * 
     * @param param0 
     * @param client 
     */
    @On( 'messageCreate' )
    async onMessageCreate(
        [message]: ArgsOf<'messageCreate'>,
        client: Client ) {
            
        // Ignore messages sent by Crofty himself.
        if ( message.author.bot )
            return;

        // Ignore mentions of @here and @everyone, or types of `REPLY`.
        if ( message.content.includes( '@here' ) ||
            message.content.includes( '@everyone' ) ||
            message.type === 'REPLY' )
            return;

        // Handle mentions to Crofty.
        if ( message.mentions.has( client.user!.id )) {
            await message.channel?.sendTyping();

            const chat = new Chat( message );
            await chat.parse();
            await message.reply( chat.reply );
        }

        // Execute commands.
        else {
            client.executeCommand( message );
        }
    }
}