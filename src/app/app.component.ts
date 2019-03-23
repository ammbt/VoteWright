import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PlayersPage } from '../pages/players/players';
import { LoginPage } from '../pages/login/login';
import firebase from 'firebase';
import appConfig from '../../app-config.json';

@Component({
  templateUrl: 'app.html'
})
export class VoteWright {
	@ViewChild(Nav) nav: Nav;

	rootPage: any = PlayersPage;

	pages: Array<{title: string, component: any}>;

	constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
		this.pages = [
			{ title: 'Players', component: PlayersPage }
		];

        // Initialize Firebase
        let config = {
            apiKey: appConfig.firebaseKey,
            authDomain: appConfig.firebaseDomain,
            databaseURL: appConfig.firebaseURL,
            projectId: appConfig.firebaseProjectId,
            storageBucket: appConfig.firebaseStorageBucket,
            messagingSenderId: appConfig.firebaseMessagingSenderId
        };

        firebase.initializeApp(config);

	}

	ngAfterViewInit() {
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
				// User is authenticated.
				this.setRootPage(PlayersPage);
			} else {
				// User is not authenticated.
				this.setRootPage(LoginPage);
			}
		});
	}

	setRootPage( page: any): void {
		this.nav.setRoot(page).then(() => {
			this.platform.ready().then(() => {
				// Okay, so the platform is ready and our plugins are available.
				// Here you can do any higher level native things you might need.
				this.statusBar.styleDefault();
				this.splashScreen.hide();
			  });
		});
	}

	openPage(page) {
		// Reset the content nav to have just this page
		// we wouldn't want the back button to show in this scenario
		this.nav.setRoot(page.component);
	}
}
