import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AdminViewBuildingComponent } from '../shared/admin-view-building/admin-view-building.component';
import { AdminViewPlotBuildingsComponent } from '../shared/admin-view-plot-buildings/admin-view-plot-buildings.component';

@Component({
    selector: 'app-admin-advancedsearch',
    standalone: true,
    imports: [
        ButtonModule,
        CommonModule,
        InputGroupAddonModule,
        InputGroupModule,
        InputTextModule,
        InputNumberModule,
        FormsModule,
        AdminViewBuildingComponent,
        AdminViewPlotBuildingsComponent,
    ],
    providers: [MessageService],
    templateUrl: './admin-advancedsearch.component.html',
    styleUrl: './admin-advancedsearch.component.scss',
})
export class AdminAdvancedsearchComponent {
    searched = false;
    buildingId: number;
    plotId: string;

    searchedBuildingId: number;
    searchedPlotId: string;

    plotSearched = false;
    buildingSearched = false;

    searchBuilding() {
        this.buildingSearched = true;
        this.plotSearched = false;
        this.searchedBuildingId = this.buildingId;
    }
    searchPlot() {
        this.plotSearched = true;
        this.buildingSearched = false;

        this.searchedPlotId = this.plotId;
    }
    onInputChange(): void {
        // Capitalize the input text
        this.plotId = this.plotId.toUpperCase();
    }
}
