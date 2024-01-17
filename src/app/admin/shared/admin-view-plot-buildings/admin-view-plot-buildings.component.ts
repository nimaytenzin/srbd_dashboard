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
import { AdminBuildingInventoryViewBuildingComponent } from '../../admin-building-inventory/admin-building-inventory-view-building/admin-building-inventory-view-building.component';

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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminViewPlotBuildingsComponent implements OnInit, OnChanges {
    constructor(
        private buildingPlotDataService: BuildingPlotDataService,
        private messageService: MessageService,
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
    plotMap!: L.Map;
    buildingGeojson!: L.GeoJSON;
    plotsGeojson!: L.GeoJSON;

    plotIdsCsv: string;

    ngOnInit(): void {
        this.renderMap();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.getPlotGeom(this.plotId);
    }

    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.plotMap = L.map('plotMap', {
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
                this.buildingIds = [];
                for (
                    let index = 0;
                    index < this.buildingPlots.length;
                    index++
                ) {
                    const element = this.buildingPlots[index];
                    this.buildingIds.push(element.buildingId);
                }
                this.getBuildingsGeom(this.buildingIds);
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

    openDeleteInterface(buildingId: number) {
        this.ref = this.dialogService.open(
            AdminBuildingInventoryViewBuildingComponent,
            {
                header: 'Building ID: ' + buildingId,
                data: {
                    buildingId: buildingId,
                },
                width: 'max-content',
            }
        );
        this.ref.onClose.subscribe((res) => {});
    }

    async getBuildingsGeom(buildingIds: any[]) {
        if (this.buildingGeojson) {
            this.plotMap.removeLayer(this.buildingGeojson);
        }
        let buildingGeom = [];
        for (var i = 0; i < buildingIds.length; i++) {
            let geom = await this.geometryDataService
                .GetBuildingFootprintById(buildingIds[i])
                .toPromise();
            buildingGeom.push(geom);
        }
        let buildingFeature: any = {
            type: 'FeatureCollection',
            features: buildingGeom,
        };

        this.buildingGeojson = L.geoJSON(buildingFeature, {
            onEachFeature: (feature, layer) => {
                layer.on({
                    click: (e: any) => {
                        this.openDeleteInterface(feature.properties.buildingid);
                    },
                });
            },
            style: function (feature) {
                return {
                    fillColor: 'white',
                    fillOpacity: 0.5,
                    weight: 1,
                    opacity: 6,
                    color: 'black',
                };
            },
        }).addTo(this.plotMap);
    }

    getPlotGeom(plotsCsv: string) {
        if (this.plotsGeojson) {
            this.plotMap.removeLayer(this.plotsGeojson);
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
                }).addTo(this.plotMap);
                this.plotMap.fitBounds(this.plotsGeojson.getBounds());
                this.messageService.add({
                    key: 'maptoast',
                    severity: 'success',
                    summary: 'Plot Geometry Found',
                    detail: 'Successfully added to the map',
                });
                this.getBuildingsInPlot(this.plotId);
            });
    }

    getArrFromObject(obj) {
        return Object.entries(obj);
    }

    roundDecimal(number: number) {
        return Math.round(number);
    }
    getQr(value) {
        return value;
    }
}
