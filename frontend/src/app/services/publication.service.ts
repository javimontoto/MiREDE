import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Publication } from '../models/publication';
import { GLOBAL } from './global';

@Injectable({
	providedIn: 'root'
})
export class PublicationService {
	public url: string;

	constructor(public _http: HttpClient) { 
		this.url = GLOBAL.url;
	}

	/** Método para AÑADIR una publicación nueva **/
	newPublication(token, publication):Observable<any>{
		let params = JSON.stringify(publication);
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.post(this.url+'publication', params, {headers:headers});
	}

	/** Método para sacar LISTA de PUBLICACIONES **/
	getPublications(token, page = 1):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.get(this.url+'publications/'+page, {headers:headers});
	}

	/** Método para BORRAR una PUBLICACIÓN **/
	deletePublication(token, id):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.delete(this.url+'publication/'+id, {headers:headers});
	}

	/** Método para sacar LISTA de PUBLICACIONES de un usuario en concreto **/
	getPublicationsByUser(token, page = 1, user_id):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.get(this.url+'publications-user/'+user_id+ '/' +page, {headers:headers});
	}
}
