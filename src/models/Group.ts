import { Player } from "./Player";

export class Group {
    storageId?: string;
    description?: string;
    playerIds: string[];
	loadedPlayers?: Player[];
	playerPoints: PlayerToPoints;
}

export interface PlayerToPoints {
	[playerId: string]: number;
}
