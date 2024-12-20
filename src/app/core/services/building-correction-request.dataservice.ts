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
import {
    BuildingCorrectionRequestDTO,
    UpdateBuildingCorrectionRequestDTO,
} from '../models/bulding-correction.dto';

@Injectable({
    providedIn: 'root',
})
export class BuildingCorrectionRequestDataService {
    apiUrl = API_URL;
    constructor(private http: HttpClient) {}

    CreateBuildingCorrectionRequest(data: FormData) {
        return this.http.post(`${this.apiUrl}/correction-request`, data);
    }

    FindAllPendingRequest(): Observable<BuildingCorrectionRequestDTO[]> {
        return this.http.get<BuildingCorrectionRequestDTO[]>(
            `${this.apiUrl}/correction-request/pending`
        );
    }
    FindAllByPlotId(plotId): Observable<BuildingCorrectionRequestDTO[]> {
        return this.http.get<BuildingCorrectionRequestDTO[]>(
            `${this.apiUrl}/correction-request/plot/${plotId}`
        );
    }
    FindAllByPlotAndOwnerCID(
        plotId,
        ownerCid
    ): Observable<BuildingCorrectionRequestDTO[]> {
        return this.http.get<BuildingCorrectionRequestDTO[]>(
            `${this.apiUrl}/correction-request/public/track/${plotId}/${ownerCid}`
        );
    }

    UpdateStatus(
        id: number,
        data: UpdateBuildingCorrectionRequestDTO
    ): Observable<BuildingCorrectionRequestDTO> {
        return this.http.patch<BuildingCorrectionRequestDTO>(
            `${this.apiUrl}/correction-request/${id}`,
            data
        );
    }
}
