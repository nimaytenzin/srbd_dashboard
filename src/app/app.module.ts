import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {  HTTP_INTERCEPTORS } from '@angular/common/http';
import { AdminLayoutModule } from './presentation/layout/admin/admin-layout.module';
import { AuthInterceptor } from './auth-interceptor.interceptor';

@NgModule({
    declarations: [AppComponent],
    imports: [AppRoutingModule, AdminLayoutModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
