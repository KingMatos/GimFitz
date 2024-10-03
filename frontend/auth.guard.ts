import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if(authService.loggedIn()){
    return true;
  }else{
    // No está autenticado, redirigir a /home y denegar el acceso
    router.navigateByUrl('/home');
    //state.url = '/home';
    //window.location.href = state.url;
    return false;
  }

};
