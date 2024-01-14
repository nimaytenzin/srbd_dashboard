import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminMasterSubAdministrativezonesComponent } from './admin-master-sub-administrativezones.component';

const routes: Routes = [{ path: '', component: AdminMasterSubAdministrativezonesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminMasterSubAdministrativezonesRoutingModule { }
