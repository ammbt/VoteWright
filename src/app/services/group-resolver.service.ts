import { AppStorage } from './app-storage';
import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
}                                 from '@angular/router';
import { Observable, of, EMPTY, from }  from 'rxjs';
import { mergeMap, take }         from 'rxjs/operators';
import { Group } from '../models/Group';



@Injectable({
  providedIn: 'root',
})
export class GroupResolverService implements Resolve<Group> {
  constructor(private appStorage: AppStorage, private router: Router) {}

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Group> | Observable<never> {
    let id = route.paramMap.get('id');

    return from(this.appStorage.getGroups().then((groups: Group[]) => {
		let group =  groups.find( (group: Group) =>
			group.storageId == id
		);

			return group;
	}))
  }
}
