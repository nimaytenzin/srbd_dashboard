import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminMasterAdministrativezonesComponent } from './admin-master-administrativezones.component';

const routes: Routes = [{ path: '', component: AdminMasterAdministrativezonesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminMasterAdministrativezonesRoutingModule { }
