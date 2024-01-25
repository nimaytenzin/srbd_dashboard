import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminMasterMedianrentComponent } from './admin-master-medianrent.component';

const routes: Routes = [{ path: '', component: AdminMasterMedianrentComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminMasterMedianrentRoutingModule { }
