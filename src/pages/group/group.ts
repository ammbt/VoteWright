import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Group } from '../../models/Group';
import { AppStorage } from '../../services/app-storage';
import { Player } from '../../models/Player';
import  moment  from 'moment';

/**
 * The view model for a group page. This should show the players in the group, their points
 * and allow the user to select a player or players who won the vote.
 */
@Component({
    selector: 'page-group',
    templateUrl: 'group.html'
})
export class GroupPage {
	// These fields are bound to the view. If these are changed the bindings should
	// be updated in the html view template.
	public group: Group;
	public arePlayersSelected: boolean = false;
	public isEditMode: boolean = false;

	constructor(public navCtrl: NavController, private appStorage: AppStorage, public toastController: 			ToastController,
			public navParams: NavParams) {
		// The group passed in via navigation. This is required, otherwise there is no group
		// to display.
		this.group = navParams.data['group'] as Group;

		// Special assert syntax x!.property says asserts that x must be non-null.
		// Here we are saying group must be non-null.
		if(!this.group!.loadedPlayers) {
			// Load the players since we don't have them yet.
			this.appStorage.getPlayersForGroup(this.group).then((players: Player[]) => {
				this.group.loadedPlayers = players;
				this.setupPlayers();
			});
		}
		else {
			this.setupPlayers();
		}
	}

	/**
	 * Updates anything when player selection changes. This is bound to the player
	 *  selection UI (checkbox).
	 */
	public updatePlayersSelected(): void {
		if (this.isEditMode) {
			this.isEditMode = false;
		}

		let playersSelected: Player[] = this.group.loadedPlayers.filter((player: Player) => {
			return player.isSelected;
		});

		this.arePlayersSelected = playersSelected.length > 0;
	}

	/**
	 * Toggles the edit functionality.
	 */
	public toggleEditMode(): void {
		this.isEditMode = !this.isEditMode;
		//if true toast to let peaple know editting is enabled if true and otherwise toast to let them know editting mode is disabled
		if (this.isEditMode) {
			const toast = this.toastController.create({
				message: 'Editting mode enabled. Don\'t cheat like a cheater.',
				duration: 3000
			  });
		}
		else{
			const toast = this.toastController.create({
				message: 'Editting mode disabled.',
				duration: 3000
			  });
		}

		toast.present();
	}

	/**
	 * Persists manually edited points. This is bound to the player.points (which
	 * does not persist) in the UI. To be used when a mistake was made upon incorrect/accidental
	 * use of updatePoints().
	 */
	public updatePointsChanged(): void {
		if (this.isEditMode) {
			this.updatePointsHelper();
		}
	}

	/**
	 * Update the points for the players based on whether the players is selected
	 * (won) the vote.
	 */
	public updatePoints(): void {
		this.updatePointsHelper();
		this.updatePlayersSelected();
	}

	/**
	 * Helper method used to edit points (manually) and update points (through the
	 * use of the checkboxes).
	 */
	private updatePointsHelper(): void {
		this.group.loadedPlayers.forEach((player: Player) => {
			if (!this.isEditMode) {
				if(player.isSelected) {
					// If the player won the vote reset their points and unselect them.
					player.points = 1;
					player.isSelected = false;
				}
				else {
					// The player did not win the vote, increase their points.
					player.points++;
				}
			}

			// Update the player point mappings so that we can persist them.
			this.group.playerPoints[player.storageId] = player.points;
		});

		// Save the points to the persisted storage.
		this.appStorage.updateGroup(this.group);
	}

	/**
	 * Do some basic setup on the loaded players.
	 */
	private setupPlayers(): void {
		this.group.loadedPlayers.forEach((player: Player) => {
			// Map the points for this player to the loaded player.
			player.points = this.group.playerPoints[player.storageId];

			// Update the last play date to the current date.
			player.lastPlayDate = moment().format();

			// Reset this since we use this to track whether the player won the vote or not.
			player.isSelected = false;

			// Persist the player so that we capture the last play date.
			this.appStorage.updatePlayer(player);
		});
	}
}
