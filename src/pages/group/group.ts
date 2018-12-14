import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Group } from '../../models/Group';

@Component({
    selector: 'page-group',
    templateUrl: 'group.html'
})
export class GroupPage {
    private group: Group;

	constructor(public navCtrl: NavController, public navParams: NavParams) {
		this.group = navParams.data['group'] as Group;

		// If this is a new group then the player points won't be setup yet.
		if(!this.group.playerPoints || this.group.playerPoints.length === 0 ) {
			this.group.playerIds.forEach((id: string) => {
				// TODO: bug here it's not using the id string, just 'id'.
				this.group.playerPoints.push({ id: 1 });
			})
		}
	}
}
