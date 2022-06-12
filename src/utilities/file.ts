import fs from 'fs';
import { promises as fsp } from 'fs';

/**
 * Whether a file not only exists, but is *accessible* to Crofty.
 * 
 * @param {string} path 
 * @returns {Promise<boolean>}
 */
export const exists = async ( path: string ): Promise<boolean> => {
    try {
        await fsp.access( path, fs.constants.F_OK );
        return true;
    } catch {
        return false;
    }
};

/**
 * Writes content to the local file system, and returns whether that file exists
 * following the write operation.
 * 
 * @param {string} path 
 * @param {string} content 
 * @returns {Promise<boolean>}
 */
export const write = async ( path: string, content: string ): Promise<boolean> => {
    try {
        await fsp.writeFile( path, content );
        return await exists( path );
    } catch {
        return false;
    }
};