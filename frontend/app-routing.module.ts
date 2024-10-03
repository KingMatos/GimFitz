import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';

//Components
import {HomeComponent} from "./components/home/home.component"
import { PrivateTasksUsersComponent } from './components/private-tasks-users/private-tasks-users.component';
import { PrivateTasksAdminsComponent } from './components/private-tasks-admins/private-tasks-admins.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
      path: 'home',
      component: HomeComponent
  },
  {
    path: 'private-admins',
    component: PrivateTasksAdminsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'private-users',
    component: PrivateTasksUsersComponent,
    canActivate: [authGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
