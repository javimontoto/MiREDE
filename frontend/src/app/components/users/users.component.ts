import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { GLOBAL } from '../../services/global';


import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';


@Component({
	selector   : 'app-users',
	templateUrl: './users.component.html',
	styleUrls  : ['./users.component.css']
})
export class UsersComponent implements OnInit {
	public title  : string;
	public total  : string;
	public status : string;
	public url    : string;
	public users  : User[];	// Array con los usuarios
	public loading: boolean;
	public identity;
	public token;
	public page;			// Página actual
	public next_page;		// Página siguiente
	public prev_page;		// Página previa
	public pages;			// Total de páginas
	public paginas;			// Array con el número de páginas (para paginación)
	public follows; 		// Usuarios que estamos siguiendo

	constructor(
		private _route        : ActivatedRoute,
		private _router       : Router,
		private _userService  : UserService,
		private _followService: FollowService
		) { 
		this.title    = "Gente";
		this.identity = this._userService.getIdentity();
		this.token    = this._userService.getToken();
		this.url      = GLOBAL.url;
		this.loading  = true;
	}

	ngOnInit() {
		this.actualPage();
	}

	actualPage(){
		this._route.params.subscribe(params => {
			let page = 1;

			if(params['page']) {
				page = +params['page']; //--> con el signo +, convertimos a entero
			}
			this.page = page;
			this.next_page = page+1;
			this.prev_page = page-1;
			if(this.prev_page <= 0){
				this.prev_page = 1;
			}

			// devolver listado de usuarios
			this.getUsers(page);
		});
	}

	getUsers(page){
		this._userService.getUsers(page).subscribe(
			response => {
				if(!response.users){
					this.loading = false;
					this.status = 'error';
				}else{
					this.loading = false;
					this.status = 'success';
					this.total = response.total;
					this.users = response.users;
					this.pages = response.pages;
					this.follows = response.users_following;
					this.paginas = Array.from(Array(this.pages).keys());
					//Array.apply(null, {length: this.pages}).map(Number.call, Number);
					if(page > this.pages){ //--> si se pone una página incorrecta nos lleva a la primera
						this._router.navigate(['/gente',1]);
					}
				}
			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				if(errorMessage != null){
					this.loading = false;
					this.status = 'error';
				}
			}
			);
	}

	/** Método para serguir a un usario "followed" **/
	followUser(followed){
		var follow = new Follow('', this.identity._id, followed);

		this._followService.addFollow(this.token, follow).subscribe(
			response => {
				if(!response.follow){
					this.status = 'error';
				}else{
					this.status = 'success';
					this.follows.push(followed);
					this._userService.updateMyStats('following',1);
				}
			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				if(errorMessage != null){
					this.status = 'error';
				}
			}
			);
	}

	/** Método para dejar de serguir a un usario "followed" **/
	deleteFollowUser(followed){
		this._followService.deleteFollow(this.token, followed).subscribe(
			response => {
				var search = this.follows.indexOf(followed);
				if(search != -1){
					this.follows.splice(search, 1);
					this._userService.updateMyStats('following',-1);
				}
			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				if(errorMessage != null){
					this.status = 'error';
				}
			}
			);
	}

}
