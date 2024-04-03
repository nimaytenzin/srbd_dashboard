import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminMasterOwnerComponent } from './admin-master-owner.component';

const routes: Routes = [{ path: '', component: AdminMasterOwnerComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminMasterOwnerRoutingModule { }
