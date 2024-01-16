import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import * as L from 'leaflet';
import { Message, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { PARSEDATE } from 'src/app/api/helper-function';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { BuildingDataService } from 'src/app/dataservice/building.dataservice';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';
import { UnitDataService } from 'src/app/dataservice/unit.dataservice';
import { AdminViewBuildingComponent } from '../admin-view-building/admin-view-building.component';
import { ViewIndividualBuildingModalComponent } from './view-individual-building-modal/view-individual-building-modal.component';

@Component({
    selector: 'app-admin-view-plot-buildings',
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
        ToastModule,
        QRCodeModule,
    ],
    providers: [DialogService],
    templateUrl: './admin-view-plot-buildings.component.html',
    styleUrl: './admin-view-plot-buildings.component.scss',
    changeDetection: ChangeDetectionStrategy.Default,
})
export class AdminViewPlotBuildingsComponent implements OnInit, OnChanges {
    constructor(
        private buildingPlotDataService: BuildingPlotDataService,
        private buildingDataService: BuildingDataService,
        private buildingDetailService: BuildingDetailService,
        private messageService: MessageService,
        private unitDataService: UnitDataService,
        private geometryDataService: GeometryDataService,
        private dialogService: DialogService
    ) {}
    @Input() plotId: string;
    ref: DynamicDialogRef | undefined;

    buildingPlots: any[];
    buildingIds: number[] = [];
    //asdsadsd
    building: any;
    buildingDetails: any;
    units: any[];
    plots: any[];

    parseDate = PARSEDATE;

    messages: Message[] | undefined;

    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;
    buildingGeojson!: L.GeoJSON;
    plotsGeojson!: L.GeoJSON;

    plotIdsCsv: string;

    ngOnInit(): void {
        this.renderMap();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.search();
    }
    search() {
        this.getBuildingsInPlot(this.plotId);

        console.log('BUIDLING IDS', this.buildingIds);
        // this.getBuilding(Number(this.buildingId));
        // this.getBuildingDetails(Number(this.buildingId));
        // this.getBuildingUnits(Number(this.buildingId));
    }

    roundDecimal(number: number) {
        return Math.round(number);
    }
    getQr(value) {
        return value;
    }
    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('plotMap', {
            layers: [satelliteMap],
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }

    getBuildingsInPlot(plotId: string) {
        this.buildingPlotDataService
            .GetBuildingsOfPlot(plotId)
            .subscribe((res: any) => {
                this.buildingPlots = res;
                for (
                    let index = 0;
                    index < this.buildingPlots.length;
                    index++
                ) {
                    const element = this.buildingPlots[index];
                    this.buildingIds.push(element.buildingId);
                }
            });
    }

    showBuilding(buildingId: number) {
        this.ref = this.dialogService.open(
            ViewIndividualBuildingModalComponent,
            {
                header: 'Building ID: ' + buildingId,
                data: {
                    buildingId: buildingId,
                },
            }
        );
    }

    getBuilding(buildingId: number) {
        this.buildingDataService
            .GetBuildingById(buildingId)
            .subscribe((res) => {
                this.building = res;
                this.messageService.add({
                    key: 'global',
                    severity: 'success',
                    summary: 'Building Found',
                    detail: 'details loaded for Building ID: ' + buildingId,
                });
            });
    }

    getBuildingDetails(buildingId: number) {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(buildingId)
            .subscribe((res) => {
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

    getBuildingFootprint(buildingId) {
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
        this.geometryDataService
            .GetBuildingFootprintById(buildingId)
            .subscribe((res: any) => {
                this.buildingGeojson = L.geoJSON(res, {
                    style: (feature) => {
                        return {
                            fillColor: 'white',
                            weight: 1,
                            fillOpacity: 0.3,
                            opacity: 1,
                            color: 'white',
                        };
                    },
                }).addTo(this.map);
                this.map.fitBounds(this.buildingGeojson.getBounds());
                this.messageService.add({
                    key: 'maptoast',
                    severity: 'success',
                    summary: 'Building Footprint data found',
                    detail: 'Footprint added to the map',
                });
            });
    }

    getPlotGeom(plotsCsv: string) {
        if (this.plotsGeojson) {
            this.map.removeLayer(this.plotsGeojson);
        }
        this.geometryDataService
            .GetPlotsGeomByPlotIdCsv(plotsCsv)
            .subscribe((res: any) => {
                this.plotsGeojson = L.geoJSON(res, {
                    style: (feature) => {
                        return {
                            fillColor: 'transparent',
                            weight: 1,
                            opacity: 1,
                            color: 'red',
                        };
                    },
                }).addTo(this.map);
                this.map.fitBounds(this.plotsGeojson.getBounds());

                this.messageService.add({
                    key: 'maptoast',
                    severity: 'success',
                    summary: 'Plot Geometry Found',
                    detail: 'Successfully added to the map',
                });
            });
    }

    getArrFromObject(obj) {
        return Object.entries(obj);
    }
}
