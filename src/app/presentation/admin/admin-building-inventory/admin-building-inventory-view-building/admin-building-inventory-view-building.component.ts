import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { QRCodeModule } from 'angularx-qrcode';
import { encodeBase32 } from 'geohashing';
import * as L from 'leaflet';
import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingPlotDataService } from 'src/app/core/services/buildingplot.dataservice';
import { Router } from '@angular/router';
import { ViewIndividualBuildingModalComponent } from '../../shared/admin-view-plot-buildings/view-individual-building-modal/view-individual-building-modal.component';
import { AdminMasterBuildingComponent } from '../../admin-master-building/admin-master-building.component';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { GeomEditType } from 'src/app/core/constants';

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
export class AdminBuildingInventoryViewBuildingComponent
    implements OnInit, OnDestroy {
    instance: DynamicDialogComponent | undefined;
    buildingId: number;
    geomId: number;

    buildingDetails: any;
    building: any;
    buildingPlots: any[];
    plotGeom: any;

    buildingPointsGeom: any;
    isBuildingPoint: boolean = false;

    units: any[];

    showZhicharPoints: boolean = true;
    showRedrawBuildings: boolean = true;

    constructor(
        public ref: DynamicDialogRef,
        public secondRef: DynamicDialogRef,
        private dialogService: DialogService,
        private buildingDetailService: BuildingDetailDataService,
        private unitDataService: UnitDataService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private buildingDataService: BuildingDataService,
        private buildingPlotDataService: BuildingPlotDataService,
        private geometryService: GeometryDataService,
        private router: Router
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
            this.isBuildingPoint = this.instance.data.isBuildingPoint;
            if (
                this.instance.data.showZhicharPoints &&
                this.instance.data.showZhicharPoints === false
            ) {
                this.showZhicharPoints = false;
            }
            if (
                this.instance.data.showRedrawBuilding &&
                this.instance.data.showRedrawBuilding === false
            ) {
                this.showRedrawBuildings = false;
            }
            this.geomId = this.instance.data.geomId
            this.getBuildingDetails(this.buildingId);
            this.getUnitsByBuildingId(this.buildingId);
            this.getBuilding(this.buildingId);
            this.getBuildingPlots(this.buildingId);
        }
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this.ref.destroy();
    }

    async showBuildingsNearBy() {
        let hash = await this.generateGoeHashFromPlotId();
        this.buildingPointsGeom = await this.geometryService.GetBuildingPointNearHash(hash).toPromise();
        this.ref.close({
            delete: false,
            type: 'POINTS',
            data: this.buildingPointsGeom,
        });
    }

    async assignBuildingToPlot(buildingId) {
        let plotId = this.buildingPlots[0]['plotId']
        this.buildingDataService.assignBuildingToPlot(buildingId, plotId).subscribe((res) => {
            if (res) {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Assigned',
                    detail: 'Record deleted',
                });
                this.ref.close({
                    delete: true,
                    type: 'DELETE',
                    data: null,
                });
            }

        })
    }

    async decoupleBuilding(buildingId) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to decouple this record?',
            header: 'Decouple Confirmation',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',

            accept: () => {
                let plotId = this.buildingPlots[0]['plotId']
                this.buildingDataService.decoupleBuilding(buildingId, plotId).subscribe((res) => {
                    if (res) {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Decoupled',
                            detail: 'Record deleted',
                        });
                        this.ref.close({
                            delete: true,
                            type: 'DELETE',
                            data: null,
                        });
                    }

                })
            },
            reject: () => { },
        });

    }

    async generateGoeHashFromPlotId() {
        let plotId = this.buildingPlots[0]['plotId'];
        let response = await this.geometryService
            .GetPlotGeom(plotId)
            .toPromise();
        this.plotGeom = L.geoJSON(response[0]);
        const center = this.plotGeom.getBounds().getCenter();
        const hash = encodeBase32(center.lat, center.lng, 5);
        console.log("this is the hash", hash, "lat: ", center.lat, " lng: ", center.lng)
        return hash;
    }

    async deleteGeometry() {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to delete this geometry?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',

            accept: () => {
                this.geometryService.deleteBuildingFootPrint(this.geomId).subscribe((res) => {
                    this.ref.close({
                        delete: true,
                        type: 'DELETE',
                        data: null,
                    });
                })
            },
            reject: () => { },
        });
    }

    async redrawBuilding(buildingId) {
        //redraw the shape of the building
        this.secondRef = this.dialogService.open(AdminMasterBuildingComponent, {
            header: 'REshape Building for id: ' + buildingId,
            data: {
                type: GeomEditType.EDIT,
                buildingId: buildingId,
            },
            width: '90%',
            height: '90%',
        });

        this.secondRef.onClose.subscribe((res) => {
            console.log('in menu', res);
            this.ref.close({
                delete: false,
                type: 'REDRAW',
                data: res,
            });
        });
    }

    goToBuildingDetailedView(buildingId) {
        this.ref = this.dialogService.open(
            ViewIndividualBuildingModalComponent,
            {
                header: 'Building ID: ' + buildingId,
                data: {
                    buildingId: buildingId,
                },
                width: '80vw',
            }
        );
    }
    round(number) {
        return Math.round(number);
    }

    getBuilding(buildingId) {
        this.buildingDataService
            .GetBuildingById(buildingId)
            .subscribe((res) => {
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
                            type: 'DELETE',
                            data: null,
                        });
                    });
            },
            reject: () => { },
        });
    }

    clearBuildingNearBy() {
        this.ref.close({
            delete: false,
            type: 'NO_POINTS',
            data: this.buildingPointsGeom,
        });
    }
}
