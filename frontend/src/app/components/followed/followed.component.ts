import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';

import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { GLOBAL } from '../../services/global';

@Component({
	selector: 'app-followed',
	templateUrl: './followed.component.html',
	styleUrls: ['../users/users.component.css'] // --> Los estilos son los de Gente
})
export class FollowedComponent implements OnInit {
	public title    : string;
	public url      : string;
	public total    : string;
	public status   : string;
	public identity;
	public token;
	public page;			// Página actual
	public next_page;		// Página siguiente
	public prev_page;		// Página previa
	public pages;			// Total de páginas
	public paginas;			// Array con el número de páginas (para paginación)
	public follows; 		// Ids de los usuarios que estamos siguiendo
	public followed; 		// Array de los usuarios a los que estamos siguiendo
	public user_id;			// Usuario sobre el que mostramos resultado
	

	constructor(
		private _route        : ActivatedRoute,
		private _router       : Router,
		private _userService  : UserService,
		private _followService: FollowService
		) { 
		this.title    = "Gente que me sigue";
		this.url      = GLOBAL.url;
		this.identity = this._userService.getIdentity();
		this.token    = this._userService.getToken();
		this.user_id  = this.identity._id;
	}

	ngOnInit() {
		this.actualPage();
	}

	actualPage(){
		this._route.params.subscribe(params => {
			if(params['id']){
				this.user_id = params['id'];
			}
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
			this.getFollows(this.user_id, page);
		});
	}

	getFollows(user_id, page){
		this._followService.getFollowed(this.token, user_id, page).subscribe(
			response => {
				if(response.user.nick && (this.identity._id != response.user._id)){
					this.title = 'Seguidores de '+response.user.nick;
				}
				if(!response.follows){
					this.status = 'error';					
				}else{
					this.status = 'success';
					this.total = response.total;
					this.followed = response.follows;
					this.pages = response.pages;
					this.follows = response.users_followed;
					this.paginas = Array.from(Array(this.pages).keys());
					if(page > this.pages){ //--> si se pone una página incorrecta nos lleva a la primera
						this._router.navigate(['/siguiendo', this.user_id, 1]);
					}
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


	// Output --> ponemos la etiqueta "@Output" y la propiedad que es el evento
	@Output() sended = new EventEmitter();
	sendPublication(event){
		this.sended.emit({send:'true'});
	}

}
