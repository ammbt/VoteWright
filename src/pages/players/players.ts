import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import  moment  from 'moment';
import { AppStorage } from '../../services/app-storage';
import { Player } from '../../models/Player';
import { GroupPage } from '../group/group';
import { Group } from '../../models/Group';

@Component({
    selector: 'page-players',
    templateUrl: 'players.html'
})
export class PlayersPage {

    private players: Player[];
	private filteredPlayers: Player[];
	public arePlayersSelected: boolean;

    // Input fields.
    private playerFilterInput: string;
    private playerFirstName: string;
    private playerLastName: string;

    constructor(public navController: NavController, private appStorage: AppStorage) {
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

        this.appStorage.addPlayer(player).then((player: Player) => {
            if(player) {
                this.playerFirstName = "";
                this.playerLastName = "";
                this.loadPlayers(/*refresh*/ true);
            }
        });
    }

    public gotoGroupPage(): void {
        // If the group exists load it otherwise create a new group.
        this.getGroups().then((groups: Group[]) => {
            let groupMatch: Group;
            let selectedPlayers: Player[] = this.players.filter((player: Player) => {
                return player.isPlaying;
            });

            try{
                groups.forEach((group: Group) => {
                    try {
                        if(group.playerIds.length === selectedPlayers.length) {
                            group.playerIds.forEach((memberId) => {
                                try {
                                    selectedPlayers.forEach((player) => {
                                        if(player.storageId === memberId) {
                                            throw { playerFound: true };
                                        }

                                    });

									throw { playerFound: false };
                                }
                                catch(playerFoundBreakException) {
                                    if(!playerFoundBreakException.playerFound) {
										// Player not found in this group.
                                        throw playerFoundBreakException;
                                    }

                                    // The player was found.
                                }
                            });

                            // All players are in this group.
                            groupMatch = group;
                            throw { playerFound: true, groupMatch: true };
                        }
                    }
                    catch(playerNotFoundBreakException) {
                        if(!playerNotFoundBreakException.playerFound) {
                            // We weren't able to find a player in this group.

                        }
                        else {
                            // We should have the group with all players at this point.
                            // throw an exception to short circuit the loops.
                            throw playerNotFoundBreakException;
                        }
                    }
                });
            }
            catch(groupMatchBreakException) {}

            if(!groupMatch) {
				// We didn't find a matching group of players. Create a new one instead.

                let group: Group = {
                    playerIds: selectedPlayers.map((player) => { return player.storageId; }),
					playerPoints: {}
				};

				// Since this is a new group then the player points won't be setup yet.
				group.playerIds.forEach((id: string) => {
					group.playerPoints[id] = 1;
				});

				this.addGroup(group).then((addedGroup: Group) => {
					group.storageId = addedGroup.storageId;
					group.loadedPlayers = selectedPlayers;
					this.navController.push(GroupPage, { 'group': group });
				});

			}
			else {
				this.navController.push(GroupPage, { 'group': groupMatch });
			}

        }).catch((reason: any) => {
            console.error(`There was an error loading the groups. Error ${reason}`);
        });

    }

    public addGroup(group: Group): Promise<Group> {
        return this.appStorage.addGroup(group);
	}

	public updatePlayersSelected(): void {
		let playersSelected: Player[] = this.players.filter((player: Player) => {
			return player.isPlaying;
		});

		this.arePlayersSelected = playersSelected.length > 0;
	}

	private getGroups(): Promise<Group[]> {
        return this.appStorage.getGroups();
    }

    private loadPlayers(refresh: boolean = false): void {
        this.appStorage.getPlayers(refresh).then((loadedPlayers: Player[]): void => {
			this.players = loadedPlayers;
			this.onClearOrCancelFilter();
        } );
    }
}
