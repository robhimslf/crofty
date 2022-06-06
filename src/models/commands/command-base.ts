import { Pagination } from '@discordx/pagination';
import { EmbedFieldData, MessageEmbed, InteractionReplyOptions } from 'discord.js';
import type { CommandInteraction } from 'discord.js';
import { constants } from '../../utilities/index.js';

/**
 * Interface contract of a Crofty command with an async prepare operation.
 */
export interface ICommandAsync {
    prepare: () => Promise<void>;
}

/**
 * Interface contract of a stub `MessageEmbed` object's title and description
 * values.
 */
export interface ICommandEmbedStub {
    title: string;
    description: string;
}

export abstract class CommandBase {

    /**
     * Command interaction used with Crofty's pagination reply.
     */
    private _interaction: CommandInteraction | undefined;

    /**
     * Crofty's parsed reply configuration.
     */
    private _reply: InteractionReplyOptions | undefined;

    /**
     * Crofty's parsed reply with pagination.
     */
    get paginationReply(): Pagination | undefined {
        if ( !this.reply ||
            !this.reply.embeds ||
            this.reply.embeds.length < 1 ||
            !this._interaction )
            return undefined;

        const pages: any[] = [];
        const embeds = this.reply.embeds! as MessageEmbed[];
        embeds.forEach(( embed, index ) => {
            const paging = `Page ${index + 1} of ${embeds.length}`;
            const footer = ( embed.footer && embed.footer.text )
                ? `${embed.footer.text} | ${paging}`
                : paging;
            embed.setFooter({ text: footer });
            pages.push( embed );
        });

        return new Pagination( this._interaction, pages );
    }

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
     * Initializes this command base with an interaction in preparation for
     * a pagination-based reply.
     * 
     * @param {CommandInteraction} interaction 
     */
    constructor( interaction?: CommandInteraction ) {
        if ( interaction )
            this._interaction = interaction;
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
     * @param {string} thumbnail 
     */
    createEmbed(
        title?: string,
        description?: string,
        fields?: EmbedFieldData[],
        footer?: string,
        thumbnail?: string ) {

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
                text: footer
            });

        if ( thumbnail )
            embed.setThumbnail( thumbnail );

        this.addEmbed( embed );
    }
}