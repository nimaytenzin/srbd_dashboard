import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminBuildingInformationCorrectionListingsComponent } from './admin-building-information-correction-listings/admin-building-information-correction-listings.component';

const routes: Routes = [
    {
        path: '',
        component: AdminBuildingInformationCorrectionListingsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminBuildingInformationCorrectionsRoutingModule {}
