import { Component } from '@angular/core';

// Declaramos las variables para jQuery
declare var jQuery:any;
declare var $:any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {

	onActivate(event) {
		window.scroll(0,0); // hace que cuando entremos en una vista se situe arriba
	}
}
