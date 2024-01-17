import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminMasterBuildingComponent } from './admin-master-building.component';


const routes: Routes = [{ path: '', component: AdminMasterBuildingComponent}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports:[RouterModule]
})
export class AdminMasterBuildingRoutingModule { }
