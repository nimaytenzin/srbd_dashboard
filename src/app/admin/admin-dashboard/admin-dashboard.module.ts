import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { StyleClassModule } from 'primeng/styleclass';
import { TableModule } from 'primeng/table';
import { DashboardsRoutingModule } from 'src/app/demo/components/dashboard/dashboard-routing.module';
import { AdminDashboardComponent } from './admin-dashboard.component';

@NgModule({
    declarations: [AdminDashboardComponent],
    imports: [
        CommonModule,
        AdminDashboardRoutingModule,
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        DashboardsRoutingModule,
    ],
})
export class AdminDashboardModule {}
