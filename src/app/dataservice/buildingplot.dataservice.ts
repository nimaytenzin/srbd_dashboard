import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_URL } from './constants';

@Injectable({
    providedIn: 'root',
})
export class BuildingPlotDataService {
    apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    GetPlotsOfBuilding(buildingId: number) {
        return this.http.get(
            `${this.apiUrl}/building-plots/building/${buildingId}`
        );
    }
    GetBuildingsOfPlot(plotId: string) {
        return this.http.get(`${this.apiUrl}/building-plots/plot/${plotId}`);
    }
}
