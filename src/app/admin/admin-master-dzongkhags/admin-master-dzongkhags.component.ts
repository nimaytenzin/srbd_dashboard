import { Component, OnInit } from '@angular/core';
import { LocationDataService } from 'src/app/dataservice/location.dataservice';
import { TableModule } from 'primeng/table';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-admin-master-dzongkhags',
    standalone: true,
    imports: [TableModule, ButtonModule],
    templateUrl: './admin-master-dzongkhags.component.html',
    styleUrl: './admin-master-dzongkhags.component.scss',
})
export class AdminMasterDzongkhagsComponent implements OnInit {
    constructor(private locationDataService: LocationDataService) {}

    dzongkhags: any[] = [];
    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;

    ngOnInit(): void {
        this.locationDataService.GetAllDzonghags().subscribe((res: any) => {
            this.dzongkhags = res;
        });
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
