import { Player } from "./Player";

export class Group {
    storageId: string;
    description?: string;
    playerIds: string[];
    loadedPlayers?: Player[];
}