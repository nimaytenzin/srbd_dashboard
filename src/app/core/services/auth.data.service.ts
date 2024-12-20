import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL, AUTHTOKENKEY } from '../constants/constants';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';

export interface AuthenticatedUserDTO {
    userId: number;
    cid: string;
    fullName: string;
    role: string;
}
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    apiUrl = API_URL;
    tokenName = AUTHTOKENKEY;

    constructor(private http: HttpClient, private router: Router) {}

    Login(data) {
        return this.http.post(`${this.apiUrl}/auth/login`, data);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenName);
    }

    setToken(token: string): void {
        localStorage.setItem(this.tokenName, token);
    }
    removeToken(): void {
        localStorage.removeItem(this.tokenName);
    }

    decodeToken(): AuthenticatedUserDTO {
        const token = this.getToken();
        if (token) {
            return jwt_decode.jwtDecode(token);
        }
        return null;
    }

    handleLoginRouting() {
        // const role = this.getRole();
        console.log('USER ROLE');
        this.router.navigate(['/enum/select-zone']);
    }
}
