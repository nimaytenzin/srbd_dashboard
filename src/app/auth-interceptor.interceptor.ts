import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the localStorage or wherever it is stored
    const authToken = localStorage.getItem('token');

    // Clone the request and add the Authorization header
    const authRequest = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${authToken}`),
    });

    // Pass the cloned request instead of the original request to the next handle
    return next.handle(authRequest);
  }
}

