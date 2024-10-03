import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';

interface usuario {
  dni: String,
  nombres: String,
  apellidos: String,
  email: String,
  password: String,
  role: String,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private URL = 'http://localhost:3000/api';
  constructor(private http: HttpClient, private router: Router) { }

  signInUser(user: usuario) {
    return this.http.post<any>(this.URL + '/signin', user)
  }

  loggedIn(): boolean{
    //if (typeof localStorage == 'undefined') {
      return !!localStorage.getItem('token');
    //}
    //return false;
  }

  getToken() {
    return localStorage.getItem('token')
  }

  logout() {
    localStorage.removeItem('token')
    this.router.navigate(['/home'])
  }

}
