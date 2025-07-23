import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_URL } from '../constants/constants';
import {
    BuildingDTO,
    CreateBuildingsCleanedDto,
} from '../models/buildings/building.dto';
import { BuildingWithGeom } from './geometry.dataservice';

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

export interface MarkBuildingCleanedResponse {
    success: boolean;
    message: string;
    buildingId: number;
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

    GetBuildingsByGewog(gewogId: number): Observable<BuildingWithGeom[]> {
        return this.http.get<BuildingWithGeom[]>(
            `${this.apiUrl}/administrative-zone/buildings/${gewogId}`
        );
    }

    GetBuildingsWithoutImagesByGewog(
        gewogId: number
    ): Observable<BuildingWithGeom[]> {
        return this.http.get<BuildingWithGeom[]>(
            `${this.apiUrl}/administrative-zone/buildings/no-images/${gewogId}`
        );
    }

    GetUncleanedBuildingsByDzongkhag(
        dzongkhagId: number
    ): Observable<BuildingWithGeom[]> {
        return this.http.get<BuildingWithGeom[]>(
            `${this.apiUrl}/dzongkhag/buildings/uncleaned/${dzongkhagId}`
        );
    }

    GetCleanedBuildingsByDzongkhag(
        dzongkhagId: number
    ): Observable<BuildingWithGeom[]> {
        return this.http.get<BuildingWithGeom[]>(
            `${this.apiUrl}/dzongkhag/buildings/cleaned/${dzongkhagId}`
        );
    }

    /**
     * Mark building as cleaned with updated data
     * @param buildingId Building ID
     * @param userId User ID from decoded token
     * @param data Building cleaned data
     * @returns Observable of the mark cleaned response
     */
    markBuildingCleaned(
        buildingId: number,
        userId: number,
        data: CreateBuildingsCleanedDto
    ): Observable<MarkBuildingCleanedResponse> {
        return this.http.patch<MarkBuildingCleanedResponse>(
            `${this.apiUrl}/building/mark-cleaned/${buildingId}/${userId}`,
            data
        );
    }

    /**
     * Fetch cleaned building data by building ID
     * @param buildingId Building ID
     * @returns Observable of cleaned building data
     */
    findCleanedBuildingByBuildingId(
        buildingId: number
    ): Observable<BuildingDTO> {
        return this.http.get<BuildingDTO>(
            `${this.apiUrl}/building/cleaned/building/${buildingId}`
        );
    }

    uploadMovieMedia(file: File, buildingId: number) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('buildingId', buildingId.toString());

        return this.http.post(`${this.apiUrl}/building-image`, formData).pipe(
            catchError((error: any) => {
                console.error('Error uploading movie media:', error);
                return throwError(() => error);
            })
        );
    }
}
