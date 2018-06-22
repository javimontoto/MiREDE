import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';
import { GLOBAL } from '../../services/global';


@Component({
	selector   : 'app-user-edit',
	templateUrl: './user-edit.component.html',
	styleUrls  : ['./user-edit.component.css'],
	providers  : [UserService, UploadService]
})
export class UserEditComponent implements OnInit {
	public title : string;
	public status: string;
	public user  : User;
	public url   : string;
	public identity;
	public token;

	constructor(
		private _route        : ActivatedRoute,
		private _router       : Router,
		private _userService  : UserService,
		private _uploadService: UploadService
		) { 
		this.title = 'Actualizar mis datos';
		this.user = this._userService.getIdentity();
		this.identity = this.user;
		this.token = this._userService.getToken();
		this.url = GLOBAL.url;
	}

	ngOnInit() {}

	onSubmit() {
		this._userService.updateUser(this.user).subscribe(
			response => {
				if(!response.user){
					this.status = 'error';
					//console.log(response);
				}else{
					this.status = 'success';
					localStorage.setItem('identity', JSON.stringify(this.user));
					this.identity = this.user;

					if(this.filesToUpload != null){
						this._uploadService.makeFileRequest(this.url+'upload-image-user/'+this.user._id, [], this.filesToUpload, this.token, 'image').then((result: any) => {
							//console.log(result);
							this.user.image = result.user.image;
							localStorage.setItem('identity', JSON.stringify(this.user));
						});
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


	public filesToUpload: Array<File>;
	fileChangeEvent(fileInput: any){
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}
}
