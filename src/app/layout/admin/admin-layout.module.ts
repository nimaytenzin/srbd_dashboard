import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from './admin-layout.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AppConfigModule } from '../config/config.module';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';
import { AdminMenuitemComponent } from './admin-menuitem/admin-menuitem.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminTopbarComponent } from './admin-topbar/admin-topbar.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { AppLayoutModule } from '../app.layout.module';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        RippleModule,
        RouterModule,
        AppConfigModule,
    ],
    declarations: [
        AdminLayoutComponent,
        AdminFooterComponent,
        AdminMenuComponent,
        AdminMenuitemComponent,
        AdminSidebarComponent,
        AdminTopbarComponent,
    ],
    exports: [AdminLayoutComponent],
})
export class AdminLayoutModule {}
