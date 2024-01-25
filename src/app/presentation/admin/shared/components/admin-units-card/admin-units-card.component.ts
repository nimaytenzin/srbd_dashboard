import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import {
    DialogService,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { QRCodeModule } from 'angularx-qrcode';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { GETBUILDINGFLOORLABEL } from 'src/app/core/helper-function';
import { EditUnitModalComponent } from '../../admin-view-plot-buildings/edit-unit-modal/edit-unit-modal.component';

@Component({
    selector: 'app-admin-units-card',
    templateUrl: './admin-units-card.component.html',
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TableModule,
        DynamicDialogModule,
        QRCodeModule,
    ],
    styleUrls: ['./admin-units-card.component.css'],
})
export class AdminUnitsCardComponent implements OnChanges {
    @Input() buildingId;

    ref: DynamicDialogRef | undefined;
    units: UnitDto[];
    getBuildingFloorLabel = GETBUILDINGFLOORLABEL;

    constructor(
        private unitDataService: UnitDataService,
        private dialogService: DialogService
    ) { }
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

    addUnit() {
        this.ref = this.dialogService.open(
            EditUnitModalComponent,
            {
                data: {
                    buildingId: this.buildingId,
                    isEditUnit: false,
                    isEditUnitDetails: false,
                },
                width: '70vw',
                height: '70vh'
            }
        )
        this.ref.onClose.subscribe((res) => {
            this.getUnitDetails();
        })
    }

    editUnit(unit) {
        this.ref = this.dialogService.open(
            EditUnitModalComponent,
            {
                data: {
                    buildingId: this.buildingId,
                    unit: unit,
                    isEditUnit: true,
                    isEditUnitDetails: false,
                    isCreateUnitDetails: false,
                },
                width: '70vw',
                height: '70vh'
            }
        )
        this.ref.onClose.subscribe((res) => {
            this.getUnitDetails();
        })

    }

    editUnitDetail(unit) {
        if (unit.unitDetail == null) {
            this.ref = this.dialogService.open(
                EditUnitModalComponent,
                {
                    data: {
                        buildingId: this.buildingId,
                        unit: unit,
                        isEditUnit: false,
                        isEditUnitDetails: false,
                        isCreateUnitDetails: true,
                    },
                    width: '70vw',
                    height: '70vh'
                }
            )
        } else {
            this.ref = this.dialogService.open(
                EditUnitModalComponent,
                {
                    data: {
                        buildingId: this.buildingId,
                        unit: unit,
                        isEditUnit: false,
                        isEditUnitDetails: true,
                        isCreateUnitDetails: false,
                    },
                    width: '70vw',
                    height: '70vh'
                }
            )

        }
        this.ref.onClose.subscribe((res) => {
            this.getUnitDetails();
        })


    }
}
