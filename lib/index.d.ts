import { PlexAPIClientOptions } from './models/options';
import { PlexServer } from './models/server';
import { PlexSession } from './models/session';
import { PlexUser } from './models/user';
export declare class PlexAPIClient {
    private clientId;
    private username;
    private password;
    private accessToken;
    private options;
    constructor(clientId: string, username: string, password: string, options?: PlexAPIClientOptions);
    authenticate(): Promise<string>;
    getServers(): Promise<PlexServer[]>;
    getUsers(): Promise<PlexUser[]>;
    getPendingUsers(): Promise<PlexUser[]>;
    getAllUsers(): Promise<PlexUser[]>;
    getPendingFriends(): Promise<any[]>;
    inviteUser(username: string, machineId: string): any;
    removeUser(userId: string): any;
    removePendingUser(userId: string): any;
    getSessions(ip: string, port: number): Promise<PlexSession[]>;
}
