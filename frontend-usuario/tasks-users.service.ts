import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
  dni: String,
  nombres: String,
  apellidos: String,
  email: String,
  initial_date: String,
  final_date: String,
  password: String,
  role: String,
}

interface Routine {
  nombre: String,
  tipo_rutina: String,
  repeticiones: String,
  descripcion: String,
}


@Injectable({
  providedIn: 'root'
})
export class TasksUserService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-profile-image`, formData);
  }
  
  // Método para obtener la información del usuario actual
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/current-user-data`);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/add-user`, user);
  }

  getUsers(): Observable<any[]> {
    const url = `${this.apiUrl}/users`;
    return this.http.get<any[]>(url);
  }

  getExpiredUsers(): Observable<any[]> {
    const url = `${this.apiUrl}/users-vencidos`;
    return this.http.get<any[]>(url);
  }

  deleteUser(userId: string): Observable<any> {
    //console.log('Deleting user with ID:', userId);
    const url = `${this.apiUrl}/delete-user/${userId}`;
    return this.http.delete<any>(url);
  }

  deleteAllUsers(): Observable<any> {
    const url = `${this.apiUrl}/delete-all-users`;
    return this.http.delete(url);
  }

  getEarningsData(): Observable<any[]> {
    const url = `${this.apiUrl}/monthly-earnings`;
    return this.http.get<any[]>(url);
  }

  addEarningsDaily(amount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-daily-earnings`, { amount });
  }

  getEarningsDailyData(): Observable<any[]> {
    const url = `${this.apiUrl}/daily-earnings`;
    return this.http.get<any[]>(url);
  }

  // Buscar por DNI
  searchUserByDni(dni: string): Observable<any> {
    // Realiza la solicitud al servidor para buscar el usuario por DNI
    return this.http.get<any>(`${this.apiUrl}/users/${dni}`);
  }

  //Para editar un usuario
  updateUser(userId: string, updatedUser: User): Observable<any> {
    const url = `${this.apiUrl}/update-user/${userId}`;
    return this.http.put<any>(url, updatedUser);
  }

  renewUser(userId: string): Observable<any> {
    const url = `${this.apiUrl}/renew-user/${userId}`;
    return this.http.put<any>(url, {});
  }

  // Método para obtener las rutinas de un usuario por DNI
  getUserRoutines(dni: String): Observable<any> {
    const url = `${this.apiUrl}/getUserRoutines/${dni}`; // Endpoint en tu API para obtener las rutinas por DNI
    return this.http.get<any>(url);
  }
}
