import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_URL } from './constants';

@Injectable({
    providedIn: 'root',
})
export class UnitDataService {
    apiUrl = API_URL;
    constructor(private http: HttpClient) {}

    GetAllUnitsByBuilding(buildingId: number) {
        return this.http.get(`${this.apiUrl}/unit/bid/${buildingId}`);
    }
}
