import { Component, OnInit, DoCheck} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../../models/message';
import { Follow } from '../../../models/follow';
import { FollowService } from '../../../services/follow.service';
import { MessageService } from '../../../services/message.service';
import { UserService } from '../../../services/user.service';
import { GLOBAL } from '../../../services/global';


@Component({
	selector: 'app-add',
	templateUrl: './add.component.html',
	styleUrls: ['../main/main.component.css']
})
export class AddComponent implements OnInit {
	public title  : string;
	public message: Message;
	public identity;
	public token;
	public status;
	public follows;				// Array con los usuarios que nos siguen

	constructor(
		private _route         : ActivatedRoute,
		private _router        : Router,
		private _messageService: MessageService,
		private _followService : FollowService,
		private _userService   : UserService
		) {
		this.title = "Enviar mensaje";
		this.identity = this._userService.getIdentity();
		this.token    = this._userService.getToken();
		this.message = new Message('','',false,'',this.identity._id,'');
	}

	ngOnInit() {
		this.getMyFollows();
	}

	onSubmit(form) {
		this._messageService.addMessage(this.token, this.message).subscribe(
			response => {
				if(response.message){
					this.status = 'success';
					form.reset();
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

	getMyFollows(){
		this._followService.getMyFollows(this.token).subscribe(
			response => {
				if(response.follows){
					this.follows = response.follows;
				}
			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);
			}
			);
	}


}
