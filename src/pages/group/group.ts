import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Group } from '../../models/Group';
import { AppStorage } from '../../services/app-storage';
import { Player } from '../../models/Player';

@Component({
    selector: 'page-group',
    templateUrl: 'group.html'
})
export class GroupPage {
    public group: Group;

	constructor(public navCtrl: NavController, private appStorage: AppStorage, public navParams: NavParams) {
		this.group = navParams.data['group'] as Group;

		if(!this.group.loadedPlayers) {
			this.appStorage.getPlayersForGroup(this.group).then((players: Player[]) => {
				this.group.loadedPlayers = players;
				this.mapPointsToPlayers();
			});
		}
		else {
			this.mapPointsToPlayers();
		}
	}

	private mapPointsToPlayers(): void {
		this.group.loadedPlayers.forEach((player: Player) => {
			player.points = this.group.playerPoints[player.storageId]
		});
	}
}
