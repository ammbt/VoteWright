import { Player } from "./Player";
import { IStorageObject } from "./IStorageObject";
/**
 * Data model for a group. This is used as both the persisted model and the view model.
 */
export class Group implements IStorageObject {
	/**
	 * The is the firebase storage id. This is not persisted.
	 */
	storageId?: string;

	/**
	 * An optional description for the group. This isn't currently used.
	 */
	description?: string;

	/**
	 * The storage ids of the players that are in this group. These values are persisted.
	 */
	playerIds: string[];

	/**
	 * The players in the group once they have been loaded from the playerIds. This is not persisted.
	 */
	loadedPlayers?: Player[];

	/**
	 * A mapping of player to points, where the player id is the key(JSON property).
	 */
	playerPoints: PlayerToPoints;
}

/**
 * An interface descriping the PlayerToPoints mapping.
 */
export interface PlayerToPoints {
	/**
	 * The mapping is from the playerId string to the point value that player has in this group.
	 */
	[playerId: string]: number;
}
