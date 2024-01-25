import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminBuildingInventoryComponent } from './admin-building-inventory.component';

const routes: Routes = [{ path: '', component: AdminBuildingInventoryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminBuildingInventoryRoutingModule { }
