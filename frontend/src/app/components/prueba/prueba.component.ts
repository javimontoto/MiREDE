import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-prueba',
  templateUrl: './prueba.component.html',
  //template: `<h2>Componente de pruebas</h2>`,
  styleUrls: ['./prueba.component.css']
})
export class PruebaComponent implements OnInit {
	nombre = 'Pruebas de Javi';
	constructor() { }

	ngOnInit() {
	}

}
