import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';

@Injectable()
export class Authentication {
	public firebaseUi: firebaseui.auth.AuthUI;
	constructor() {
		this.firebaseUi = new firebaseui.auth.AuthUI(firebase.auth());
	}
	public getFirebaseAuthConfig(): firebaseui.auth.Config {
		return {
			callbacks: {
				signInSuccessWithAuthResult: (authResult: firebase.auth.UserCredential) => {
					if(authResult.additionalUserInfo.isNewUser) {
						return false;
					}
					return false;
				}
			},
			credentialHelper: firebaseui.auth.CredentialHelper.NONE,
			signInOptions:[{
				provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
				scopes: [
					'email'
				]
			}]
		};
	}
}
