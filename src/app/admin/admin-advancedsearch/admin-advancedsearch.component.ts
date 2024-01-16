import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { BuildingDataService } from 'src/app/dataservice/building.dataservice';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { UnitDataService } from 'src/app/dataservice/unit.dataservice';

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
        ToastModule,
        MessagesModule,
        CardModule,
        TableModule,
    ],
    providers: [MessageService],
    templateUrl: './admin-advancedsearch.component.html',
    styleUrl: './admin-advancedsearch.component.scss',
})
export class AdminAdvancedsearchComponent {
    constructor(
        private buildingPlotDataService: BuildingPlotDataService,
        private buildingDataService: BuildingDataService,
        private buildingDetailService: BuildingDetailService,
        private messageService: MessageService,
        private unitDataService: UnitDataService
    ) {}
    plotId: string;
    buildingId: number;

    building: any;
    buildingDetails: any;
    units: any[];
    plots: any[];

    searched = false;
    messages: Message[] | undefined;

    searchByPlotId() {
        // if(this.plotId){
        //   this.buildingPlotDataService.s
        // }
    }

    searchByBuildingId() {
        this.searched = true;
        this.buildingDataService
            .GetBuildingById(this.buildingId)
            .subscribe((res) => {
                console.log(res);
                this.building = res;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Building Found',
                    detail:
                        'details loaded for Building ID: ' + this.buildingId,
                });

                this.getBuildingDetails(this.buildingId);
                this.getBuildingPlots(this.buildingId);
                this.getBuildingUnits(this.buildingId);
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

    getBuildingUnits(buildingId) {
        this.unitDataService
            .GetAllUnitsByBuilding(buildingId)
            .subscribe((res: any) => {
                this.units = res;
            });
    }

    getBuildingPlots(buildngId: number) {
        this.buildingPlotDataService
            .GetPlotsOfBuilding(buildngId)
            .subscribe((res: any) => {
                this.plots = res;
            });
    }

    getArrFromObject(obj) {
        return Object.entries(obj);
    }
}
