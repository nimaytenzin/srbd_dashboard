import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_URL } from '../constants/constants';

export interface DataCleaningStatus {
    dzongkhagId: number;
    dzongkhagName: string;
    totalBuildings: number;
    cleanedBuildings: number;
    notCleanedBuildings: number; // Updated to match API response
    cleanedPercentage: number; // Updated to match API response
}

// Remove the overview interface since API returns array directly

@Injectable({
    providedIn: 'root',
})
export class LocationDataService {
    apiUrl = API_URL;

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

    /**
     * Get data cleaning status by dzongkhag
     * @returns Observable of data cleaning status array
     */
    getDataCleaningStatus(): Observable<DataCleaningStatus[]> {
        return this.http.get<DataCleaningStatus[]>(
            `${this.apiUrl}/dzongkhag/data/cleaning/status`
        );
    }
}
