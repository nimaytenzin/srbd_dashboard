import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GeometryDataService {
    apiUrl = 'http://localhost:4322';

    constructor(private http: HttpClient) {}

    GetDzongkhagsGeom() {
        return this.http.get(`${this.apiUrl}/dzongkhag/geom/all`);
    }
    GetAdministrativeZonesGeom() {
        return this.http.get(`${this.apiUrl}/administrative-zone/geom/all`);
    }

    GetSubAdminsitrativeZonesGeom() {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/geom/all/all`
        );
    }

    GetAdministrativeBoundary(administrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/geom/${administrativeZoneId}`
        );
    }

    GetBuildingFootprintsByAdministrativeBoundary(
        administrativeZoneId: number
    ) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/buildings/geom/${administrativeZoneId}`
        );
    }

    GetPlotsGeomByAdministrativeBoundary(administrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/plots/geom/${administrativeZoneId}`
        );
    }
    GetSubAdministrativeBoundary(subAdministrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/geom/${subAdministrativeZoneId}`
        );
    }
    GetBuildingFootprintsBySubAdministrativeBoundary(
        subAdministrativeZoneId: number
    ) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/buildings/geom/${subAdministrativeZoneId}`
        );
    }
}
