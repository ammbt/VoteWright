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
  }

}
