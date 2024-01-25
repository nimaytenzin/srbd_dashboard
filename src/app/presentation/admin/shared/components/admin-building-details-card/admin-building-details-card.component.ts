import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { PARSEBUILDINGFLOORS, PARSEDATE } from 'src/app/core/helper-function';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';

@Component({
    selector: 'app-admin-building-details-card',
    standalone: true,
    imports: [CardModule, CommonModule],
    templateUrl: './admin-building-details-card.component.html',
    styleUrls: ['./admin-building-details-card.component.css'],
})
export class AdminBuildingDetailsCardComponent implements OnChanges {
    @Input() buildingId;
    buildingDetails: BuildingDetailDto;
    parseDate = PARSEDATE;
    parseBuildingFloorLabel = PARSEBUILDINGFLOORS;
    constructor(private buildingDetailDataService: BuildingDetailDataService) {}
    ngOnChanges(changes: SimpleChanges): void {
        this.getBuildingDetails();
    }

    getBuildingDetails() {
        this.buildingDetailDataService
            .GetBuildingDetailsByBuildingId(this.buildingId)
            .subscribe((res) => {
                console.log(res);
                this.buildingDetails = res;
            });
    }
}
