import  firebase, { firestore } from 'firebase/app';
import 'firebase/firestore';
import { Injectable } from '@angular/core';

import appConfig from '../../app-config.json';
import { Player } from '../models/Player';

@Injectable()
export class Storage {

    private readonly playersCollection: string = "Players"

    private database: firestore.Firestore;

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

    }

    public getPlayers(): Promise<Player[]> {
        return this.database.collection(this.playersCollection).get()
            .then((results: firebase.firestore.QuerySnapshot) : Player[] => {
                let players: Player[] = [];
                results.forEach((snapshot: firebase.firestore.QueryDocumentSnapshot) => {
                    let rawPlayerData: firebase.firestore.DocumentData = snapshot.data();
                    let player: Player = new Player();
                    for (let property in rawPlayerData) {
                        player[property] = rawPlayerData[property];
                    }

                    players.push(player);
                })

                return players;
            }).catch((reason: any): Player[]=> {
                console.error("Error querying the database for players. Error: ", reason);
                return [];
            });
    }

    public addPlayer(player: Player): Promise<boolean> {
        // TODO: check that the player does not already exist yet.
        let playerJson = JSON.parse(JSON.stringify(player));
        return this.database.collection(this.playersCollection).add(playerJson).then((): boolean => {
            return true;
        }).catch((reason: any): boolean => {
            console.error(`Error adding the player ${player.name}. Error: ${reason}`);
            return false;
        });
    }
}