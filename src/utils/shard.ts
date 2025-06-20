import {
    ShardClientUtil,
    ShardingManager,
    fetchRecommendedShardCount
} from 'discord.js';
import { MathUtils } from './math.js';
import { DiscordLimits } from './discord-limits.js';

export class ShardUtils {

    public static async recommendedShardCount(
        token: string,
        guildsPerShard: number ): Promise<number> {

        return Math.ceil( await fetchRecommendedShardCount( token, { guildsPerShard }));
    }

    public static async requiredShardCount( token: string ): Promise<number> {
        return await this.recommendedShardCount( token, DiscordLimits.GUILDS_PER_SHARD );
    }

    public static async serverCount( iface: ShardingManager | ShardClientUtil ): Promise<number> {
        const counts = ( await iface.fetchClientValues( 'guilds.cache.size' )) as number[];
        return MathUtils.sum( counts );
    }

    public static shardId( guildId: number | string, count: number ): number {
        return Number(( BigInt( guildId ) >> 22n ) % BigInt( count ));
    }

    public static shardIds( iface: ShardingManager | ShardClientUtil ): number[] {
        if ( iface instanceof ShardingManager )
            return iface.shards.map( x => x.id );
        return iface.ids;
    }
}