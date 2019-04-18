import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import  moment  from 'moment';
import { AppStorage } from '../../services/app-storage';
import { Player } from '../../models/Player';
import { GroupPage } from '../group/group';
import { Group } from '../../models/Group';

/**
 * The view model for a player page. This should show the players and allow them
 * to be selected to form a group.
 */
@Component({
    selector: 'page-players',
    templateUrl: 'players.html'
})
export class PlayersPage {

	private players: Player[];

	// These fields are bound to the view. If these are changed the bindings should
	// be updated in the html view template.
	public filteredPlayers: Player[];
	public arePlayersSelected: boolean;
	public sortByMostRecentlyPlayed: boolean;

	// These fields are bound to user input fields. If these are changed the bindings
	// should be updated in the html view template.
    private playerFilterInput: string;
    private playerFirstName: string;
    private playerLastName: string;

    constructor(public navController: NavController, private appStorage: AppStorage, public toastController: ToastController) {
		this.players = [];
        this.filteredPlayers = [];
		this.loadPlayers();
    }

	/**
	 * This fires when input changes in the search filter. This performs the actual
	 * filtering and updates the bound data models with the filtered results.
	 */
    public onInputFilterResults(): void {
		// Only filter the results if the input is not null or empty.
        if (this.playerFilterInput && this.playerFilterInput.length > 0) {
            this.filteredPlayers = this.players.filter((player: Player) => {
				// This regular expression matches anything(.*) then the filter input,
				// followed by anything(.*) and ignores case.
                let regex = new RegExp( `.*${this.playerFilterInput}.*`, "i");
                let matchesFirstName: RegExpMatchArray = player.firstName.match(regex);
				let matchesLastName: RegExpMatchArray = player.lastName.match(regex);

				// If either the first or last name matches any of the filter input
				// then we want to include this player in the filtered results.
                if ((matchesFirstName && matchesFirstName.length > 0) || (matchesLastName && matchesLastName.length > 0)) {
                    return true;
                }
            });
        }
        else {
			// If the filter is empty don't filter at all.
            this.filteredPlayers = this.players;
        }
    }

	/**
	 * This fires when the filter UI is cleared or cancelled.
	 */
    public onClearOrCancelFilter(): void {
        this.filteredPlayers = this.players;
        this.playerFilterInput = "";
    }

	/**
	 * Checks if string is only whitespace (tabs, spaces, etc.)
	 *
	 * @param str String to check
	 */
	private isEmptyString(str: String): boolean {
		return !str.trim().length;
	}

