import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class UserGuard implements CanActivate{
	public url:string;
	public identity
	public token;
	public stats;

	constructor(
		private _router: Router,
		private _userService: UserService
		){}

	canActivate(){
		let identity = this._userService.getIdentity();

		if(identity && (identity.role == 'ROLE_USER' || identity.role == 'ROLE_ADMIN')){
			return true;
		}else{
			this._router.navigate(['/login']);
			return false;
		}
	}
}