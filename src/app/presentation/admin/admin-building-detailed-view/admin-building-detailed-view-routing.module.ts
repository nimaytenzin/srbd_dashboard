import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminBuildingDetailedViewComponent } from './admin-building-detailed-view.component';

const routes: Routes = [{ path: '', component: AdminBuildingDetailedViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminBuildingDetailedViewRoutingModule { }
