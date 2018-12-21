import { IStorageObject } from "./IStorageObject";

/**
 * Data model for a player. This is used as both the persisted model and the view
 * model.
 */
export class Player implements IStorageObject {
	/**
	 * The is the firebase storage id. This is not persisted.
	 */
	storageId?: string;

	/**
	 * The player's first name.
	 */
	firstName: string;

	/**
	 * The player's last name.
	 */
	lastName: string;

	/**
	 * The last time this player 'played' in a group. This is the last time the
	 * player was played in a group.
	 */
	lastPlayDate: string;

	/**
	 * Used in the view model for whether the player is selected or not. This can
	 * be for selecting the player for a group or if the player won the vote.
	 * This is not persisted.
	 */
	isSelected?: boolean;

	/**
	 * The number of points the player has. This is used in the view model for a
	 * group. This is not persisted.
	 */
	points?: number;
}
