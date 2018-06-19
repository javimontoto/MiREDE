import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';

import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { GLOBAL } from '../../services/global';

/* jQUERY */
declare var jQuery:any;
declare var $:any;

@Component({
	selector: 'app-following',
	templateUrl: './following.component.html',
	styleUrls: ['../users/users.component.css'] // --> Los estilos son los de Gente
})
export class FollowingComponent implements OnInit {
	public title  : string;
	public url    : string;
	public total  : string;
	public status : string;
	public loading: boolean;
	public noMore : boolean;	// true = no hay más páginas
	public identity;
	public token;
	public page;				// Página actual
	public pages;				// Total de páginas
	public items_per_page;		// Número de elementos por página
	//public next_page;			// Página siguiente
	//public prev_page;			// Página previa
	//public paginas;				// Array con el número de páginas (para paginación)
	public follows; 			// Ids de los usuarios que estamos siguiendo
	public following; 			// Array de los usuarios a los que estamos siguiendo
	@Input() user_id: string;	// Usuario sobre el que mostramos resultado
	

	constructor(
		private _route        : ActivatedRoute,
		private _router       : Router,
		private _userService  : UserService,
		private _followService: FollowService
		) { 
		this.title    = "Siguiendo";
		this.url      = GLOBAL.url;
		this.identity = this._userService.getIdentity();
		this.token    = this._userService.getToken();
		//this.user_id  = this.identity._id;
		this.page     = 1;
		this.noMore   = false;
		this.loading  = true;
	}

	ngOnInit() {
		this.actualPage();
	}

	actualPage(){
		this._route.params.subscribe(params => {
			if(params['id']){
				this.user_id = params['id'];
				//console.log('Followings id: '+this.user_id);
			}
			/*let page = 1;

			if(params['page']) {
				page = +params['page']; //--> con el signo +, convertimos a entero
			}
			this.page = page;
			this.next_page = page+1;
			this.prev_page = page-1;
			if(this.prev_page <= 0){
				this.prev_page = 1;
			}*/

			// devolver listado de usuarios
			this.getFollows(this.user_id, this.page);
		});
	}

	getFollows(user_id, page, adding = false){
		this._followService.getFollowing(this.token, user_id, page).subscribe(
			response => {
				/*if(response.user.nick && (this.identity._id != response.user._id)){
						this.title = 'Gente seguida por '+response.user.nick;
					}*/
					if(!response.follows){
						this.status = 'error';
						this.loading = false;					
					}else{
						this.status = 'success';
						this.loading = false;
						this.total = response.total;
						this.follows = response.users_following;
						this.items_per_page = response.items_per_page;
						this.pages = response.pages;

						if(this.pages == 1){
							this.noMore = true;
						}

						if(!adding){
							this.following = response.follows;
						}else{
							var arrayA = this.following; 	// lo que tengo hasta ahora
							var arrayB = response.follows;	// la siguiente página que me devuelve
							this.following = arrayA.concat(arrayB);

							$("html, body").animate({ scrollTop: $('#secction-user').prop("scrollHeight")},500);

							if(page > this.pages){
								this._router.navigate(['/home']);
							}	
						}
						/*this.paginas = Array.from(Array(this.pages).keys());
						if(page > this.pages){ //--> si se pone una página incorrecta nos lleva a la primera
							this._router.navigate(['/siguiendo', this.user_id, 1]);
						}*/
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

	viewMore(){
		this.page += 1;

		if(this.page == this.pages){
			this.noMore = true;
		}

		this.getFollows(this.user_id, this.page, true);
	}
}
