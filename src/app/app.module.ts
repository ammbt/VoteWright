// Modules
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';

// Main app.
import { MyApp } from './app.component';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

// Pages
import { PlayersPage } from '../pages/players/players';
import { GroupPage } from '../pages/group/group';

// Ionic components
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// Service Providers
import { Storage } from './../services/Storage';

@NgModule({
  declarations: [
    MyApp,
    PlayersPage,
    GroupPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    PlayersPage,
    GroupPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Storage,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
