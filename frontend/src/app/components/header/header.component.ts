import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from '../../services/user.service';
import { GLOBAL } from '../../services/global';

@Component({
	selector   : 'app-header',
	templateUrl: './header.component.html',
	styleUrls  : ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {
	public title: string;
	public url  : string;
	public identity;

	constructor(
		private _userService: UserService,
		private _route      : ActivatedRoute,
		private _router     : Router,
		) {
		this.title = "MiREDE";
		this.url = GLOBAL.url;
	}

	ngOnInit() {
		this.identity = this._userService.getIdentity();
	}

	/** El método ngDoCheck() está predefinido y sirve para que cada vez que haya un cambio se actualice **/
	ngDoCheck(){
		this.identity = this._userService.getIdentity();
	}

	logout(){
		localStorage.clear();
		this.identity = null;
		this._router.navigate(['/']);
		location.reload(); // --> para forzar la recarga de home
	}

}