	/**
	 * This fires when the UI for adding a player is activated.
	 */
	public addPlayer(): void {

		// Check if the first or last name is just whitespace.
		if (this.isEmptyString(this.playerFirstName) || this.isEmptyString(this.playerLastName)) {

			// If the first or last name is just whitespace, display a message, and do not add new player to database.
			const toast = this.toastController.create({
				message: 'Please enter a first and last name for the new player. Don\'t just enter spaces. That\'s just rude.',
				duration: 3000
			  });

			  toast.present();
		}
		else {
			// If the first and last name are not just whitespace, enter new player to database.
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
    }

	/**
	 * This fires when the UI for navigating to a group is activated.
	 * This performs the logic for determining if a group is a new group or not
	 * and either creating the new group or loading the existing group and
	 * handing it off to the group page.
	 */
    public gotoGroupPage(): void {
        // First off load all the groups.
        this.getGroups().then((groups: Group[]) => {
			let groupMatch: Group;

			// Filter down to only the selected players.
            let selectedPlayers: Player[] = this.players.filter((player: Player) => {
                return player.isSelected;
            });

            try{
				// Go through each group and see if the group has the same # of players
				// as selected and that all those players are the players in the group.
				// If all of that is true then the group is a match.
                groups.forEach((group: Group) => {
                    try {
                        if(group.playerIds.length === selectedPlayers.length) {
                            group.playerIds.forEach((memberId) => {
                                try {
                                    selectedPlayers.forEach((player) => {
                                        if(player.storageId === memberId) {
											// Short circuit the foreach loop since we
											// found the player.
                                            throw { playerFound: true };
                                        }

                                    });

									// We've gone through all the players and no match.
									// Short circuit the group loop since this can't
									// be the right group.
									throw { playerFound: false };
                                }
                                catch(playerFoundBreakException) {
                                    if(!playerFoundBreakException.playerFound) {
										// Player not found in this group, re-throw to
										// continue the short circuit of the group's
										// player loop.
                                        throw playerFoundBreakException;
                                    }

									// The player was found. Continue checking the rest
									// of the players in this group.
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


    /**
	 * Persists a new group to storage.
	 *
	 * @param {Group} group The group to persist
	 * @returns {Promise<Group>} The resulting Promise with the stored group.
	 * @memberof PlayersPage
	 */
	public addGroup(group: Group): Promise<Group> {
        return this.appStorage.addGroup(group);
	}


	/**
	 * Makes necessary changes when a player is selected.
	 *
	 * @memberof PlayersPage
	 */
	public updatePlayersSelected(): void {
		let playersSelected: Player[] = this.players.filter((player: Player) => {
			return player.isSelected;
		});

		this.arePlayersSelected = playersSelected.length > 0;
	}

	/**
	 * Sorts the players.
	 *
	 * @memberof PlayersPage
	 */
	public sortPlayers(): void {
		if(this.sortByMostRecentlyPlayed) {
			this.players = this.sortPlayersByLastedPlayDate(this.players);
		}
		else {
			this.players = this.sortPlayersAlphabetically(this.players);
		}
	}

	/**
	 * Load the groups from storage.
	 *
	 * @private
	 * @returns {Promise<Group[]>} The Promise with groups from storage.
	 * @memberof PlayersPage
	 */
	private getGroups(): Promise<Group[]> {
        return this.appStorage.getGroups();
    }

    /**
	 * Loads the players from storage.
	 *
	 * @private
	 * @param {boolean} [refresh=false] Storage will load the players from cache unless
	 * refresh is true.
	 * @memberof PlayersPage
	 */
	private loadPlayers(refresh: boolean = false): void {
        this.appStorage.getPlayers(refresh).then((loadedPlayers: Player[]): void => {
			this.players = loadedPlayers;
			this.sortPlayers();
			this.onClearOrCancelFilter();
        } ).catch((reason:any) => {
			console.error("There was an error loading the players." + reason);
		});
	}

	/**
	 * Sorts an array of Players by their first then last name.
	 *
	 * @param players The array of players to sort.
	 * @returns {Player[]} The sorted array of players.
	 * @memberof PlayersPage
	 */
	private sortPlayersAlphabetically(players: Player[]): Player[] {
		return players.sort((playerA: Player, playerB: Player) => {
			if (playerA.firstName > playerB.firstName || (playerA.firstName === playerB.firstName && playerA.lastName > playerB.lastName)) {
				// playerA sorts before playerB
				return 1;
			}

			if (playerA.firstName < playerB.firstName || (playerA.firstName === playerB.firstName && playerA.lastName < playerB.lastName)) {
				// playerB sorts before playerA
				return -1;
			}

			// The names are identical.
			return 0;
		});
	}

	/**
	 * Sorts an array of Players by their last play date, from most recently played to least.
	 *
	 * @param players The array of players to sort.
	 * @returns {Player[]} The sorted array of players.
	 * @memberof PlayersPage
	 */
	private sortPlayersByLastedPlayDate(players: Player[]): Player[] {
		return players.sort((playerA: Player, playerB: Player) => {
			if(playerA.lastPlayDate > playerB.lastPlayDate) {
				return -1;
			}

			if(playerA.lastPlayDate === playerB.lastPlayDate) {
				return 0;
			}

			if(playerA.lastPlayDate < playerB.lastPlayDate) {
				return 1;
			}
		});
	}
}
