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
import { ConfirmationService, Message, MessageService } from 'primeng/api';
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
import { PARSEDATE } from 'src/app/core/helper-function';
import { BuildingPlotDataService } from 'src/app/core/services/buildingplot.dataservice';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { ViewIndividualBuildingModalComponent } from './view-individual-building-modal/view-individual-building-modal.component';
import { AdminBuildingInventoryViewBuildingComponent } from '../../admin-building-inventory/admin-building-inventory-view-building/admin-building-inventory-view-building.component';
import { AdminMasterBuildingComponent } from '../../admin-master-building/admin-master-building.component';

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
    providers: [DialogService, ConfirmationService],
    templateUrl: './admin-view-plot-buildings.component.html',
    styleUrl: './admin-view-plot-buildings.component.scss',
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
        this.ref.onClose.subscribe((res) => {
            if (res['delete']) {
                this.reloadBuildings();
            }
        });
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
        if (this.buildingGeojson) {
            this.plotMap.removeLayer(this.buildingGeojson);
        }
        this.geometryDataService
            .GetPlotsGeomByPlotIdCsv(plotsCsv)
            .subscribe((res: any) => {
                if (res[0].features !== null) {
                    this.plotsGeojson = L.geoJSON(res, {
                        onEachFeature: (feature, layer) => {
                            layer.on({
                                click: (e: any) => {
                                    this.showAddBuilding(
                                        feature.properties['plotid']
                                    );
                                },
                            });
                        },
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
                        severity: 'success',
                        summary: 'Plot Details Found',
                        detail: 'Plot added to the map',
                    });
                    this.getBuildingsInPlot(this.plotId);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Plot Details  Not Found',
                        detail: 'Please check the plotId',
                    });
                    this.plotMap.remove();
                }
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

    showAddBuilding(plotId) {
        this.ref = this.dialogService.open(AdminMasterBuildingComponent, {
            header: 'Add building to PlotId: ' + plotId,
            data: {
                plotId: plotId,
            },
            width: '90%',
            height: '90%',
        });
        this.ref.onClose.subscribe((res) => {
            console.log('Add building dialog close', res);
            this.reloadBuildings();
        });
    }

    reloadBuildings() {
        this.plotMap.removeLayer(this.buildingGeojson);
        this.getBuildingsInPlot(this.plotId);
    }
}
