import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import appConfig from '../../app-config.json';
import * as firebase from 'firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class VoteWright {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {

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

    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
