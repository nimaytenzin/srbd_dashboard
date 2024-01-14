import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { LocationDataService } from 'src/app/dataservice/location.dataservice';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';
import {
    DialogService,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AdminBuildingInventoryViewBuildingComponent } from './admin-building-inventory-view-building/admin-building-inventory-view-building.component';

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
    providers: [DialogService],
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
        console.log(event);
        this.loadSubadministrativeZonesByAdministrativeZone(event.id);
    }

    showBuilding(buildingId: number) {
        this.ref = this.dialogService.open(
            AdminBuildingInventoryViewBuildingComponent,
            {
                header: 'Building Details',
                data: {
                    buildingId: buildingId,
                },
                width: '50vw',
            }
        );
    }

    loadAdministrativeData() {
        this.geometryDataService
            .GetAdministrativeBoundary(this.selectedAdministrativeZone.id)
            .subscribe((res: any) => {
                this.boundary = L.geoJSON(res, {
                    style: function (feature) {
                        return {
                            fillColor: 'transparent',
                            weight: 3,
                            opacity: 1,
                            color: 'yellow',
                        };
                    },
                });
                this.map.addLayer(this.boundary);
                this.map.fitBounds(this.boundary.getBounds());
                this.boundary.bringToBack();

                this.geometryDataService
                    .GetPlotsGeomByAdministrativeBoundary(
                        this.selectedAdministrativeZone.id
                    )
                    .subscribe((res: any) => {
                        console.log('ADDING PLOTS TO MAP');
                        console.log(res);
                        this.plotsGeojson = L.geoJSON(res, {
                            style: function (feature) {
                                return {
                                    fillColor: 'transparent',
                                    weight: 1,
                                    opacity: 1,
                                    color: 'red',
                                };
                            },
                        }).addTo(this.map);

                        this.geometryDataService
                            .GetBuildingFootprintsByAdministrativeBoundary(
                                this.selectedAdministrativeZone.id
                            )
                            .subscribe((res: any) => {
                                this.buildingGeojson = L.geoJSON(res, {
                                    style: function (feature) {
                                        return {
                                            fillColor: 'transparent',
                                            weight: 3,
                                            opacity: 1,
                                            color: 'white',
                                        };
                                    },
                                    onEachFeature: (feature, layer) => {
                                        // console.log(feature);

                                        layer.on({
                                            click: (e: any) => {
                                                this.showBuilding(
                                                    feature.properties.id
                                                );
                                            },
                                        });
                                    },
                                }).addTo(this.map);
                            });
                    });
            });
    }
}
