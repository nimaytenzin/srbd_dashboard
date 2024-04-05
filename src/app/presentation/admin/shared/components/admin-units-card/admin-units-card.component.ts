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
import { AdminEditUnitComponent } from '../crud-modals/units/admin-edit-unit/admin-edit-unit.component';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { BuildingOwnershipDto } from 'src/app/core/models/ownership/owner.dto';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
        ConfirmDialogModule,
        QRCodeModule,
    ],
    styleUrls: ['./admin-units-card.component.css'],
})
export class AdminUnitsCardComponent implements OnChanges, OnInit {
    @Input() buildingId;

    ref: DynamicDialogRef | undefined;
    units: UnitDto[];
    getBuildingFloorLabel = GETBUILDINGFLOORLABEL;

    buildingDetails!: BuildingDetailDto;
    buildingOwnerships: BuildingOwnershipDto[];

    constructor(
        private unitDataService: UnitDataService,
        private dialogService: DialogService,
        private buildingDetailService: BuildingDetailDataService,
        private confirmationService: ConfirmationService,
        private ownershipDataService: OwnershipDataService
    ) { }
    ngOnInit(): void {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(this.buildingId)
            .subscribe((res) => {
                this.buildingDetails = res;
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.getUnitDetails();
    }

    getUnitDetails() {
        this.unitDataService
            .GetAllUnitsByBuilding(this.buildingId)
            .subscribe((res) => {
                this.units = res;
                this.ownershipDataService
                    .GetAllBuildingOwnerships(this.buildingId)
                    .subscribe((res) => {
                        console.log(res);
                        console.log('BUILDing OWNerSHIP');
                        this.buildingOwnerships = res;
                    });
            });
    }

    getQr(val) {
        return val;
    }

    deleteUnit(unit) {
        console.log("Delete Unit")
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Do you want to this unit and its details?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',
            accept: () => {
                this.unitDataService.DeleteUnitAndDetails(unit.id).subscribe((res) => {
                    this.getUnitDetails();
                });
            },
            reject: () => {
            },
        });
    }

    addUnit() {
        this.ref = this.dialogService.open(EditUnitModalComponent, {
            data: {
                buildingId: this.buildingId,
                isEditUnit: false,
                isEditUnitDetails: false,
            },
            width: '40vw',
        });
        this.ref.onClose.subscribe((res) => {
            this.getUnitDetails();
        });
    }

    editUnit(unit) {
        this.ref = this.dialogService.open(AdminEditUnitComponent, {
            data: {
                buildingId: this.buildingId,
                unitId: unit.id,
                unit: unit,
                buildingDetails: this.buildingDetails,
            },
            header:
                'Editing BuildingID:' + this.buildingId + ', unitId:' + unit.id,
            width: 'max-content',
        });
        this.ref.onClose.subscribe((res) => {
            if (res.dataChanged) {
                console.log(res, 'DATA CHANGED UPDATING UNITS CARD');
                this.getUnitDetails();
            }
        });
        this.ref.onClose
    }

    editUnitDetail(unit) {
        if (unit.unitDetail == null) {
            this.ref = this.dialogService.open(EditUnitModalComponent, {
                data: {
                    buildingId: this.buildingId,
                    unit: unit,
                    isEditUnit: false,
                    isEditUnitDetails: false,
                    isCreateUnitDetails: true,
                },
                width: 'max-content',
                height: '70vh',
            });
        } else {
            this.ref = this.dialogService.open(EditUnitModalComponent, {
                data: {
                    buildingId: this.buildingId,
                    unit: unit,
                    isEditUnit: false,
                    isEditUnitDetails: true,
                    isCreateUnitDetails: false,
                },
                width: 'max-content',
                height: '70vh',
            });
        }
        this.ref.onClose.subscribe((res) => {
            this.getUnitDetails();
        });
    }
}
