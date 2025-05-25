import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MessageService, SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import {
    BuildingWithGeom,
    GeometryDataService,
} from 'src/app/core/services/geometry.dataservice';
import {
    DialogService,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AdminBuildingInventoryViewDetailsComponent } from './components/admin-building-inventory-view-details/admin-building-inventory-view-details.component';

@Component({
    selector: 'app-admin-building-inventory',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        CardModule,
        ButtonModule,
        DividerModule,
        DynamicDialogModule,
    ],
    providers: [DialogService, MessageService],
    templateUrl: './admin-building-inventory.component.html',
    styleUrl: './admin-building-inventory.component.scss',
})
export class AdminBuildingInventoryComponent implements OnInit {
    constructor(
        private locationDataService: LocationDataService,
        private geometryDataService: GeometryDataService,
        public dialogService: DialogService
    ) {}

    ref: DynamicDialogRef | undefined;

    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;
    buildingGeojson!: L.GeoJSON;
    plotsGeojson!: L.GeoJSON;
    boundary = {} as L.GeoJSON;

    dzongkhags: any[] = [];
    administrativeZones: any[] = [];
    subadministrativeZones: any[] = [];

    selectedDzongkhag: any;
    selectedAdministrativeZone: any;
    selectedSubAdministrativeZone: any;
    selected = false;
    mapStateStored = localStorage.getItem('mapState');

    ngOnInit(): void {
        this.renderMap();
        this.loadDzongkhags();
    }

    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('map', {
            layers: [satelliteMap],
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }

    onDzongkahgChange(event) {
        this.loadAdministrativeZonesByDzongkhag(event.id);
    }

    loadDzongkhags() {
        this.locationDataService.GetAllDzonghags().subscribe((res: any) => {
            this.dzongkhags = res;
            // this.selectedDzongkhag = res[0];
        });
    }
    loadAdministrativeZonesByDzongkhag(dzongkhagId: number) {
        this.selected = true;
        this.locationDataService
            .GetAllAdministrativeZonesByDzongkhag(dzongkhagId)
            .subscribe((res: any) => {
                this.administrativeZones = res;
                this.selectedAdministrativeZone = res[0];
            });
    }
    loadSubadministrativeZonesByAdministrativeZone(admZoneId: number) {
        this.locationDataService
            .GetAllSubAdministrativeZonesByAdministrativeZone(admZoneId)
            .subscribe((res: any) => {
                this.subadministrativeZones = res;
                this.selectedSubAdministrativeZone = res[0];
            });
    }

    onAdministrativeZoneChange(event) {
        this.loadSubadministrativeZonesByAdministrativeZone(event.id);
    }

    loadPlotsAndBuildings() {
        this.geometryDataService
            .GetBuildingFootprintsBySubAdministrativeBoundary(
                this.selectedSubAdministrativeZone.id
            )
            .subscribe((res: BuildingWithGeom[]) => {
                // Convert BuildingWithGeom to GeoJSON
                const geoJsonData = this.convertBuildingsToGeoJSON(res);

                // Render GeoJSON on the map
                this.buildingGeojson = L.geoJSON(geoJsonData, {
                    style: function (feature) {
                        let color = 'red'; // Default color for INCOMPLETE or NULL
                        if (feature.properties.status === 'SYNCED') {
                            color = 'green';
                        } else if (feature.properties.status === 'COMPLETE') {
                            color = 'yellow';
                        }
                        return {
                            fillColor: 'transparent',
                            weight: 3,
                            opacity: 1,
                            color: color,
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            click: (e: any) => {
                                this.showBuilding(feature.properties);
                            },
                        });
                    },
                }).addTo(this.map);
                this.fitMapBounds();
            });
    }

    convertBuildingsToGeoJSON(
        buildings: BuildingWithGeom[]
    ): GeoJSON.FeatureCollection {
        return {
            type: 'FeatureCollection',
            features: buildings.map((building) => ({
                type: 'Feature',
                geometry: building.geom,
                properties: {
                    ...building,
                },
            })),
        };
    }

    // loadPlotsAndBuildings() {
    //     this.geometryDataService
    //         .GetBuildingFootprintsBySubAdministrativeBoundary(
    //             this.selectedSubAdministrativeZone.id
    //         )
    //         .subscribe((res: any) => {
    //             this.buildingGeojson = L.geoJSON(res, {
    //                 style: function (feature) {
    //                     return {
    //                         fillColor: 'transparent',
    //                         weight: 3,
    //                         opacity: 1,
    //                         color: 'white',
    //                     };
    //                 },
    //                 onEachFeature: (feature, layer) => {
    //                     layer.on({
    //                         click: (e: any) => {
    //                             console.log('lskdjf;alksjdflkj', feature);
    //                             this.showBuilding(
    //                                 feature.properties.buildingid,
    //                                 feature.properties.id_0
    //                             );
    //                         },
    //                     });
    //                 },
    //             }).addTo(this.map);
    //         });

    //     // this.fitMapBounds();
    //     // this.clearMapState();
    //     // this.geometryDataService
    //     //     .GetSubAdministrativeBoundary(this.selectedSubAdministrativeZone.id)
    //     //     .subscribe((res: any) => {
    //     //         this.boundary = L.geoJSON(res, {
    //     //             style: function (feature) {
    //     //                 return {
    //     //                     fillColor: 'transparent',
    //     //                     weight: 3,
    //     //                     opacity: 1,
    //     //                     color: 'yellow',
    //     //                 };
    //     //             },
    //     //         });

    //     //         this.geometryDataService
    //     //             .GetPlotsGeomBySubAdministrativeBoundary(
    //     //                 this.selectedSubAdministrativeZone.id
    //     //             )
    //     //             .subscribe((res: any) => {
    //     //                 this.plotsGeojson = L.geoJSON(res, {
    //     //                     style: function (feature) {
    //     //                         return {
    //     //                             fillColor: 'transparent',
    //     //                             weight: 1,
    //     //                             opacity: 1,
    //     //                             color: 'red',
    //     //                         };
    //     //                     },
    //     //                 }).addTo(this.map);

    //     //                 this.geometryDataService
    //     //                     .GetBuildingFootprintsBySubAdministrativeBoundary(
    //     //                         this.selectedSubAdministrativeZone.id
    //     //                     )
    //     //                     .subscribe((res: any) => {
    //     //                         this.buildingGeojson = L.geoJSON(res, {
    //     //                             style: function (feature) {
    //     //                                 return {
    //     //                                     fillColor: 'transparent',
    //     //                                     weight: 3,
    //     //                                     opacity: 1,
    //     //                                     color: 'white',
    //     //                                 };
    //     //                             },
    //     //                             onEachFeature: (feature, layer) => {
    //     //                                 layer.on({
    //     //                                     click: (e: any) => {
    //     //                                         console.log(
    //     //                                             'lskdjf;alksjdflkj',
    //     //                                             feature
    //     //                                         );
    //     //                                         this.showBuilding(
    //     //                                             feature.properties
    //     //                                                 .buildingid,
    //     //                                             feature.properties.id_0
    //     //                                         );
    //     //                                     },
    //     //                                 });
    //     //                             },
    //     //                         }).addTo(this.map);
    //     //                     });

    //     //                 this.fitMapBounds();
    //     //             });
    //     //     });
    // }
    showBuilding(properties: any) {
        console.log('showBuilding', properties);
        this.ref = this.dialogService.open(
            AdminBuildingInventoryViewDetailsComponent,
            {
                header: 'Details',
                width: '50vw',
                data: {
                    ...properties,
                },
            }
        );
    }

    clearMapState() {
        localStorage.removeItem('mapState');
        if (this.plotsGeojson) {
            this.map.removeLayer(this.plotsGeojson);
        }
        if (this.boundary) {
            this.map.removeLayer(this.boundary);
        }
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
    }

    fitMapBounds() {
        this.map.fitBounds(this.buildingGeojson.getBounds());
        // this.boundary.bringToBack();
    }

    async updateBuildingGeom(buildingId, data) {
        return await this.geometryDataService
            .updateBuildingGeom(buildingId, data)
            .toPromise();
    }

    async insertBuildingPoint(data) {
        return await this.geometryDataService
            .postBuildingPoint(data)
            .toPromise();
    }

    async insertBuildingGeom(data) {
        return await this.geometryDataService
            .postBuildingGeom(data)
            .toPromise();
    }

    async insertBuildingPlots(data) {
        return await this.geometryDataService
            .postBuildingPlot(data)
            .toPromise();
    }
}
