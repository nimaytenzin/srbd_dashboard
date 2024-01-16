import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAdvancedsearchComponent } from './admin-advancedsearch.component';

const routes: Routes = [{ path: '', component: AdminAdvancedsearchComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAdvancedsearchRoutingModule { }
