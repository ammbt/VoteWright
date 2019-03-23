// Modules
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

// Main app.
import { VoteWright } from './app.component';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

// Pages
import { LoginPage } from '../pages/login/login';
import { PlayersPage } from '../pages/players/players';
import { GroupPage } from '../pages/group/group';

// Ionic components
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Service Providers
import { AppStorage } from '../services/app-storage';
import { Authentication } from '../services/authentication';

@NgModule({
  declarations: [
    VoteWright,
	LoginPage,
    PlayersPage,
    GroupPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(VoteWright),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    VoteWright,
	LoginPage,
    PlayersPage,
    GroupPage
  ],
  providers: [
	Authentication,
    StatusBar,
    SplashScreen,
    AppStorage,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
