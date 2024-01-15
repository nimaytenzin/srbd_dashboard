import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import * as L from 'leaflet';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';
@Component({
    selector: 'app-admin-master-administrativezones',
    standalone: true,
    imports: [ButtonModule],
    templateUrl: './admin-master-administrativezones.component.html',
    styleUrl: './admin-master-administrativezones.component.scss',
})
export class AdminMasterAdministrativezonesComponent implements OnInit {
    map!: L.Map;
    admZoneGeojson!: L.GeoJSON;

    constructor(private geometryDataService: GeometryDataService) {}

    ngOnInit(): void {
        this.renderMap();
        this.loadAdministrativeZoneGeom();
    }

    renderMap() {
        this.map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }
    loadAdministrativeZoneGeom() {
        this.geometryDataService
            .GetAdministrativeZonesGeom()
            .subscribe((res: any) => {
                this.admZoneGeojson = L.geoJSON(res, {
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
                this.map.addLayer(this.admZoneGeojson);
                this.map.fitBounds(this.admZoneGeojson.getBounds());
            });
    }
}
