import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { GLOBAL } from '../../services/global';

@Component({
	selector   : 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls  : ['./profile.component.css'],
	providers  : [UserService,FollowService]
})
export class ProfileComponent implements OnInit {
	public title : string;
	public status: string;
	public user  : User;
	public url   : string;
	public identity;
	public token;
	public stats;
	public followed;
	public following;

	constructor(
		private _route        : ActivatedRoute,
		private _router       : Router,
		private _userService  : UserService,
		private _followService: FollowService
		) { 
		this.title = 'Perfil';
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.url = GLOBAL.url;
		this.following = false;
		this.followed = false;
	}

	ngOnInit() {
		this.loadPage();
	}

	loadPage(){
		this._route.params.subscribe(params => {
			let id = params['id'];

			this.getUser(id);
			this.getCounters(id);
		});
	}

	getUser(id){
		this._userService.getUser(id).subscribe(
			response => {
				if(response.user){
					this.user = response.user;
					this.status = 'success';

					if(response.following){
						this.following = true;
					}else{
						this.following = false;
					}

					if(response.followed){
						this.followed = true;
					}else{
						this.followed = false;
					}

				}else{
					this.status = 'error';
				}
			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				this._router.navigate(['/perfil', this.identity._id]);
			}
			);
	}

	getCounters(id){
		this._userService.getCounters(id).subscribe(
			response => {
				if(response){
					this.stats = response;
					this.status = 'success';
				}else{
					this.status = 'error';
				}
			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);
			}
			);
	}

	/** Método para serguir a un usario "followed" **/
	followUser(followed){
		var follow = new Follow('', this.identity._id, followed);

		this._followService.addFollow(this.token, follow).subscribe(
			response => {
				this.following = true; 
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
				this.following = false; 
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
