import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { VoteWright } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginPage } from './pages/login/login';
import { PlayersPage } from './pages/players/players';
import { GroupPage } from './pages/group/group';
import { Authentication } from './services/authentication';
import { AppStorage } from './services/app-storage';

@NgModule({
	declarations: [
		VoteWright,
		LoginPage,
		PlayersPage,
		GroupPage],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule],
	// providers: [
	// 	Authentication,
	// 	StatusBar,
	// 	SplashScreen,
	// 	AppStorage,
	// 	{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	// ],
	bootstrap: [VoteWright]
	})
	export class AppModule {}
