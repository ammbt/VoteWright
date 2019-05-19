import { Component, OnInit } from '@angular/core';
import { Group } from '../../models/Group';
import { AppStorage } from '../../services/app-storage';
import { Player } from '../../models/Player';
import { ToastController } from '@ionic/angular';
import * as moment from  'moment';
import { ActivatedRoute } from '@angular/router';

/**
 * The view model for a group page. This should show the players in the group, their points
 * and allow the user to select a player or players who won the vote.
 */
@Component({
    selector: 'page-group',
    templateUrl: 'group.html'
})
export class GroupPage implements OnInit {
	// These fields are bound to the view. If these are changed the bindings should
	// be updated in the html view template.
	public group: Group;
	public arePlayersSelected: boolean = false;
	public isEditMode: boolean = false;

	constructor(private appStorage: AppStorage, public toastController: ToastController,
			public route: ActivatedRoute) {
	}

	ngOnInit() {
		// The group passed in via navigation. This is required, otherwise there is no group
		// to display.
		this.route.data.subscribe((data: { group: Group }) => {
			this.group = data.group
		});

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
			// Turn off edit mode if user selects a player (checkbox)
			this.toggleEditMode();
		}

		let playersSelected: Player[] = this.group.loadedPlayers.filter((player: Player) => {
			return player.isSelected;
		});

		this.arePlayersSelected = playersSelected.length > 0;
	}

	/**
	 * Toggles the edit functionality.
	 */
	public async toggleEditMode(): Promise<void> {
		this.isEditMode = !this.isEditMode;

		// if true, toast to let people know editing is enabled, otherwise toast to let them know editing mode is disabled
		let message: string = 'Editing mode disabled.';
		if (this.isEditMode) {
			message = 'Editing mode enabled. Don\'t cheat like a cheater.';
		}

		const toastNoEdit = await this.toastController.create({
			message: message,
			duration: 3000
		});

		await toastNoEdit.present();
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