import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { GETBUILDINGFLOORLABEL } from 'src/app/core/helper-function';

@Component({
    selector: 'app-admin-units-card',
    templateUrl: './admin-units-card.component.html',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TableModule,
        QRCodeModule,
    ],
    styleUrls: ['./admin-units-card.component.css'],
})
export class AdminUnitsCardComponent implements OnChanges {
    @Input() buildingId;

    units: UnitDto[];
    getBuildingFloorLabel = GETBUILDINGFLOORLABEL;
    constructor(private unitDataService: UnitDataService) {}
    ngOnChanges(changes: SimpleChanges): void {
        this.getUnitDetails();
    }

    getUnitDetails() {
        this.unitDataService
            .GetAllUnitsByBuilding(this.buildingId)
            .subscribe((res) => {
                this.units = res;
            });
    }

    getQr(val) {
        return val;
    }
}
