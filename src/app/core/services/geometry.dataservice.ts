import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { API_URL } from '../constants/constants';
import { Observable } from 'rxjs';

export interface BuildingWithGeom {
    id: number;
    clientBuildingId: number | null;
    geom: GeoJSON.Geometry;
    geomSource: string;
    address: string | null;
    qrUuid: string;
    existencyStatus: string;
    associativePosition: string;
    name: string;
    typology: string | null;
    type: string;
    primaryUse: string;
    secondaryUse: string | null;
    regularFloorCount: number;
    basementCount: number;
    stiltCount: number;
    atticCount: number;
    jamthogCount: number;
    length: number | null;
    breadth: number | null;
    footprintArea: number | null;
    contact: number;
    isProtected: boolean;
    status: string | null;
    subAdministrativeZoneId: number;
    createdAt: string;
    updatedAt: string;

    buildingImages: any[];
}
@Injectable({
    providedIn: 'root',
})
export class GeometryDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    postBuildingPoint(data) {
        return this.http.post(`${this.apiUrl}/building`, data);
    }

    postBuildingGeom(data) {
        return this.http.post(`${this.apiUrl}/building-footprint`, data);
    }

    updateBuildingGeom(buildingId: number, data) {
        return this.http.patch(
            `${this.apiUrl}/building-footprint/geometry/${buildingId}`,
            data
        );
    }

    deleteBuildingFootPrint(id: number) {
        return this.http.delete(`${this.apiUrl}/building-footprint/${id}`);
    }

    updateBuildingGeomBuildingId(buildingId: number, polygonId: number) {
        let data = {
            polygonId: polygonId,
            buildingId: buildingId,
        };
        return this.http.patch(`${this.apiUrl}/building-footprint/bid`, data);
    }

    postBuildingPlot(data) {
        return this.http.post(`${this.apiUrl}/building-plots`, data);
    }

    GetPlotGeom(plotId) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/plots/${plotId}`
        );
    }

    GetBuildingPointNearHash(hash) {
        return this.http.get(`${this.apiUrl}/building/near?hash=${hash}`);
    }

    GetDzongkhagsGeom() {
        return this.http.get(`${this.apiUrl}/dzongkhag/geom/all`);
    }
    GetAdministrativeZonesGeom() {
        return this.http.get(`${this.apiUrl}/administrative-zone/geom/all`);
    }

    GetSubAdminsitrativeZonesGeom(id) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/geom/${id}`
        );
    }

    GetAdministrativeBoundary(administrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/geom/${administrativeZoneId}`
        );
    }

    GetBuildingFootprintsByAdministrativeBoundary(
        administrativeZoneId: number
    ) {
        return this.http.get<BuildingWithGeom[]>(
            `${this.apiUrl}/administrative-zone/buildings/geom/${administrativeZoneId}`
        );
    }

    GetPlotsGeomBySubAdministrativeBoundary(subadmId: number) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/plots/geom/${subadmId}`
        );
    }

    GetPlotsGeomByAdministrativeBoundary(administrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/plots/geom/${administrativeZoneId}`
        );
    }
    GetSubAdministrativeBoundary(subAdministrativeZoneId: number) {
        return this.http.get(
            `${this.apiUrl}/sub-administrative-zone/geom/${subAdministrativeZoneId}`
        );
    }
    GetBuildingFootprintsBySubAdministrativeBoundary(
        subAdministrativeZoneId: number
    ): Observable<BuildingWithGeom[]> {
        return this.http.get<BuildingWithGeom[]>(
            `${this.apiUrl}/sub-administrative-zone/buildings/${subAdministrativeZoneId}`
        );
    }

    GetBuildingFootprintById(buildingId: number) {
        return this.http.get(
            `${this.apiUrl}/building-footprint/bid/${buildingId}`
        );
    }

    GetPlotsGeomByPlotIdCsv(plotIds: string) {
        return this.http.get(
            `${this.apiUrl}/administrative-zone/plots/${plotIds}`
        );
    }
}
