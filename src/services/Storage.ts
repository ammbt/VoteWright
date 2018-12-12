import  firebase, { firestore } from 'firebase/app';
import 'firebase/firestore';
import { Injectable } from '@angular/core';

import appConfig from '../../app-config.json';
import { Player } from '../models/Player';
import { Group } from '../models/Group';

@Injectable()
export class Storage {

    private readonly playersCollection: string = "Players";
    private readonly groupsCollection: string = "Groups";

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

        return this.getObjects<Player>(this.playersCollection, this.playerCache);
    }

    public addPlayer(player: Player): Promise<boolean> {
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

        return this.getObjects<Group>(this.groupsCollection, this.groupCache);
    }

    public addGroup(group: Group): Promise<boolean> {
        let matchingGroup: Group = this.groupCache.find((g: Group) => {
            if(g.storageId && g.storageId === group.storageId) {
                return true;
            }

            let breakException: ExceptionInformation = {};
            try {
                g.memberIds.forEach((id: string, index: number) => {
                    if(group.memberIds[index] !== id) {
                        throw breakException;
                    }
                });
            }
            catch(breakException) {
                return false;
            }

            return true;
        });

        if(!matchingGroup) {
            return this.addObject<Group>(this.groupsCollection, group);
        }
    }

    private addObject<T>(collection: string, objectToAdd: T): Promise<boolean> {
        let objectJson = JSON.parse(JSON.stringify(objectToAdd));
        return this.database.collection(collection).add(objectJson).then((): boolean => {
            // Maybe add the item to it's respective cache here rather than needing to refresh?
            return true;
        }).catch((reason: any): boolean => {
            console.error(`Error adding object to ${collection} firebase collection. Error: ${reason}`);
            return false;
        });
    }

    private getObjects<T>(collection: string, cache: T[]): Promise<T[]> {
        return this.database.collection(collection).get().then((results: firebase.firestore.QuerySnapshot): T[] => {
            cache = [];
            results.forEach((snapshot: firebase.firestore.QueryDocumentSnapshot) => {
                let rawPlayerData: firebase.firestore.DocumentData = snapshot.data();
                let object: any = {};
                for (let property in rawPlayerData) {
                    object[property] = rawPlayerData[property];
                }

                object['storageId'] = snapshot.id;
                cache.push(object);
            });

            return cache;
        }).catch((reason: any): T[]=> {
            console.error("Error querying the database for players. Error: ", reason);
            return [];
        });
    }
}