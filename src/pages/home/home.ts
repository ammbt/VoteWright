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

    private players: Player[];
    private filteredPlayers: Player[];

    // Input fields.
    private playerFilterInput: string;
    private playerFirstName: string;
    private playerLastName: string;

    constructor(public navCtrl: NavController, private storage: Storage) {
        this.players = [];
        this.filteredPlayers = [];
        this.loadPlayers();
    }

    public onInputFilterResults(): void {
        if (this.playerFilterInput && this.playerFilterInput.length > 0) {
            this.filteredPlayers = this.players.filter((player: Player) => {
                let regex = new RegExp( `.*${this.playerFilterInput}.*`, "i");
                let matchesFirstName: RegExpMatchArray = player.firstName.match(regex);
                let matchesLastName: RegExpMatchArray = player.lastName.match(regex);
                if ((matchesFirstName && matchesFirstName.length > 0) || (matchesLastName && matchesLastName.length > 0)) {
                    return true;
                }
            });
        }
        else {
            this.filteredPlayers = this.players;
        }
    }

    public onClearOrCancelFilter(): void {
        this.filteredPlayers = this.players;
        this.playerFilterInput = "";
    }

    public addPlayer(): void {
        let player: Player =  {
            firstName: this.playerFirstName,
            lastName: this.playerLastName,
            lastPlayDate: moment().format()
        };

        this.storage.addPlayer(player).then((success: boolean) => {
            if(success) {
                this.playerFirstName = "";
                this.playerLastName = "";
                this.loadPlayers(/*refresh*/ true);
            }
        });
    }

    private loadPlayers(refresh: boolean = false): void {
        this.storage.getPlayers(refresh).then((loadedPlayers: Player[]): void => {
            if(this.filteredPlayers.length === 0) {
                this.filteredPlayers = loadedPlayers;
            }

            this.players = loadedPlayers;
        } );
    }
}
