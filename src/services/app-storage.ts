import  firebase, { firestore } from 'firebase/app';
import 'firebase/firestore';
import { Injectable } from '@angular/core';

import appConfig from '../../app-config.json';
import { Player } from '../models/Player';
import { Group } from '../models/Group';

@Injectable()
export class AppStorage {
    private readonly playersCollection: string = "Players";
    private readonly groupsCollection: string = "Groups";
    private breakException: ExceptionInformation = {};

    private database: firestore.Firestore;

    private groupCache: Group[];
    private playerCache: Player[];

    constructor() {
        // Initialize Firebase
        let config = {
            apiKey: appConfig.firebaseKey,
            authDomain: appConfig.firebaseDomain,
            databaseURL: appConfig.firebaseURL,
            projectId: appConfig.firebaseProjectId,
            storageBucket: appConfig.firebaseStorageBucket,
            messagingSenderId: appConfig.firebaseMessagingSenderId
        };

        firebase.initializeApp(config);
        this.database = firebase.firestore();
        let settings: firestore.Settings = {
            timestampsInSnapshots: true
        };
        this.database.settings(settings);

        this.groupCache = [];
        this.playerCache = [];
    }

    public getPlayers(refresh: boolean = false): Promise<Player[]> {
        if(!refresh && this.playerCache.length > 0) {
            return Promise.resolve(this.playerCache);
        }

        return this.getObjects<Player>(this.playersCollection, 'playerCache');
    }

    public addPlayer(player: Player): Promise<Player> {
        let matchingPlayer: Player = this.playerCache.find((p: Player) => {
            return (p.storageId && p.storageId === player.storageId)
                || (p.firstName === player.firstName && p.lastName === player.lastName);
        });

        if(!matchingPlayer) {
            return this.addObject<Player>( this.playersCollection, player);
        }
    }

    public getGroups(refresh: boolean = false): Promise<Group[]> {
        if(!refresh && this.groupCache.length > 0) {
            return Promise.resolve(this.groupCache);
        }

        return this.getObjects<Group>(this.groupsCollection, 'groupCache');
    }

    public addGroup(group: Group): Promise<Group> {
        let matchingGroup: Group = this.groupCache.find((g: Group) => {
            if(g.storageId && g.storageId === group.storageId) {
                return true;
            }

            try {
                g.playerIds.forEach((id: string, index: number) => {
                    if(group.playerIds[index] !== id) {
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

	public updateGroup(group: Group): void {
		// We only want to store the properties we need.
		let storageGroup: Group = {
			playerIds: group.playerIds,
			playerPoints: group.playerPoints
		}

		this.database.collection(this.groupsCollection).doc(group.storageId).set(storageGroup).catch((reason: any) => {
			console.error(`Unable to update the group with id ${group.storageId}. Error: ${reason}`);
		}) ;
	}

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

	private getPlayersForGroupViaCache(group: Group): Promise<Player[]> {
		let players: Player[] = [];
		group.playerIds.forEach((id: string) => {
			players.push(this.getPlayerFromCache(id));
		});

		return Promise.resolve(players);
	}

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

    private addObject<T>(collection: string, objectToAdd: T): Promise<T> {
        let objectJson = JSON.parse(JSON.stringify(objectToAdd));
        return this.database.collection(collection).add(objectJson).then((docRef: firestore.DocumentReference): T => {
            objectToAdd['storageId'] = docRef.id
            return objectToAdd;
        }).catch((reason: any): T => {
            console.error(`Error adding object to ${collection} firebase collection. Error: ${reason}`);
            return null;
        });
    }

    private getObjects<T>(collection: string, cachePropertyName: string): Promise<T[]> {
        return this.database.collection(collection).get().then((results: firebase.firestore.QuerySnapshot): T[] => {
            this[cachePropertyName] = [];
            results.forEach((snapshot: firebase.firestore.QueryDocumentSnapshot) => {
                let rawPlayerData: firebase.firestore.DocumentData = snapshot.data();
                let object: any = {};
                for (let property in rawPlayerData) {
                    object[property] = rawPlayerData[property];
                }

                object['storageId'] = snapshot.id;
                this[cachePropertyName].push(object);
            });

            return this[cachePropertyName];
        }).catch((reason: any): T[]=> {
            console.error("Error querying the database for players. Error: ", reason);
            return [];
        });
    }
}
