import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    OnDestroy,
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
import { PARSEDATE } from 'src/app/api/helper-function';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';
import { ViewIndividualBuildingModalComponent } from './view-individual-building-modal/view-individual-building-modal.component';
import { AdminBuildingInventoryViewBuildingComponent } from '../../admin-building-inventory/admin-building-inventory-view-building/admin-building-inventory-view-building.component';
import { AdminMasterBuildingComponent } from '../../admin-master-building/admin-master-building.component';
import { AdminBuildingMenuComponent } from '../../admin-advancedsearch/admin-building-menu/admin-building-menu.component';
import { BuildingPointStatus, GeomEditType } from 'src/app/api/constants';

interface BuildingPoint {
    lat: number,
    lng: number,
    plotId: string,
    dzongkhagId: number,
}

interface BuildingGeom {
    geometry: string,
    dzoid: number,
    admid: number,
    subadmid: number,
    buildingid: number
    areaSqFt: number
}

interface BuildingPlot {
    buildingId: number;
    plotId: string;
    overlapPercentage: number;
}


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

export class AdminViewPlotBuildingsComponent implements OnInit, OnChanges, OnDestroy {
    constructor(
        private buildingPlotDataService: BuildingPlotDataService,
        private messageService: MessageService,
        private geometryDataService: GeometryDataService,
        private dialogService: DialogService
    ) { }

    ngOnDestroy(): void {
        this.plotMap = null;
    }

    @Input() plotId: string;
    ref: DynamicDialogRef | undefined;

    buildingPlots: any[];
    buildingIds: number[] = [];
    //asdsadsd
    building: any;
    buildingDetails: any;
    units: any[];
    plots: any[];

    buildingPoint: BuildingPoint = {
        lat: 0,
        lng: 0,
        plotId: '',
        dzongkhagId: 0
    };
    buildingGeom: BuildingGeom = {
        geometry: '',
        dzoid: 0,
        admid: 0,
        subadmid: 0,
        buildingid: 0,
        areaSqFt: 0
    };

    buildingPlot: BuildingPlot = {
        buildingId: 0,
        plotId: '',
        overlapPercentage: 0
    }

    notStartedBuildingStyle = {
        radius: 8,
        color: 'red',
        weight: 0,
        opacity: 1,
        fillColor: 'red',
        fillOpacity: 1,
    };
    completeBuildingStyle = {
        radius: 8,
        color: 'green',
        opacity: 1,
        weight: 0,
        fillColor: 'green',

        fillOpacity: 0.8,
    };
    inProgressBuildingStyle = {
        radius: 8,
        color: 'yellow',
        fillColor: 'yellow',

        weight: 0,
        opacity: 1,
        fillOpacity: 0.8,
    };

    parseDate = PARSEDATE;

    messages: Message[] | undefined;

    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    plotMap!: L.Map;
    buildingGeojson!: L.GeoJSON;
    buildingPointGeojson!: L.GeoJSON;
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
            if (res['type'] == "REDRAW") {
                if (res['data'] !== null) {

                    let resp = res['data']
                    let data = {
                        geometry: ''
                    }
                    //conversion to multipolygon for postgis
                    resp.geom['features'][0]['geometry']['type'] = "MultiPolygon"
                    resp.geom['features'][0]['geometry']['coordinates'] = [resp.geom['features'][0]['geometry']['coordinates']]
                    var jsonData = JSON.stringify(resp.geom['features'][0]['geometry'])
                    data.geometry = jsonData

                    this.updateBuildingGeom(buildingId, data).then((res) => {
                        console.log("update response", res[1]['rowCount'])
                        if (res[1]['rowCount']) {
                            this.reloadBuildings()
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Building Geom Updated',
                                detail: 'Building Geom Updated',
                            });
                        }
                    })
                }
            }
            if (res['type'] == "DELETE") {
                if (res['delete']) {
                    this.reloadBuildings()
                }
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
                console.log(res[0].features)
                if (res[0].features !== null) {
                    this.plotsGeojson = L.geoJSON(res, {
                        onEachFeature: (feature, layer) => {
                            layer.on({
                                click: (e: any) => {
                                    this.showAddBuilding(feature.properties['plotid'], feature.properties['dzongkhagi'])
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

    showAddBuilding(plotId, dzongkhagId) {
        this.ref = this.dialogService.open(
            AdminMasterBuildingComponent,
            // AdminBuildingMenuComponent,
            {
                header: 'Building Menu for plot: ' + plotId,
                data: {
                    type: GeomEditType.ADD,
                    plotId: plotId,
                },
                width: '90%',
                height: '90%'
            }
        )

        this.ref.onClose.subscribe((res) => {
            console.log("Add building dialog close", res);
            this.buildingPoint.lat = res.lat
            this.buildingPoint.lng = res.lng
            this.buildingPoint.dzongkhagId = dzongkhagId
            this.buildingPoint.plotId = `New Building Added on ${this.plotId}`


            res.geom['features'][0]['geometry']['type'] = "MultiPolygon"
            res.geom['features'][0]['geometry']['coordinates'] = [res.geom['features'][0]['geometry']['coordinates']]
            var jsonData = JSON.stringify(res.geom['features'][0]['geometry'])
            this.buildingGeom.geometry = jsonData

            this.insertBuildingPoint(this.buildingPoint).then((res: any) => {
                console.log("building id new ", res.id)

                this.buildingGeom.buildingid = res.id

                //building plot data
                this.buildingPlot.buildingId = res.id
                this.buildingPlot.plotId = this.plotId
                this.buildingPlot.overlapPercentage = 100.0

                this.insertBuildingGeom(this.buildingGeom).then((result) => {
                    if (result[1]) {
                        this.messageService.add({ severity: 'success', summary: 'Message', detail: 'Building added Successfully!!!' })
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Building could not be added!!!' })
                    }
                });
                this.insertBuildingPlots(this.buildingPlot).then((result) => {
                    if (result) {
                        this.reloadBuildings()
                        this.messageService.add({ severity: 'success', summary: 'Message', detail: 'Building Plot added Successfully!!!' })
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Building could not be added!!!' })
                    }
                })
            });

            // this.reloadBuildings()
            // this.reloadBuildingPoint(res)
        })
    }

    async reloadBuildingPoint(buildingPoint: any) {
        this.plotMap.removeLayer(this.buildingPointGeojson);
        this.buildingPointGeojson = L.geoJSON(buildingPoint['features'], {
            pointToLayer: (feature, latlng) => {
                const circleMarker = L.circleMarker(latlng);
                circleMarker.on('click', () => {
                    // this.plotMap.setView(circleMarker.getLatLng(), 20);
                });
                return circleMarker;
            },
            style: (feature: any) => {
                return this.getBuildingPointStyle(feature.properties.status);
            },
            onEachFeature: (feature, layer) => {
            },
        }).addTo(this.plotMap);
    }

    getBuildingPointStyle(status: string) {
        if (status === BuildingPointStatus.NOT_STARTED) {
            return this.notStartedBuildingStyle;
        } else if (status === BuildingPointStatus.IN_PROGRESS) {
            return this.inProgressBuildingStyle;
        } else if (status === BuildingPointStatus.COMPLETED) {
            return this.completeBuildingStyle;
        }
        return this.notStartedBuildingStyle;
    }

    reloadBuildings() {
        this.plotMap.removeLayer(this.buildingGeojson);
        this.getBuildingsInPlot(this.plotId)
    }

    async updateBuildingGeom(buildingId, data) {
        return await this.geometryDataService.updateBuildingGeom(buildingId, data).toPromise()
    }

    async insertBuildingPoint(data) {
        return await this.geometryDataService.postBuildingPoint(data).toPromise()
    }

    async insertBuildingGeom(data) {
        return await this.geometryDataService.postBuildingGeom(data).toPromise()
    }

    async insertBuildingPlots(data) {
        return await this.geometryDataService.postBuildingPlot(data).toPromise()
    }
}
