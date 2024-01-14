import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class LocationDataService {
    apiUrl = 'http://localhost:4322';

    constructor(private http: HttpClient) {}

    GetAllDzonghags() {
        return this.http.get(`${this.apiUrl}/dzongkhag`);
    }

    GetAllAdministrativeZonesByDzongkhag(dzongkhagId: number) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/dzongkhag/${dzongkhagId}`
        );
    }
    GetAllSubAdministrativeZonesByAdministrativeZone(
        administrativeZoneId: number
    ) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/adm-zone/${administrativeZoneId}`
        );
    }
}
