import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importar componentes
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';


const routes: Routes = [
	//{path: '', component: AppComponent},		//--> página principal
	{path: 'login', component: LoginComponent},
	{path: 'register', component: RegisterComponent},
	//{path: '**', redirectTo:''}		//--> cuando hay un error
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);	//--> así carga todo.