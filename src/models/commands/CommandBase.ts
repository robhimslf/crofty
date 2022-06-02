import { EmbedFieldData, MessageEmbed, InteractionReplyOptions } from 'discord.js';
import { constants } from '../../utilities/index.js';

export abstract class CommandBase {

    /**
     * Crofty's parsed reply configuration.
     */
    private _reply: InteractionReplyOptions | undefined;

    /**
     * Crofty's parsed reply configuration.
     */
    get reply(): InteractionReplyOptions | undefined {
        return this._reply;
    }

    /**
     * Crofty's fallback interaction response when the typical functionality
     * encounters an issue.
     */
    get fallbackReply(): InteractionReplyOptions {
        return {
            content: constants.Strings.FallbackInteractionResponse
        };
    }

    /**
     * Sets Crofty's reply content.
     * 
     * This is just the basic text of a response message. Most of Crofty's
     * command respones include embeds, which should use the `addEmbed` method.
     */
    set replyContent( content: string ) {
        if ( !this._reply )
            this._reply = {};

        this._reply.content = content;
    }

    /**
     * Adds an embed to Crofty's reply.
     * 
     * This is not the basic text of a response message, which should use the
     * `replyContent` setter.
     * 
     * @param {MessageEmbed} embed 
     */
    addEmbed( embed: MessageEmbed ) {
        if ( !this._reply )
            this._reply = {};

        if ( !this._reply.embeds )
            this._reply.embeds = [];

        this._reply.embeds.push( embed );
    }

    /**
     * Creates an embed, and adds it to Crofty's reply.
     * 
     * @param {string} title 
     * @param {string} description 
     * @param {EmbedFieldData[]} fields 
     * @param {string} footer 
     * @param {string} footerIcon 
     */
    createEmbed(
        title?: string,
        description?: string,
        fields?: EmbedFieldData[],
        footer?: string,
        footerIcon?: string ) {

        if ( !title && !description && !fields ) {
            console.warn( `⚠️ Crofty requires one or more of 'title', 'description', and 'fields' to create an embed. Skipping.` );
            return;
        }
        
        const embed = new MessageEmbed()
            .setColor( constants.EmbedColor );

        if ( title )
            embed.setTitle( title );

        if ( description )
            embed.setDescription( description );

        if ( fields )
            embed.addFields( fields );

        if ( footer )
            embed.setFooter({
                text: footer,
                iconURL: footerIcon
            });

        this.addEmbed( embed );
    }
}