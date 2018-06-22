import { Component, OnInit } from '@angular/core';
//import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';


@Component({
	selector   : 'app-register',
	templateUrl: './register.component.html',
	styleUrls  : ['./register.component.css'],
	providers  : [UserService]
})
export class RegisterComponent implements OnInit {
	public title :string;	//--> título de la sección
	public user  :User;		//--> campos usuario que recibo
	public status:string;	//--> estado del login
	public message;

	constructor(
		//private _route      : ActivatedRoute,
		//private _router     : Router,
		private _userService: UserService
		) { 
		this.title = 'Regístrate...';
		this.user = new User('','','','','','','ROLE_USER','','','');
	}

	ngOnInit() {
		//console.log('Componente register cargado...');
	}

	onSubmit(form){
		//console.log(this.user);
		this._userService.register(this.user).subscribe(
			response => {
				if(response.user && response.user._id){
					this.status = 'success';
					form.reset();
				}else{
					this.status = 'error';
					this.message = response.message;
				}
			},
			error => {
				console.log(<any>error);
			}
			);
	}

}
