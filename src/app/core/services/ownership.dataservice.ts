import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { API_URL } from '../constants/constants';
import { Observable } from 'rxjs';

import {
    BuildingOwnershipDto,
    CreateBuildingOwnershipDto,
    OwnerDto,
    UnitOwnershipDto,
    UpdateBuildingOwnershipDto,
} from '../models/ownership/owner.dto';

@Injectable({
    providedIn: 'root',
})
export class OwnershipDataService {
    apiUrl = API_URL;
    constructor(private http: HttpClient) {}

    CreateBuildingOwnership(
        data: CreateBuildingOwnershipDto
    ): Observable<BuildingOwnershipDto> {
        return this.http.post<BuildingOwnershipDto>(
            `${this.apiUrl}/building-ownership`,
            data
        );
    }

    GetUnitsByCid(cid: string) {
        return this.http.get(`${this.apiUrl}/unit/cid/${cid}`);
    }

    GetAllBuildingOwnerships(
        buildingId: number
    ): Observable<BuildingOwnershipDto[]> {
        return this.http.get<BuildingOwnershipDto[]>(
            `${this.apiUrl}/building-ownership/building/${buildingId}`
        );
    }

    GetOneByCid(cid: string): Observable<OwnerDto> {
        return this.http.get<OwnerDto>(`${this.apiUrl}/owner/cid/${cid}`);
    }

    DeleteBuildingOwnership(id: number) {
        return this.http.delete(`${this.apiUrl}/building-ownership/${id}`);
    }
    UpdateBuildingOwnership(id: number, data: UpdateBuildingOwnershipDto) {
        return this.http.patch(`${this.apiUrl}/building-ownership/${id}`, data);
    }

    MapUnitOwnership(data) {
        return this.http.post(`${this.apiUrl}/unit-ownership`, data);
    }

    GetAllUnitOwnershipByBuildingOwnership(
        boid: number
    ): Observable<UnitOwnershipDto[]> {
        return this.http.get<UnitOwnershipDto[]>(
            `${this.apiUrl}/unit-ownership/buildingownership/${boid}`
        );
    }

    DeleteUnitOwnership(id: number) {
        return this.http.delete(`${this.apiUrl}/unit-ownership/${id}`);
    }
    DeleteUnitOwnershipByBuildingOwnerUnit(
        buildingOwnershipId: number,
        unitId: number
    ) {
        return this.http.delete(
            `${this.apiUrl}/unit-ownership/buildingownership/${buildingOwnershipId}/unit/${unitId}`
        );
    }
}
