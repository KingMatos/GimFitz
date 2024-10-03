import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './auth.guard';

import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { PrivateTasksUsersComponent } from './components/private-tasks-users/private-tasks-users.component'
import { TokenInterceptorService } from './services/token-interceptor.service';
import { PrivateTasksAdminsComponent } from './components/private-tasks-admins/private-tasks-admins.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PrivateTasksUsersComponent,
    PrivateTasksAdminsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgApexchartsModule
  ],
  providers: [
    {
      provide: 'CanActivateFn',
      useValue: authGuard
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
