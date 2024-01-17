import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from './constants';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    apiUrl = API_URL;

    constructor(private http: HttpClient, private router: Router) {}

    Login(data) {
        return this.http.post(`${this.apiUrl}/auth/login`, data);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    setToken(token: string): void {
        localStorage.setItem('token', token);
    }
    removeToken(): void {
        localStorage.removeItem('token');
    }

    getRole(): string | null {
        const token = this.getToken();
        // if (token) {
        //     const decoded: any = jwt_decode(token);
        //     return decoded.role;
        // }
        return null;
    }

    handleLoginRouting() {
        const role = this.getRole();
        console.log('USER ROLE');
        this.router.navigate(['/enum/select-zone']);
    }
}
