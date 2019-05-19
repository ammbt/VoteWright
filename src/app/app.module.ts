import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { VoteWright } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { Authentication } from './services/authentication';
import { AppStorage } from './services/app-storage';

@NgModule({
	declarations: [
		VoteWright],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule],
	providers: [
		Authentication,
		StatusBar,
		SplashScreen,
		AppStorage,
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
	],
	bootstrap: [VoteWright]
	})
	export class AppModule {}
