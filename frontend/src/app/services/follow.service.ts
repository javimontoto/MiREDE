import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Follow } from '../models/follow';
import { GLOBAL } from './global';

@Injectable({
	providedIn: 'root'
})
export class FollowService {
	public url : string;

	constructor(public _http: HttpClient) { 
		this.url = GLOBAL.url;
	}

	/** Método para AÑADIR un seguimiento **/
	addFollow(token, follow):Observable<any>{
		let params = JSON.stringify(follow);
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.post(this.url+'follow', params, {headers:headers});
	}

	/** Método para BORRAR un seguimiento **/
	deleteFollow(token, id):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.delete(this.url+'follow/'+id, {headers:headers});
	}

	/** Método para LISTAR a los siguiendo **/
	getFollowing(token, user_id = null, page = 1):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		var url = this.url+'following/';
		if(user_id != null) {
			url = this.url+'following/'+user_id+'/'+page;
		}

		return this._http.get(url, {headers:headers});
	}

	/** Método para LISTAR a los seguidores **/
	getFollowed(token, user_id = null, page = 1):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		var url = this.url+'followed/';
		if(user_id != null) {
			url = this.url+'followed/'+user_id+'/'+page;
		}

		return this._http.get(url, {headers:headers});	
	}

	/** Método para LISTAR los usuarios a los que seguimos **/
	getMyFollows(token):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.get(this.url+'get-my-follows', {headers:headers});
	}

	/** Método para LISTAR los usuarios que nos están siguiendo **/
	getFollowBacks(token):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', token);

		return this._http.get(this.url+'get-follow-backs', {headers:headers});
	}
}
