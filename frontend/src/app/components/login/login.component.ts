import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';


@Component({
	selector   : 'app-login',
	templateUrl: './login.component.html',
	styleUrls  : ['./login.component.css'],
	providers  : [UserService]
})
export class LoginComponent implements OnInit {
	public title :string;	//--> título de la sección
	public user  :User;		//--> campos usuario que recibo
	public status:string;	//--> estado del login
	public identity;		//--> usuario completo tras el login
	public token;			//--> token tras el login

	constructor(
		private _route      : ActivatedRoute,
		private _router     : Router,
		private _userService: UserService
		) { 
		this.title = 'Identifícate...';
		this.user = new User('','','','','','','ROLE_USER','','','');
	}


	ngOnInit() {}

	onSubmit(form){
		this._userService.login(this.user).subscribe(
			response => {
				this.identity = response.user;

				if(this.identity && this.identity._id){

					// Persistir datos del usuario en el LocalStorage
					localStorage.setItem('identity',JSON.stringify(this.identity));

					// Conseguir token
					this.getToken();

				}else{
					this.status = 'error';
				}
			},
			error => {
				this.status = 'error';
				console.log(<any>error);
			}
			);
	}

	/** Método para conseguir el TOKEN al loguearse **/
	getToken(){
		this._userService.login(this.user, 'true').subscribe(
			response => {
				this.token = JSON.stringify(response.token);

				if(this.token.length > 0){

					// Persistir el token en el LocalStorage
					localStorage.setItem('token',this.token);

					// Conseguir contadores o estadísticas
					this.getCounters();

				}else{
					this.status = 'error';
				}
			},
			error => {
				this.status = 'error';
				console.log(<any>error);
			}
			);
	}


	getCounters(){
		this._userService.getCounters().subscribe(
			response => {
				localStorage.setItem('stats', JSON.stringify(response));
				this.status = 'success';
				this._router.navigate(['home']);

			},
			error => {
				console.log(<any>error);
			}
			);
	}

}
