import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import { GLOBAL } from './global';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	public url:string;
	public identity
	public token;
	public stats;

	constructor(public _http: HttpClient) { 
		this.url = GLOBAL.url;
	}

	/** Método para REGISTRAR un usuario **/
	register(user_to_register:User): Observable<any>{
		let params = JSON.stringify(user_to_register);
		let headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._http.post(this.url+'register', params, {headers:headers});
	}

	/** Método para LOGIN: si llega gettoken a 'true' devuelve un hash **/
	login(user_to_login:User, gettoken = null): Observable<any>{
		if (gettoken != null){
			user_to_login.gettoken = gettoken;
		}

		let params = JSON.stringify(user_to_login);
		let headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._http.post(this.url+'login', params, {headers:headers});
	}

	/** Método para sacar los datos del usuario del LOCALSTORAGE **/
	getIdentity(){
		let identity = JSON.parse(localStorage.getItem('identity'));

		if (identity != undefined){
			this.identity = identity;
		}else{
			this.identity = null;
		}
		return this.identity;
	}

	/** Método para sacar el TOKEN del LOCALSTORAGE **/
	getToken(){
		let token = JSON.parse(localStorage.getItem('token'));

		if (token != undefined){
			this.token = token;
		}else{
			this.token = null;
		}
		return this.token;
	}

	/** Método para sacar los CONTADORES almacenados**/
	getStats(){
		let stats = JSON.parse(localStorage.getItem('stats'));

		if(stats != undefined){
			this.stats = stats;
		}else{
			this.stats = null;
		}

		return this.stats;
	}

	/** Método para ACTUALIZAR las estadísticas localmente **/
	updateMyStats(stat, value){
		let my_stats = this.getStats();
		switch (stat) {
			case "publications":
			my_stats.publications = my_stats.publications+value;
			break;
			case "following":
			my_stats.following = my_stats.following+value;
			break;
			case "followed":
			my_stats.followed = my_stats.followed+value;
			break;
		}
		localStorage.setItem('stats', JSON.stringify(my_stats));
	}

	/** Método que hace la petición para sacar del backend los CONTADORES **/
	getCounters(user_id = null): Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());

		if (user_id != null){
			return this._http.get(this.url+'counters/'+user_id, {headers:headers});
		}else{
			return this._http.get(this.url+'counters', {headers:headers});
		}
	}

	/** Método para ACTUALIZAR los datos del usuario **/
	updateUser(user: User): Observable<any>{
		let params = JSON.stringify(user);
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());

		return this._http.put(this.url+'update-user/'+user._id, params, {headers:headers});
	}

	/** Método para sacar LISTA de USUARIOS **/
	getUsers(page = null):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());

		return this._http.get(this.url+'users/'+page, {headers:headers});
	}

	/** Método para sacar un USUARIO **/
	getUser(id):Observable<any>{
		let headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', this.getToken());

		return this._http.get(this.url+'user/'+id, {headers:headers});
	}
}
