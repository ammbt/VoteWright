import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import  moment  from 'moment';

import { Storage } from './../../services/Storage';
import { Player } from '../../models/Player';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

    players: Player[];

    // Input fields.
    private playerName: string;

    constructor(public navCtrl: NavController, private storage: Storage) {
        this.loadPlayers();
    }

    loadPlayers(): void {
        this.storage.getPlayers().then((loadedPlayers: Player[]): void => {
            this.players = loadedPlayers;
        } );
    }

    addPlayer(): void {
        let player: Player =  {
            name: this.playerName,
            lastPlayDate: moment().format()
        };

        this.storage.addPlayer(player).then((success: boolean) => {
            if(success) {
                this.playerName = "";
                this.loadPlayers();
            }
        });
    }
}
