import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import * as L from 'leaflet';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';

@Component({
    selector: 'app-admin-master-sub-administrativezones',
    standalone: true,
    imports: [ButtonModule],
    templateUrl: './admin-master-sub-administrativezones.component.html',
    styleUrl: './admin-master-sub-administrativezones.component.scss',
})
export class AdminMasterSubAdministrativezonesComponent implements OnInit {
    map!: L.Map;
    subAdmZoneGeojson!: L.GeoJSON;

    constructor(private geometryDataService: GeometryDataService) {}

    ngOnInit(): void {
        this.renderMap();
        this.loadSubAdministrativeZoneGeom();
    }

    renderMap() {
        this.map = L.map('dzongkhagmap', {
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }

    loadSubAdministrativeZoneGeom() {
        this.geometryDataService
            .GetSubAdminsitrativeZonesGeom()
            .subscribe((res: any) => {
                this.subAdmZoneGeojson = L.geoJSON(res, {
                    style: (feature) => {
                        return {
                            fillColor: this.getClassStyle(
                                feature.properties.class
                            ),
                            weight: 1,
                            fillOpacity: 1,
                            opacity: 1,
                            color: 'white',
                        };
                    },
                });
                this.map.addLayer(this.subAdmZoneGeojson);
                this.map.fitBounds(this.subAdmZoneGeojson.getBounds());
            });
    }

    getClassStyle(category: string) {
        switch (category) {
            case 'Class A':
                return '#F87943';
            case 'Class A1':
                return '#F8502C';
            case 'Class B':
                return '#F39F85';
            case 'Class C':
                return '#F2C6A7';
            case 'Class D':
                return '#F0EEC8';
            default:
                return '#FA0000';
        }
    }
}
