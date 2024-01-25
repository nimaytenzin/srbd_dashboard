import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AdminLayoutModule } from './presentation/layout/admin/admin-layout.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@NgModule({
    declarations: [AppComponent],
    imports: [AppRoutingModule, AdminLayoutModule, ToastModule],
    providers: [MessageService],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(private messageService: MessageService) {}
}
