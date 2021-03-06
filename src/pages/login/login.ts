import { Authentication } from './../../services/authentication';
import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { PrivacyPolicyPage } from '../privacyPolicy/privacyPolicy';

@Component({
	selector: 'page-login',
	templateUrl: 'login.html'
  })
  export class LoginPage {
	constructor(public navController: NavController, public navParams: NavParams, private auth: Authentication) {
	}

	ionViewDidLoad() {
	  // The start method will wait until the DOM is loaded.
	  this.auth.firebaseUi.start('#firebaseui-auth-container', this.auth.getFirebaseAuthConfig());
	}

    navigateToPrivacyPolicy() {
        this.navController.push(PrivacyPolicyPage);
    }
  }
