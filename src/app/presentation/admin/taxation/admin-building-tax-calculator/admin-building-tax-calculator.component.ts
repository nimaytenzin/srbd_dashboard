import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import {
    BuildingDataService,
    PTSRETURNDTO,
    PTSUNITDTO,
} from 'src/app/core/services/building.dataservice';

@Component({
    selector: 'app-admin-building-tax-calculator',
    templateUrl: './admin-building-tax-calculator.component.html',
    styleUrls: ['./admin-building-tax-calculator.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        InputGroupModule,
        InputTextModule,
        ButtonModule,
        FormsModule,
        TableModule,
    ],
})
export class AdminBuildingTaxCalculatorComponent implements OnInit {
    plotId: string;

    ptsObject: PTSRETURNDTO[] = [];
    searched: boolean = false;

    constructor(private buildingDataService: BuildingDataService) {}

    ngOnInit() {}

    searchPlotOnEnter() {}

    onInputChange(): void {
        // Capitalize the input text
        this.plotId = this.plotId.toUpperCase();
        this.plotId = this.plotId.replace(' ', '');
    }

    calculateTaxByPlot() {
        this.buildingDataService
            .CalculateTaxByPlotId(this.plotId)
            .subscribe((res) => {
                this.ptsObject = res;
                this.searched = true;
            });
    }

    computeUnitTax(rent: number): number {
        // Calculate the tax and round to two decimal places
        const tax = (rent * 12 * 12.5 * 0.1) / 100;
        return Math.round(tax * 100) / 100; // Round to 2 decimal places
    }

    computeTotalBuildingTax(units: PTSUNITDTO[]): number {
        let tax = 0;
        for (let unit of units) {
            tax += this.computeUnitTax(unit.monthlyRentalValue);
        }
        return Math.round(tax * 100) / 100; // Round the total to 2 decimal places
    }

    computeTotalTax(item: PTSRETURNDTO[]): number {
        let tax = 0;
        for (let ok of item) {
            tax += this.computeTotalBuildingTax(ok.units);
        }
        return Math.round(tax * 100) / 100; // Round the total to 2 decimal places
    }
}
