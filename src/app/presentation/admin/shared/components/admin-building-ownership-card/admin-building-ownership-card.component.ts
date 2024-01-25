import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { AdminAddBuildingOwnershipComponent } from '../crud-modals/admin-add-building-ownership/admin-add-building-ownership.component';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';
import { BuildingOwnershipDto } from 'src/app/core/models/ownership/owner.dto';
import { AdminEditBuildingOwnershipComponent } from '../crud-modals/admin-edit-building-ownership/admin-edit-building-ownership.component';
import { AdminAddStrataUnitownershipComponent } from '../crud-modals/admin-add-strata-unitownership/admin-add-strata-unitownership.component';

@Component({
    selector: 'app-admin-building-ownership-card',
    templateUrl: './admin-building-ownership-card.component.html',
    standalone: true,
    imports: [CardModule, CommonModule, TableModule, ButtonModule],
    providers: [DialogService, ConfirmationService],
    styleUrls: ['./admin-building-ownership-card.component.css'],
})
export class AdminBuildingOwnershipCardComponent implements OnInit {
    building!: BuildingDTO;
    ref: DynamicDialogRef | undefined;
    buildingOwnerships: BuildingOwnershipDto[];
    @Input() buildingId;

    constructor(
        private buildingDataService: BuildingDataService,
        private dialogService: DialogService,
        private ownershipDataService: OwnershipDataService
    ) {}
    ngOnInit(): void {}

    ngOnChanges() {
        this.getBuildingOwnerships();
    }

    getBuildingOwnerships() {
        this.ownershipDataService
            .GetAllBuildingOwnerships(this.buildingId)
            .subscribe((res) => {
                this.buildingOwnerships = res;
            });
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

    openAddBuildingOwnershipModal() {
        this.ref = this.dialogService.open(AdminAddBuildingOwnershipComponent, {
            header: 'Add Ownership for bid ' + this.buildingId,
            data: {
                buildingId: this.buildingId,
            },
            width: 'max-content',
        });
        this.ref.onClose.subscribe((res) => {
            if (res.added) {
                this.getBuildingOwnerships();
            }
        });
    }

    openEditBuildingOwnershipModal(buildingOwnership: BuildingOwnershipDto) {
        this.ref = this.dialogService.open(
            AdminEditBuildingOwnershipComponent,
            {
                header: 'Edit Ownership for bid ' + this.buildingId,
                data: {
                    ...buildingOwnership,
                },
                width: 'max-content',
            }
        );
        this.ref.onClose.subscribe((res) => {
            if (res.updated) {
                this.getBuildingOwnerships();
            }
            if (res.deleted) {
                this.getBuildingOwnerships();
            }
        });
    }

    openAddStrataUnitOwnershipModal(buildingOwnership: BuildingOwnershipDto) {
        this.ref = this.dialogService.open(
            AdminAddStrataUnitownershipComponent,
            {
                header: 'Please Select Units ',
                data: {
                    ...buildingOwnership,
                },
                width: 'max-content',
            }
        );
        this.ref.onClose.subscribe((res) => {
            if (res.updated) {
                this.getBuildingOwnerships();
            }
            if (res.deleted) {
                this.getBuildingOwnerships();
            }
        });
    }
}
