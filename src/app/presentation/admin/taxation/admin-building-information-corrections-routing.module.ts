import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminBuildingTaxCalculatorComponent } from './admin-building-tax-calculator/admin-building-tax-calculator.component';

const routes: Routes = [
    {
        path: '',
        component: AdminBuildingTaxCalculatorComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminBuildingTaxationRoutingModule {}
