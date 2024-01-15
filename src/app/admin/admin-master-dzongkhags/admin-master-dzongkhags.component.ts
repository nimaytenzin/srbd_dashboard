import { Component, OnInit } from '@angular/core';
import { LocationDataService } from 'src/app/dataservice/location.dataservice';
import { TableModule } from 'primeng/table';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';

@Component({
    selector: 'app-admin-master-dzongkhags',
    standalone: true,
    imports: [TableModule, ButtonModule],
    templateUrl: './admin-master-dzongkhags.component.html',
    styleUrl: './admin-master-dzongkhags.component.scss',
})
export class AdminMasterDzongkhagsComponent implements OnInit {
    constructor(
        private locationDataService: LocationDataService,
        private geometryDataService: GeometryDataService
    ) {}

    dzongkhags: any[] = [];
    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;
    dzongkhagsGeojson!: L.GeoJSON;

    ngOnInit(): void {
        this.locationDataService.GetAllDzonghags().subscribe((res: any) => {
            this.dzongkhags = res;
        });
        this.renderMap();
        this.loadDzongkhagsGeom();
    }

    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('dzongkhagmap', {
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }

    loadDzongkhagsGeom() {
        this.geometryDataService.GetDzongkhagsGeom().subscribe((res: any) => {
            this.dzongkhagsGeojson = L.geoJSON(res, {
                style: function (feature) {
                    return {
                        fillColor: 'white',
                        weight: 1,
                        fillOpacity: 1,
                        opacity: 1,
                        color: 'black',
                    };
                },
            });
            this.map.addLayer(this.dzongkhagsGeojson);
            this.map.fitBounds(this.dzongkhagsGeojson.getBounds());
        });
    }
}
