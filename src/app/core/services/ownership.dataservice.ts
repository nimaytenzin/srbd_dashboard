import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_URL } from '../constants/constants';
import { Observable } from 'rxjs';
import { UnitDto } from '../models/units/unit.dto';
import { CreateOwnerDto, OwnerDto } from '../models/ownership/owner.dto';

@Injectable({
    providedIn: 'root',
})
export class OwnershipDataServie {
    apiUrl = API_URL;
    constructor(private http: HttpClient) {}

    CreateOwner(data: CreateOwnerDto): Observable<OwnerDto> {
        return this.http.post<OwnerDto>(`${this.apiUrl}/owner`, data);
    }

    GetUnitsByCid(cid: string) {
        return this.http.get(`${this.apiUrl}/unit/cid/${cid}`);
    }

    GetOwnersByBuilding(buildingId: number) {
        return this.http.get(
            `${this.apiUrl}/unit/owners-by-building/${buildingId}`
        );
    }
}
