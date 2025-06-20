import { HttpServiceBase } from '../http-service-base.js';
import {
    type F1Meeting,
    type F1Session,
    type OpenF1Meeting,
    type OpenF1MeetingQuery,
    type OpenF1Session,
    type OpenF1SessionQuery,
    parseF1Meetings,
    parseF1Sessions
} from './models/index.js';

/**
 * Service for querying Formula 1 data from the OpenF1 API.
 * 
 * This service provides methods to query meetings (e.g., Grand Prix or testing
 * weekends) and sessions (e.g., practices, qualifying, etc.).
 */
export class OpenF1Service extends HttpServiceBase {
    private readonly BASE_URL = 'https://api.openf1.org/v1';
    private static _instance: OpenF1Service | undefined;

    /**
     * Returns a singleton instance of the OpenF1Service.
     */
    public static get instance(): OpenF1Service {
        if ( !OpenF1Service._instance )
            OpenF1Service._instance = new OpenF1Service();
        return OpenF1Service._instance;
    }

    /**
     * Queries for a collection of F1 meetings (e.g., Grand Prix or testing
     * weekends) based on the provided parameters.
     */
    public async queryMeetings(
        query: OpenF1MeetingQuery,
        includeSessions: boolean = false ): Promise<F1Meeting[]> {

        let sessions: OpenF1Session[] = [];
        if ( includeSessions ) {
            const sessionQuery: OpenF1SessionQuery = { ...query };
            sessions = await this.querySessions( sessionQuery, false ) as OpenF1Session[];
        }

        const url = `${this.BASE_URL}/meetings?${this.queryString( query )}`;
        const results = await this.getJson<OpenF1Meeting[]>( url );
        if ( !results )
            return [];
        
        
        return parseF1Meetings( results, sessions );
    }

    /**
     * Queries for a collection of F1 sessions (e.g., practices, qualifying,
     * races, etc.) based on the provided parameters.
     */
    public async querySessions(
        query: OpenF1SessionQuery,
        parse: boolean = true ): Promise<F1Session[] | OpenF1Session[]> {

        const url = `${this.BASE_URL}/sessions?${this.queryString( query )}`;
        const results = await this.getJson<OpenF1Session[]>( url );

        if ( !results )
            return [];

        if ( parse )
            return parseF1Sessions( results );

        return results;
    }
}
