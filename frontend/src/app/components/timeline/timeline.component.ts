import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';
import { UserService } from '../../services/user.service';
import { GLOBAL } from '../../services/global';

/* jQUERY */
declare var jQuery:any;
declare var $:any;

@Component({
	selector   : 'app-timeline',
	templateUrl: './timeline.component.html',
	styleUrls  : ['./timeline.component.css'],
	providers  : [UserService, PublicationService]
})
export class TimelineComponent implements OnInit {
	public title       : string;
	public url         : string;
	public publications: Publication[];
	public loading     : boolean;	
	public identity;
	public token;
	public status;
	public page;
	public pages;
	public total;
	public items_per_page;
	public noMore;
	public showImage;

	constructor(
		private _route             : ActivatedRoute,
		private _router            : Router,
		private _userService       : UserService,
		private _publicationService: PublicationService
		) { 
		this.title     = 'Timeline';
		this.identity  = _userService.getIdentity();
		this.token     = _userService.getToken();
		this.url       = GLOBAL.url;
		this.page      = 1;
		this.noMore    = false;
		this.showImage = 0;
		this.loading   = true;
	}

	ngOnInit() {
		this.getPublications(this.page);
	}

	/** Método para cargar las PUBLICACIONES. Si adding es true entonces añade páginas **/
	getPublications(page, adding = false){
		this._publicationService.getPublications(this.token, page).subscribe(
			response => {
				if(response.publications){
					this.loading = false;
					this.total = response.total_items;
					this.pages = response.pages;
					this.items_per_page = response.items_per_page;

					if(this.pages == 1){
						this.noMore = true;
					}

					if(!adding){
						this.publications = response.publications;
					}else{
						var arrayA = this.publications; 	// lo que tengo hasta ahora
						var arrayB = response.publications;	// la siguiente página que me devuelve
						this.publications = arrayA.concat(arrayB);

						$("html, body").animate({ scrollTop: $('#timeline').prop("scrollHeight")},500);
					}

					if(page > this.pages){
						this._router.navigate(['/home']);
					}
				}else{
					this.loading = false;
					this.status = 'error';
				}

			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				if(errorMessage != null){
					this.status = 'error';
					this.loading = false;
				}
			}
			);

	}

	deletePublication(publication_id){
		this._publicationService.deletePublication(this.token, publication_id).subscribe(
			response => {
				this._userService.updateMyStats('publications',-1);
				this.refreshPublications();
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

	viewMore(){
		this.page += 1;

		if(this.page == this.pages){
			this.noMore = true;
		}

		this.getPublications(this.page, true);
	}

	/** Método que captura el evento enviado por sidebar **/
	refreshPublications(event = null){
		this.noMore = false;
		this.getPublications(1);
	}

	showThisImage(id){
		this.showImage = id;
	}

	hideThisImage(id){
		this.showImage = 0;
	}

}
