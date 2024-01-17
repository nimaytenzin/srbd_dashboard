import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { QRCodeModule } from 'angularx-qrcode';

import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { UnitDataService } from 'src/app/dataservice/unit.dataservice';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BuildingDataService } from 'src/app/dataservice/building.dataservice';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-building-inventory-view-building',
    templateUrl: './admin-building-inventory-view-building.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        AccordionModule,
        DividerModule,
        FieldsetModule,
        TableModule,
        QRCodeModule,
        ToastModule,
        ConfirmDialogModule,
        InputTextModule,
    ],
    providers: [MessageService, ConfirmationService],
    styleUrls: ['./admin-building-inventory-view-building.component.css'],
})
export class AdminBuildingInventoryViewBuildingComponent implements OnInit, OnDestroy {
    instance: DynamicDialogComponent | undefined;
    buildingId: number;

    buildingDetails: any;
    building: any;
    buildingPlots: any[];

    units: any[];

    constructor(
        public ref: DynamicDialogRef,
        private dialogService: DialogService,
        private buildingDetailService: BuildingDetailService,
        private unitDataService: UnitDataService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private buildingDataService: BuildingDataService,
        private buildingPlotDataService: BuildingPlotDataService,
        private router: Router
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
            this.getBuildingDetails(this.buildingId);
            this.getUnitsByBuildingId(this.buildingId);
            this.getBuilding(this.buildingId);
            this.getBuildingPlots(this.buildingId);
        }
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.ref.destroy();
    }

    goToBuildingDetailedView(buildingId) {
        this.router.navigate(['/admin/building-detailed', buildingId]);
        this.ref.close();
    }
    round(number) {
        return Math.round(number);
    }

    getBuilding(buildingId) {
        this.buildingDataService.GetBuildingById(10499).subscribe((res) => {
            this.building = res;
        });
    }

    getBuildingPlots(buildingId) {
        this.buildingPlotDataService
            .GetPlotsOfBuilding(buildingId)
            .subscribe((res: any) => {
                this.buildingPlots = res;
                console.log('BUIDLING PLOTS', res);
            });
    }
    getBuildingDetails(buildingId) {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(buildingId)
            .subscribe((res) => {
                console.log(res);
                this.buildingDetails = res;
            });
    }

    getQr(unit) {
        return unit;
    }

    getUnitsByBuildingId(buildingId) {
        this.unitDataService
            .GetAllUnitsByBuilding(buildingId)
            .subscribe((res: any[]) => {
                this.units = res;
                console.log(this.units);
            });
    }
    confirm2(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',

            accept: () => {
                this.buildingDataService
                    .DeleteBuilding(this.buildingId)
                    .subscribe((res) => {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Confirmed',
                            detail: 'Record deleted',
                        });
                        this.ref.close({
                            delete: true,
                        });
                    });
            },
            reject: () => {},
        });
    }
}
