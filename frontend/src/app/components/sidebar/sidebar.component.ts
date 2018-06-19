import { Component, OnInit, EventEmitter, Output, DoCheck } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Publication } from '../../models/publication';
import { PublicationService } from '../../services/publication.service';
import { GLOBAL } from '../../services/global';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UploadService } from '../../services/upload.service';


@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.css'],
	providers: [UserService, PublicationService]
})
export class SidebarComponent implements OnInit, DoCheck {
	public title: string;
	public identity;
	public token;
	public my_stats;
	public url;
	public status;
	public publication: Publication;

	// Output --> ponemos la etiqueta "@Output" y la propiedad que es el evento
	@Output() publicationSended = new EventEmitter();

	constructor(
		private _route             : ActivatedRoute,
		private _router            : Router,
		private _userService       : UserService,
		private _publicationService: PublicationService,
		private _uploadService     : UploadService
		) { 
		this.title = "Tus datos...";
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.my_stats = this._userService.getStats();
		this.url = GLOBAL.url;
		this.publication = new Publication('', '', '', '', this.identity._id);
	}

	ngOnInit() { 
		//this.my_stats = this._userService.getStats();
	}

	ngDoCheck(){
		this.my_stats = this._userService.getStats();
	}

	onSubmit(form, event){
		this._publicationService.newPublication(this.token, this.publication).subscribe(
			response => {
				if(response.publicationStored){
					this.publication = response.publicationStored;
					this.status = 'success';
					this.my_stats.publications += 1;
					this._userService.updateMyStats('publications',1);

					if(this.filesToUpload && this.filesToUpload.length){
						this._uploadService.makeFileRequest(this.url+'upload-image-pub/'+this.publication._id, [], this.filesToUpload, this.token, 'image').then((result: any) => {
							this.publication.file = result.publication.file;
							form.reset();
						});
					}

					form.reset();
					this.publicationSended.emit({send:'true'});
					this._router.navigate(['/timeline']);					
				}else{
					this.status = 'error';
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

