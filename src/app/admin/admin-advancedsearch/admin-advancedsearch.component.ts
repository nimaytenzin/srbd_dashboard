import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { BuildingDataService } from 'src/app/dataservice/building.dataservice';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';

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
    ],
    templateUrl: './admin-advancedsearch.component.html',
    styleUrl: './admin-advancedsearch.component.scss',
})
export class AdminAdvancedsearchComponent {
    constructor(
        private buildingPlotDataService: BuildingPlotDataService,
        private buildingDataService: BuildingDataService,
        private buildingDetailService: BuildingDetailService
    ) {}
    plotId: string;
    buildingId: number;

    building: any;
    buildingDetails: any;
    units: any[];
    plots: any[];

    searchByPlotId() {
        // if(this.plotId){
        //   this.buildingPlotDataService.s
        // }
    }

    searchByBuildingId() {
        this.buildingDataService
            .GetBuildingById(this.buildingId)
            .subscribe((res) => {
                console.log(res);
                this.building = res;
                this.getBuildingDetails(this.buildingId);
            });
    }

    getBuildingDetails(buildingId: number) {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(buildingId)
            .subscribe((res) => {
                console.log(res);
                this.buildingDetails = res;
            });
    }
}
