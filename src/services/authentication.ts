import * as firbaseui from 'firebaseui';
import firebase from 'firebase';
import { Injectable } from '@angular/core';

@Injectable()
export class Authentication {
	public firebaseUi: firebaseui.auth.AuthUI;
	constructor() {
		this.firebaseUi = new firbaseui.auth.AuthUI(firebase.auth());
	}
	public getFirebaseAuthConfig(): firbaseui.auth.Config {
		return {
			callbacks: {
				signInSuccessWithAuthResult: (authResult: firebase.auth.UserCredential) => {
					if(authResult.additionalUserInfo.isNewUser) {
						return false;
					}
					return false;
				}
			},
			credentialHelper: firbaseui.auth.CredentialHelper.NONE,
			signInOptions:[{
				provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
				scopes: [
					'email'
				]
			}]
		};
	}
}
