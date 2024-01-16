import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { BuildingDataService } from 'src/app/dataservice/building.dataservice';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';
import { UnitDataService } from 'src/app/dataservice/unit.dataservice';

@Component({
    selector: 'app-admin-building-detailed-view',
    standalone: true,
    imports: [TableModule, QRCodeModule, ButtonModule],
    templateUrl: './admin-building-detailed-view.component.html',
    styleUrl: './admin-building-detailed-view.component.scss',
})
export class AdminBuildingDetailedViewComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private buildingDataService: BuildingDataService,
        private buildingDetailService: BuildingDetailService,
        private unitDataService: UnitDataService,

        private buildingPlotDataService: BuildingPlotDataService
    ) {}

    building: any;
    buildingDetails: any;
    units: any[];
    buildingPlots: any;
    buildingId = this.route.snapshot.paramMap.get('buildingId');

    ngOnInit() {
        this.getBuilding(this.buildingId);
        this.getUnitsByBuildingId(this.buildingId);
    }

    getBuilding(buildingId) {
        this.buildingDataService.GetBuildingById(10499).subscribe((res) => {
            this.building = res;
        });
    }

    getQr(data) {
        return data;
    }

    getBuildingPlots(buildingId) {
        this.buildingPlotDataService
            .GetPlotsOfBuilding(buildingId)
            .subscribe((res: any) => {
                this.buildingPlots = res;
                console.log('BUIDLING PLOTS', res);
            });
    }
    getBuildingDetails(buildingId) {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(buildingId)
            .subscribe((res) => {
                console.log(res);
                this.buildingDetails = res;
            });
    }

    getUnitsByBuildingId(buildingId) {
        this.unitDataService
            .GetAllUnitsByBuilding(buildingId)
            .subscribe((res: any[]) => {
                this.units = res;
                console.log(this.units);
            });
    }
}
