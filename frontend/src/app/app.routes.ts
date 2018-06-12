import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Importar componentes
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FollowingComponent } from './components/following/following.component';
import { FollowedComponent } from './components/followed/followed.component';



const routes: Routes = [
	{path: '', component: HomeComponent},		//--> página principal
	{path: 'home', component: HomeComponent},
	{path: 'login', component: LoginComponent},
	{path: 'register', component: RegisterComponent},
	{path: 'mis-datos', component: UserEditComponent},
	{path: 'gente', component: UsersComponent},
	{path: 'gente/:page', component: UsersComponent},
	{path: 'timeline', component: TimelineComponent},
	{path: 'perfil/:id', component: ProfileComponent},
	{path: 'siguiendo/:id/:page', component: FollowingComponent},
	{path: 'seguidores/:id/:page', component: FollowedComponent},
	{path: '**', redirectTo:'home'}		//--> cuando hay un error
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);	//--> así carga todo.