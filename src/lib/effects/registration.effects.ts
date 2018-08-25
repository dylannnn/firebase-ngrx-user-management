import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';

import {AngularFireAuth} from 'angularfire2/auth';

import {catchError, exhaustMap, map} from 'rxjs/operators';
import * as userActions from '../actions/auth.actions';
import {from, Observable, of} from 'rxjs';
import * as firebase from 'firebase';

export type Action = userActions.AuthActionsUnion;

@Injectable()
export class RegistrationEffects {

  constructor(private actions: Actions,
              private afAuth: AngularFireAuth) {
  }

  @Effect()
  googleSignUp: Observable<Action> = this.actions.pipe(
    ofType(userActions.AuthActionTypes.GoogleRegistration),
    map((action: userActions.GoogleRegistration) => action.payload),
    exhaustMap(payload => {
      return from(this.doGoogleRegistration()).pipe(
        map(credential => {
          return new userActions.RegistrationCompleted();
        }),
        catchError(error => of(new userActions.AuthError(error)))
      );
    })
  );

  @Effect()
  facebookSignUp: Observable<Action> = this.actions.pipe(
    ofType(userActions.AuthActionTypes.FacebookRegistration),
    map((action: userActions.FacebookRegistration) => action.payload),
    exhaustMap(payload => {
      return from(this.doFacebookRegistration()).pipe(
        map(credential => {
          return new userActions.RegistrationCompleted();
        }),
        catchError(error => of(new userActions.AuthError(error)))
      );
    })
  );

  @Effect()
  signUpWithCredentials: Observable<Action> = this.actions.pipe(
    ofType(userActions.AuthActionTypes.CredentialsRegistration),
    map((action: userActions.CredentialsRegistration) => {
      return {
        email: action.payload.email,
        password: action.payload.password
      };
    }),
    exhaustMap(credentials => {
      return from(this.doSignUpWithCredentials(credentials)).pipe(
        map(p => {
          // successful login
          return new userActions.RegistrationCompleted();
        }),
        catchError(error => of(new userActions.AuthError(error)))
      );
    })
  );

  private doFacebookRegistration(): Promise<any> {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.afAuth.auth.signInWithPopup(provider);
  }

  private doGoogleRegistration(): Promise<any> {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.auth.signInWithPopup(provider);
  }

  private doSignUpWithCredentials(credentials: { email: string, password: string }): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
  }
}
