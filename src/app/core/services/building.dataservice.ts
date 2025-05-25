import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_URL } from '../constants/constants';
import { BuildingDTO } from '../models/buildings/building.dto';

export interface PTSUNITDTO {
    unitId: number;
    ownershipPercentage: number;
    floorLevel: string;
    unitNumber: string;
    use: string;
    monthlyRentalValue: number;
    rentSource: string;
    occupancy: string;
    isComplete: boolean;
}
export interface PTSRETURNDTO {
    areaUnits: string;
    buildingId: number;
    buildingNumber: string;
    estimatedRoofArea: number;
    existancyStatus: string; // e.g., "Standing" or other status
    floorCount: number; // Total number of floors in the building
    isProtected: string; // e.g., "Yes" or "No"
    ownership: string; // Ownership type, e.g., "FREEHOLD"
    ownershipPercentage: number; // Ownership percentage
    ownershipType: string; // Type of ownership, e.g., "SOLE"
    plinthArea: number; // Base area of the building in the specified units
    plotId: string; // Associated plot ID
    redirectUrl: string; // URL for redirecting
    totalRentalValue: number; // Total rental value
    type: string; // Type of building, e.g., "Contemporary"
    units: PTSUNITDTO[];
}

export interface BuildingImageDTO {
    id: number;
    buildingId: number;
    uri: string;
}
@Injectable({
    providedIn: 'root',
})
export class BuildingDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    GetBuildingById(buildingId: number): Observable<BuildingDTO> {
        return this.http.get<BuildingDTO>(
            `${this.apiUrl}/building/${buildingId}`
        );
    }

    UpdateBuildingPlotByPlot(
        plotId: string,
        buildingId: number,
        polygonId: number
    ) {
        return this.http.patch(
            `${this.apiUrl}/building-plots/plotId/${plotId}`,
            {
                buildingId: buildingId,
                polygonId: polygonId,
            }
        );
    }

    assignBuildingToPlot(buildingId, plotId) {
        return this.http.patch(
            `${this.apiUrl}/building-plots/plot-assign/${buildingId}/${plotId}`,
            {}
        );
    }

    decoupleBuilding(buildingId, plotId) {
        return this.http.delete(
            `${this.apiUrl}/building-plots/plot/${buildingId}/${plotId}`
        );
    }

    DeleteBuilding(buildingId: number) {
        return this.http.delete(`${this.apiUrl}/building/${buildingId}`);
    }

    updateBuilding(buildingId: number, data: any) {
        return this.http.patch(`${this.apiUrl}/building/${buildingId}`, data);
    }

    CalculateTaxByPlotId(plotId: string): Observable<PTSRETURNDTO[]> {
        if (!plotId || plotId.trim() === '') {
            throw new Error('Plot ID is required.');
        }
        const params = new HttpParams().set('plotId', plotId.trim());
        return this.http.get<PTSRETURNDTO[]>(`${this.apiUrl}/pts/buildings`, {
            params,
        });
    }

    GetAllBuildingPhotosById(
        buildingId: number
    ): Observable<BuildingImageDTO[]> {
        return this.http.get<BuildingImageDTO[]>(
            `${this.apiUrl}/building-image/bid/${buildingId}`
        );
    }
}
