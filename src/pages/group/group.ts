import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Group } from '../../models/Group';
import { AppStorage } from '../../services/app-storage';
import { Player } from '../../models/Player';
import  moment  from 'moment';

@Component({
    selector: 'page-group',
    templateUrl: 'group.html'
})
export class GroupPage {
	public group: Group;
	public arePlayersSelected: boolean = false;

	constructor(public navCtrl: NavController, private appStorage: AppStorage, public navParams: NavParams) {
		this.group = navParams.data['group'] as Group;

		if(!this.group.loadedPlayers) {
			this.appStorage.getPlayersForGroup(this.group).then((players: Player[]) => {
				this.group.loadedPlayers = players;
				this.setupPlayers();
			});
		}
		else {
			this.setupPlayers();
		}
	}

	public updatePlayersSelected(): void {
		let playersSelected: Player[] = this.group.loadedPlayers.filter((player: Player) => {
			return player.isPlaying;
		});

		this.arePlayersSelected = playersSelected.length > 0;
	}

	public updatePoints(): void {
		this.group.loadedPlayers.forEach((player: Player) => {
			if(player.isPlaying) {
				player.points = 1;
				player.isPlaying = false;
			}
			else {
				player.points++;
			}

			this.group.playerPoints[player.storageId] = player.points;
		});

		// Save the points to the persisted storage.
		this.appStorage.updateGroup(this.group);
	}

	private setupPlayers(): void {
		this.group.loadedPlayers.forEach((player: Player) => {
			// Map the points for this player to the loaded player.
			player.points = this.group.playerPoints[player.storageId];

			// Update the last play date to the current date.
			player.lastPlayDate = moment().format();

			// Reset this since we use this to track whether the player won the vote or not.
			player.isPlaying = false;
		});
	}

}
