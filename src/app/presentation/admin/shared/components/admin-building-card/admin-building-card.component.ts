import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { CardModule } from 'primeng/card';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';

@Component({
    selector: 'app-admin-building-card',
    standalone: true,
    imports: [CardModule, CommonModule, QRCodeModule],
    templateUrl: './admin-building-card.component.html',
    styleUrls: ['./admin-building-card.component.css'],
})
export class AdminBuildingCardComponent implements OnChanges {
    building!: BuildingDTO;

    @Input() buildingId;

    constructor(private buildingDataService: BuildingDataService) {}

    ngOnChanges() {
        this.getBulding();
    }

    getBulding() {
        this.buildingDataService
            .GetBuildingById(this.buildingId)
            .subscribe((res) => {
                console.log('BULDING DETIALS', res);
                if (res) {
                    this.building = res;
                } else {
                    this.building = null;
                }
            });
    }

    getQr(val) {
        return val;
    }
}
