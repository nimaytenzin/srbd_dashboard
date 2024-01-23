import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminBuildingInventoryRoutingModule } from './admin-building-inventory-routing.module';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        AdminBuildingInventoryRoutingModule,
    ],
})
export class AdminBuildingInventoryModule {}
