// Modulos
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';

// Servicios --> para poder usar el Guard en cualquier ruta
import { UserGuard } from '../services/user.guard';

// Rutas
import { MessagesRoutingModule } from './messages-routing.module';

// Components
import { MainComponent } from './components/main/main.component';
import { AddComponent } from './components/add/add.component';
import { ReceivedComponent } from './components/received/received.component';
import { SendedComponent } from './components/sended/sended.component';


@NgModule({
	declarations: [
		MainComponent,
		AddComponent,
		ReceivedComponent,
		SendedComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		MomentModule,
		MessagesRoutingModule
	],
	exports: [
		MainComponent,
		AddComponent,
		ReceivedComponent,
		SendedComponent
	],
	providers: [
		UserGuard
	]
})
export class MessagesModule { }
