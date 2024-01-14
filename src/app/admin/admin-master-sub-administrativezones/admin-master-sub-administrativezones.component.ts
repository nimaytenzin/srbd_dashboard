import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import * as L from 'leaflet';

@Component({
    selector: 'app-admin-master-sub-administrativezones',
    standalone: true,
    imports: [ButtonModule],
    templateUrl: './admin-master-sub-administrativezones.component.html',
    styleUrl: './admin-master-sub-administrativezones.component.scss',
})
export class AdminMasterSubAdministrativezonesComponent implements OnInit {
    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;

    ngOnInit(): void {
        this.renderMap();
    }

    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('dzongkhagmap', {
            layers: [satelliteMap],
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }
}
