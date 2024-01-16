import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AdminLayoutModule } from './layout/admin/admin-layout.module';

@NgModule({
    declarations: [AppComponent],
    imports: [AppRoutingModule, AdminLayoutModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
