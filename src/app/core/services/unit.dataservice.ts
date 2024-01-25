import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_URL } from '../constants/constants';
import { Observable } from 'rxjs';
import { UnitDto } from '../models/units/unit.dto';

@Injectable({
    providedIn: 'root',
})
export class UnitDataService {
    apiUrl = API_URL;
    constructor(private http: HttpClient) {}

    GetAllUnitsByBuilding(buildingId: number): Observable<UnitDto[]> {
        return this.http.get<UnitDto[]>(
            `${this.apiUrl}/unit/bid/${buildingId}`
        );
    }

    GetUnitById(unitId: number) {
        return this.http.get(`${this.apiUrl}/unit/${unitId}`);
    }
    GetUnitDetails(unitId: number) {
        return this.http.get(`${this.apiUrl}/unit-detail/uid/${unitId}`);
    }

    UpdateUnitDetails(unitId: number, data) {
        return this.http.patch(
            `${this.apiUrl}/unit-detail/uid/${unitId}`,
            data
        );
    }
}
