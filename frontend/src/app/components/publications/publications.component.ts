import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';
import { UserService } from '../../services/user.service';
import { GLOBAL } from '../../services/global'

/* jQUERY */
declare var jQuery:any;
declare var $:any;

@Component({
	selector: 'app-publications',
	templateUrl: './publications.component.html',
	styleUrls: ['./publications.component.css'],
	providers  : [UserService, PublicationService]
})
export class PublicationsComponent implements OnInit {
	public title       : string;
	public url         : string;
	public publications: Publication[];
	public loading     : boolean;
	public noMore      : boolean;			// true = no hay más páginas
	public identity;
	public token;
	public status;
	public page;				// Página actual
	public pages;				// Total de páginas
	public total;
	public items_per_page;
	public showImage;
	@Input() user_id: string;

	constructor(
		private _route             : ActivatedRoute,
		private _router            : Router,
		private _userService       : UserService,
		private _publicationService: PublicationService
		) { 
		this.title     = 'Publicaciones';
		this.identity  = _userService.getIdentity();
		this.token     = _userService.getToken();
		this.url       = GLOBAL.url;
		this.page      = 1;
		this.noMore    = false;
		this.showImage = 0;
		this.loading   = true;
	}

	ngOnInit() {
		this.actualPage();
	}

	actualPage(){
		this._route.params.subscribe(params => {
			if(params['id']){
				this.user_id = params['id'];
				//console.log('Publications id: '+this.user_id);
			}
			this.getPublications(this.user_id, this.page);
		});
	}

	/** Método para cargar las PUBLICACIONES. Si adding es true entonces añade páginas **/
	getPublications(user_id, page, adding = false){
		this._publicationService.getPublicationsByUser(this.token, page, user_id).subscribe(
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
					this.status = 'error';
					this.loading = false;
				}

			},
			error => {
				var errorMessage = <any>error;
				console.log(errorMessage);

				if(errorMessage != null){
					this.loading = false;
					this.status = 'error';
				}
			}
			);
	}

	deletePublication(publication_id){
		this._publicationService.deletePublication(this.token, publication_id).subscribe(
			response => {
				this.refreshPublications();
				this._userService.updateMyStats('publications',-1);
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

		this.getPublications(this.user_id, this.page, true);
	}

	showThisImage(id){
		this.showImage = id;
	}

	hideThisImage(id){
		this.showImage = 0;
	}

	refreshPublications(){
		this.noMore = false;
		this.getPublications(this.identity._id,1);
	}
}
