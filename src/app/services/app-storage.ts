import  { firestore } from 'firebase/app';
import 'firebase/firestore';
import { Injectable } from '@angular/core';
import { Player } from '../models/Player';
import { Group } from '../models/Group';
import { IStorageObject } from '../models/IStorageObject.js';
import * as firebase from 'firebase';

/**
 * The persistent data storage, as an Angular service, for the application.
 * This currently uses firebase.
 *
 * @export
 * @class AppStorage
 */
@Injectable()
export class AppStorage {
	// The firebase storage collections for the different data types.
	private readonly playersCollection: string = "Players";
	private readonly groupsCollection: string = "Groups";

    private breakException: ExceptionInformation = {};

    private database: firestore.Firestore;

	// Local caches for the players and groups.
    private groupCache: Group[];
    private playerCache: Player[];

    constructor() {
        this.database = firebase.firestore();
        let settings: firestore.Settings = {};
        this.database.settings(settings);

        this.groupCache = [];
        this.playerCache = [];
    }

    /**
	 * Retrieve the persisted players from the cache or storage.
	 *
	 * @param {boolean} [refresh=false] Force refreshing the players from storage
	 * if this is true.
	 * @returns {Promise<Player[]>} The Promise with the collection of players from
	 * the cache or storage.
	 * @memberof AppStorage
	 */
	public getPlayers(refresh: boolean = false): Promise<Player[]> {
        if(!refresh && this.playerCache.length > 0) {
            return Promise.resolve(this.playerCache);
        }

        return this.getObjects<Player>(this.playersCollection, 'playerCache');
    }

    /**
	 * Adds a player to storage. This will not add a player if a player
	 * already exists with the same first and last name.
	 *
	 * @param {Player} player The player to persist.
	 * @returns {Promise<Player>} The player that was added to storage. This should
	 * have the storageId for the new player.
	 * @memberof AppStorage
	 */
	public addPlayer(player: Player): Promise<Player> {
        let matchingPlayer: Player = this.playerCache.find((p: Player) => {
            return (p.storageId && p.storageId === player.storageId)
                || (p.firstName === player.firstName && p.lastName === player.lastName);
        });

        if(!matchingPlayer) {
            return this.addObject<Player>( this.playersCollection, player);
        }
    }

    /**
	 * Retrieve the groups from the cache or storage.
	 *
	 * @param {boolean} [refresh=false] If true, forces a reload of the groups from
	 * storage.
	 * @returns {Promise<Group[]>} The groups from the cache or storage.
	 * @memberof AppStorage
	 */
	public getGroups(refresh: boolean = false): Promise<Group[]> {
        if(!refresh && this.groupCache.length > 0) {
            return Promise.resolve(this.groupCache);
        }

        return this.getObjects<Group>(this.groupsCollection, 'groupCache');
    }

    /**
	 * Add a group to storage. Only add the group if the group with the same
	 * players does not already exist.
	 *
	 * @param {Group} group The group to persist.
	 * @returns {Promise<Group>} The persisted group with its storageId.
	 * @memberof AppStorage
	 */
	public addGroup(group: Group): Promise<Group> {
        let matchingGroup: Group = this.groupCache.find((g: Group) => {
            if(g.storageId && g.storageId === group.storageId) {
                return true;
            }

            try {
                g.playerIds.forEach((id: string, index: number) => {
                    if(group.playerIds[index] !== id) {
						// Short circuit the loop since this group is not a match.
                        throw this.breakException;
                    }
                });
            }
            catch(breakException) {
                return false;
            }

            return true;
        });

        if(!matchingGroup) {
            return this.addObject<Group>(this.groupsCollection, group).then((addedGroup: Group): Promise<Group> => {
                addedGroup.loadedPlayers = [];
                addedGroup.playerIds.forEach((playerId: string) =>{
                    try {
                        this.playerCache.forEach((player: Player) => {
                            if(playerId === player.storageId) {
                                addedGroup.loadedPlayers.push(player);
                                throw this.breakException;
                            }
                        });
                    }
                    catch(breakException) {}
                });

                this.groupCache.push(addedGroup);

                return Promise.resolve(addedGroup);
            });
        }

        return Promise.resolve(matchingGroup);
	}

	/**
	 * Update the persisted data for a group.
	 *
	 * @param {Group} group The group to update.
	 * @memberof AppStorage
	 */
	public updateGroup(group: Group): void {
		// We only want to store the properties we need.
		let storageGroup: Group = {
			playerIds: group.playerIds,
			playerPoints: group.playerPoints
		}

		this.updateObject<Group>(group, storageGroup, this.groupsCollection);
	}


