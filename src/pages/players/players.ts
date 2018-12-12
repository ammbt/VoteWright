import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';  

import  moment  from 'moment';

import { Storage } from '../../services/Storage';
import { Player } from '../../models/Player';
import { GroupPage } from '../group/group';
import { getSegmentsFromNavGroups } from 'ionic-angular/umd/navigation/url-serializer';
import { Group } from '../../models/Group';

@Component({
  selector: 'page-players',
  templateUrl: 'players.html'
})
export class PlayersPage {

    private players: Player[];
    private filteredPlayers: Player[];

    // Input fields.
    private playerFilterInput: string;
    private playerFirstName: string;
    private playerLastName: string;

    constructor(public navController: NavController, private storage: Storage) {
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

    public gotoGroupPage(): void {
        // If the group exists load it otherwise create a new group.
        let PlayerFoundException: ExceptionInformation = {};
        let PlayerNotFoundException: ExceptionInformation = {};
        let GroupMatchException: ExceptionInformation = {};
        this.getGroups().then((groups: Group[]) => {
            let groupMatch: Group;
            let selectedPlayers: Player[] = this.players.filter((player: Player) => {
                return player.isPlaying;
            });
            try{
                groups.forEach((group: Group) => {
                    try {
                        group.playerIds.forEach((memberId) => {
                            try {
                                selectedPlayers.forEach((player) => {
                                    if(player.storageId === memberId) {
                                        throw PlayerFoundException;
                                    }

                                    throw PlayerNotFoundException;                                    
                                });

                            }
                            catch(FoundPlayerException) {
                                // We found the player.
                            }

                        });    

                        groupMatch = group;
                        throw GroupMatchException;
                    }
                    catch(PlayerNotFoundException) {
                        // We weren't able to find a player in this group.
                    }
                });
            }
            catch(GroupMatchException) {}

            if(!groupMatch) {
                // We didn't find a matching group of players. Create a new one instead.
                let group: Group = new Group {
                    playerIds = [],
                    loadedPlayers = [],
                };
                this.addGroup(group);
                groupMatch = group;
            }

            this.navController.push(GroupPage, groupMatch);
        }).catch((reason: any) => {
            console.log(`There was an error loading the groups. Error ${reason}`);
        });
            
    }

    addGroup(group: Group): Promise<Group> {
        return this.storage.addGroup(group);
    }
    getGroups(): Promise<Group[]> {
        return this.storage.getGroups();
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
