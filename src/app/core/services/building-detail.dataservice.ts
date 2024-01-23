import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../constants/constants';
import { BuildingDetailDto } from '../models/buildings/building-detail.dto';

@Injectable({
    providedIn: 'root',
})
export class BuildingDetailDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    GetBuildingDetailsByBuildingId(
        buildingId: number
    ): Observable<BuildingDetailDto> {
        return this.http.get(
            `${this.apiUrl}/building-detail/bid/${buildingId}`
        );
    }
}
