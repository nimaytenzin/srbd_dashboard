import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit,OnDestroy } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogComponent, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';

@Component({
    selector: 'app-admin-building-card',
    standalone: true,
    imports: [CardModule, CommonModule, QRCodeModule, ButtonModule],
    templateUrl: './admin-building-card.component.html',
    styleUrls: ['./admin-building-card.component.css'],
})
export class AdminBuildingCardComponent implements OnChanges{
    building!: BuildingDTO;

    @Input() buildingId;

    constructor(private buildingDataService: BuildingDataService,
        public messageService: MessageService,
    ) {
    }

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

    async toggleIsProtected() {
        if (this.buildingId) {
            this.buildingDataService.updateBuilding(this.building.id, {
                isProtected: !this.building.isProtected
            }).subscribe((res) => {
                this.messageService.add({
                    severity: 'Success',
                    summary: 'Building Updated',
                    detail: 'Building Updated',
                });
                this.getBulding()
            });
        }
    }
}
