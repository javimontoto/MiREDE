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

	constructor(public _http: HttpClient) { 
		this.url = GLOBAL.url;
	}

	register(user_to_register:User): Observable<any>{
		let params = JSON.stringify(user_to_register);
		let headers = new HttpHeaders().set('Content-Type', 'application/json');

		return this._http.post(this.url+'register', params, {headers:headers});
	}
}