	/**
	 * Update the persisted data for a player.
	 *
	 * @param {Player} player The player to update.
	 * @memberof AppStorage
	 */
	public updatePlayer(player: Player): void {
		let storagePlayer: Player = {
			firstName: player.firstName,
			lastName: player.lastName,
			lastPlayDate: player.lastPlayDate
		};

		this.updateObject<Player>(player, storagePlayer, this.playersCollection);
	}

	/**
	 * Update an IStorageObject in storage.
	 *
	 * @private
	 * @template T
	 * @param {T} object The original object to update.
	 * @param {T} storageObject The object stripped down to just persisted properties.
	 * @param {string} collection The storage collection this object belongs to.
	 * @memberof AppStorage
	 */
	private updateObject<T extends IStorageObject>(object: T, storageObject: T, collection: string) {
		this.database.collection(collection).doc(object.storageId).set(storageObject).catch((reason: any) => {
			console.error(`Unable to update the item in storage with id ${object.storageId}. Error: ${reason}`);
		});
	}

	/**
	 * Get the players for a group.
	 *
	 * @param {Group} group The group to retrieve the players from.
	 * @returns {Promise<Player[]>} The players in the group.
	 * @memberof AppStorage
	 */
	public getPlayersForGroup(group: Group): Promise<Player[]> {
		if(this.playerCache.length === 0) {
			return this.getPlayers().then((players: Player[]) => {
				return this.getPlayersForGroupViaCache(group);
			});
		}
		else {
			return this.getPlayersForGroupViaCache(group);
		}
	}

	/**
	 * Get the players for a group from the cache.
	 *
	 * @private
	 * @param {Group} group The group to get the players from.
	 * @returns {Promise<Player[]>} The loaded players from the group.
	 * @memberof AppStorage
	 */
	private getPlayersForGroupViaCache(group: Group): Promise<Player[]> {
		let players: Player[] = [];
		group.playerIds.forEach((id: string) => {
			players.push(this.getPlayerFromCache(id));
		});

		return Promise.resolve(players);
	}

	/**
	 * Get a player from the cache using the player id.
	 *
	 * @private
	 * @param {string} id The storage id of the player to get.
	 * @returns {Player} The player that matches the storage id.
	 * @memberof AppStorage
	 */
	private getPlayerFromCache(id: string): Player {
		try{
			this.playerCache.forEach((player: Player) => {
				if(player.storageId === id) {
					throw player;
				}
			});
		}
		catch(player) {
			return player;
		}

		console.error(`Player with id ${id} could not be found.`);
		return null;
	}

    /**
	 * Persists an object to storage.
	 *
	 * @private
	 * @template T
	 * @param {string} collection The name of the collection to store the object to.
	 * @param {T} objectToAdd The object to persist to storage.
	 * @returns {Promise<T>} The Promise with the stored object. This should contain
	 * the storage id.
	 * @memberof AppStorage
	 */
	private addObject<T extends IStorageObject>(collection: string, objectToAdd: T): Promise<T> {
        let objectJson = JSON.parse(JSON.stringify(objectToAdd));
        return this.database.collection(collection).add(objectJson).then((docRef: firestore.DocumentReference): T => {
            objectToAdd.storageId = docRef.id
            return objectToAdd;
        }).catch((reason: any): T => {
            console.error(`Error adding object to ${collection} firebase collection. Error: ${reason}`);
            return null;
        });
    }

    /**
	 * Retrieves an array of objects from storage.
	 *
	 * @private
	 * @template T
	 * @param {string} collection The storage collection to retrieve the objects from.
	 * @param {string} cachePropertyName The name of the cache to store these objects to.
	 * @returns {Promise<T[]>}
	 * @memberof AppStorage
	 */
	private getObjects<T extends IStorageObject>(collection: string, cachePropertyName: string): Promise<T[]> {
        return this.database.collection(collection).get().then((results: firebase.firestore.QuerySnapshot): T[] => {
            this[cachePropertyName] = [];
            results.forEach((snapshot: firebase.firestore.QueryDocumentSnapshot) => {
                let rawPlayerData: firebase.firestore.DocumentData = snapshot.data();
                let object: any = {};
                for (let property in rawPlayerData) {
                    object[property] = rawPlayerData[property];
                }

                object.storageId = snapshot.id;
                this[cachePropertyName].push(object);
            });

            return this[cachePropertyName];
        }).catch((reason: any): T[]=> {
            console.error("Error querying the database for players. Error: ", reason);
            return [];
        });
    }
}
