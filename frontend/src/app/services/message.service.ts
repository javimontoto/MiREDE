import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Message } from '../models/message';
import { GLOBAL } from './global';

@Injectable({
	providedIn: 'root'
})
export class MessageService {
	public url: string;

	constructor (public _http: HttpClient) { 
		this.url = GLOBAL.url;
	}

	/** Método para ENVIAR un mensaje **/
	addMessage(token, message):Observable<any>{
		let params = JSON.stringify(message);
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.post(this.url+'message', params, {headers:headers});
	}

	/** Método para LISTAR mensajes recibidos **/
	getMyMessages(token, page = 1):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.get(this.url+'my-messages/'+page, {headers:headers});
	}

	/** Método para LISTAR mensajes enviados **/
	getMessages(token, page = 1):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.get(this.url+'messages/'+page, {headers:headers});
	}

}