import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import {
    UnitNumbers,
    UnitOccupancyOption,
    UnitOccupancyStatus,
    UnitPrimaryUses,
} from 'src/app/core/constants';
import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';
import { BuildingDetailDataService } from 'src/app/core/services/building-detail.dataservice';
import { TabViewModule } from 'primeng/tabview';

export interface UnitDto {
    buildingId: number;
    unitNumberPrefix: string;
    unitNumber: string;
    qrUuid?: string;
    isLocked?: boolean;
}

export interface UnitDetailDto {
    unitId: number;
    occupancyStatus: string;
    use: string;
    numberOfBedrooms: number;
    rent: number;
}

@Component({
    selector: 'app-edit-unit-modal',
    standalone: true,
    imports: [
        ToastModule,
        CommonModule,
        FormsModule,
        InputNumberModule,
        ButtonModule,
        DropdownModule,
        TabViewModule,
    ],
    templateUrl: './edit-unit-modal.component.html',
    styleUrl: './edit-unit-modal.component.scss',
})
export class EditUnitModalComponent implements OnInit {
    floorLevelOption: any[];
    unitNumberOption: any[];
    unitOccupancyOption: any[];
    unitUseOption: any[];

    totalFloorCount: number = 0;

    selectedFloorLevel: number;
    selectedUnitNumber: any;
    selectedUnitOccupancy: any;
    selectedUnitUse: any;
    selectedUnitName: any;
    selectedContact: any;
    selectedNoBedroom: any;
    selectedRent: any;
    buildingId: number;

    isEditUnit: boolean = false;
    isEditUnitDetails: boolean = false;
    isCreateUnitDetails: boolean = false;
    instance: DynamicDialogComponent | undefined;

    unit: UnitDto = {
        buildingId: 0,
        unitNumberPrefix: '',
        unitNumber: '',
        qrUuid: '',
    };

    unitDetail: UnitDetailDto = {
        unitId: 0,
        occupancyStatus: '',
        use: '',
        numberOfBedrooms: 0,
        rent: 0,
    };

    buildingDetail: BuildingDetailDto;

    constructor(
        private dialogService: DialogService,
        public ref: DynamicDialogRef,
        public messageService: MessageService,
        private unitdataService: UnitDataService,
        private buildingDataService: BuildingDetailDataService
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
            this.isEditUnit = this.instance.data.isEditUnit;
            this.isEditUnitDetails = this.instance.data.isEditUnitDetails;
            this.isCreateUnitDetails = this.instance.data.isCreateUnitDetails;

            if (this.isEditUnitDetails) {
                this.unitDetail = this.instance.data.unit.unitDetail;
                this.selectedUnitOccupancy = this.unitDetail.occupancyStatus;
                this.selectedNoBedroom = this.unitDetail.numberOfBedrooms;
                this.selectedUnitUse = this.unitDetail.use;
                this.selectedRent = this.unitDetail.rent;
            }
            if (this.isEditUnit) {
                this.unit = this.instance.data.unit;
                this.selectedFloorLevel = Number(this.unit.unitNumberPrefix);
                this.selectedUnitNumber = this.unit.unitNumber;
            }
        }
    }

    ngOnInit(): void {
        this.unitNumberOption = UnitNumbers;
        this.unitOccupancyOption = UnitOccupancyOption;
        this.unitUseOption = UnitPrimaryUses;
        this.fetchBuildingDetail(this.buildingId);
    }

    async fetchBuildingDetail(buildingId) {
        this.buildingDetail = await this.buildingDataService
            .GetBuildingDetailsByBuildingId(buildingId)
            .toPromise();
        console.log('Building details', this.buildingDetail);
        this.totalFloorCount =
            this.buildingDetail.atticCount +
            this.buildingDetail.jamthogCount +
            this.buildingDetail.floorCount +
            this.buildingDetail.stiltCount; 
        this.floorLevelOption = Array.from(
            { length: this.totalFloorCount },
            (_, i) => i + 1
        );
        if(this.buildingDetail.basementCount > 0){
            for(var i = 1; i <= this.buildingDetail.basementCount; i ++){
                if(i == 1){
                    this.floorLevelOption.push('B')
                }else{
                    this.floorLevelOption.push(`${i}B`)
                }
            }
        }
    }

    async createUnitAndDetails() {
        this.unit = {
            buildingId: this.buildingId,
            unitNumberPrefix: this.selectedFloorLevel.toString(),
            unitNumber: this.selectedUnitNumber,
        };
        const createdUnit = await this.unitdataService
            .CreateUnit(this.unit)
            .toPromise();
        console.log(createdUnit);
        this.unit.qrUuid = createdUnit['id'].toString();
        const resp = await this.unitdataService
            .UpdateUnitByUnitId(this.unit, createdUnit['id'])
            .toPromise();
        if (resp) {
            this.messageService.add({
                severity: 'Success',
                summary: 'Unit Added',
                detail: 'Unit Added',
            });
        }

        this.unitDetail = {
            unitId: createdUnit['id'],
            occupancyStatus: this.selectedUnitOccupancy,
            use: this.selectedUnitUse,
            numberOfBedrooms: this.selectedNoBedroom,
            rent: this.selectedRent,
        };
        const resp2 = await this.unitdataService
            .CreateUnitDetail(this.unitDetail)
            .toPromise();
        if (resp2) {
            this.messageService.add({
                severity: 'Success',
                summary: 'Unit Detail Added',
                detail: 'Unit Detail Added',
            });
        }
        this.instance.close();
    }

    async updateUnit() {
        this.unit = {
            buildingId: this.buildingId,
            unitNumberPrefix: this.selectedFloorLevel.toString(),
            unitNumber: this.selectedUnitNumber,
        };
        const resp = await this.unitdataService
            .UpdateUnitByUnitId(this.unit, this.instance.data.unit.id)
            .toPromise();
        if (resp) {
            this.messageService.add({
                severity: 'Success',
                summary: 'Unit Updated',
                detail: 'Unit Updated',
            });
        }
        this.ref.close();
    }

    async updateUnitDetail() {
        this.unitDetail = {
            unitId: this.instance.data.unit.id,
            occupancyStatus: this.selectedUnitOccupancy,
            use: this.selectedUnitUse,
            numberOfBedrooms: this.selectedNoBedroom,
            rent: this.selectedRent,
        };
        const resp = await this.unitdataService
            .UpdateUnitDetails(this.instance.data.unit.id, this.unitDetail)
            .toPromise();
        if (resp) {
            this.messageService.add({
                severity: 'Success',
                summary: 'Unit Detail Updated',
                detail: 'Unit Detail Updated',
            });
        }
        this.ref.close();
    }

    async createUnitDetail() {
        this.unitDetail = {
            unitId: this.instance.data.unit.id,
            occupancyStatus: this.selectedUnitOccupancy,
            use: this.selectedUnitUse,
            numberOfBedrooms: this.selectedNoBedroom,
            rent: this.selectedRent,
        };
        const resp2 = await this.unitdataService
            .CreateUnitDetail(this.unitDetail)
            .toPromise();
        if (resp2) {
            this.messageService.add({
                severity: 'Success',
                summary: 'Unit Detail Added',
                detail: 'Unit Detail Added',
            });
        }
        this.ref.close();
    }
}
