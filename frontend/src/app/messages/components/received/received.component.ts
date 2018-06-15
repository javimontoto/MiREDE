import { Component, OnInit, DoCheck} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../../models/message';
import { Follow } from '../../../models/follow';
import { FollowService } from '../../../services/follow.service';
import { MessageService } from '../../../services/message.service';
import { UserService } from '../../../services/user.service';
import { GLOBAL } from '../../../services/global';


@Component({
	selector: 'app-received',
	templateUrl: './received.component.html',
	styleUrls: ['../main/main.component.css']
})
export class ReceivedComponent implements OnInit {
	public title   : string;
	public message : Message;
	public url     : string;
	public messages: Message[];		// Array con los mensajes
	public identity;
	public token;
	public status;
	public page;			// Página actual
	public next_page;		// Página siguiente
	public prev_page;		// Página previa
	public pages;			// Total de páginas
	public paginas;			// Array con el número de páginas (para paginación)


	constructor(
		private _route         : ActivatedRoute,
		private _router        : Router,
		private _messageService: MessageService,
		private _followService : FollowService,
		private _userService   : UserService
		) {
		this.title    = "Mensajes recibidos";
		this.identity = this._userService.getIdentity();
		this.token    = this._userService.getToken();
		this.url      = GLOBAL.url;
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
			this.getMyMessages(page);
		});
	}

	getMyMessages(page = 1){
		this._messageService.getMyMessages(this.token, page).subscribe(
			response => {
				if(response.messages){
					this.status = 'success';
					this.messages = response.messages;
					this.pages = response.pages;
					this.paginas = Array.from(Array(this.pages).keys());
					if(page > this.pages){ //--> si se pone una página incorrecta nos lleva a la primera
						this._router.navigate(['/mensajes/recibidos/', 1]);
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

	/** Método que captura el evento enviado por sidebar **/
	refreshMessages(event=null){
		this.getMyMessages();
	}
}