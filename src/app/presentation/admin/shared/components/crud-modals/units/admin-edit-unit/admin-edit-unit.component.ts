import { Component, OnInit } from '@angular/core';
import { BuildingDetailDto } from 'src/app/core/models/buildings/building-detail.dto';

import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
    UnitNumbers,
    UnitOccupancyOption,
    UnitPrimaryUses,
} from 'src/app/core/constants';
import { TabViewModule } from 'primeng/tabview';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { QRCodeModule } from 'angularx-qrcode';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { UnitDetailDto } from 'src/app/core/models/units/unit-detail.dto';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';

@Component({
    selector: 'app-admin-edit-unit',
    templateUrl: './admin-edit-unit.component.html',
    imports: [
        DynamicDialogModule,
        ToastModule,
        DropdownModule,
        FormsModule,
        CommonModule,
        ButtonModule,
        TabViewModule,
        ReactiveFormsModule,
        InputNumberModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        QRCodeModule,
    ],

    standalone: true,
    styleUrls: ['./admin-edit-unit.component.css'],
})
export class AdminEditUnitComponent implements OnInit {
    floorLevelOption: any[] = [];
    unitNumberOption = UnitNumbers;
    unitUses = UnitPrimaryUses;
    unitOccupancies = UnitOccupancyOption;
    yesNoOptions = [
        {
            label: 'Yes',
            value: true,
        },
        {
            label: 'No',
            value: false,
        },
    ];

    totalFloorCount: number = 0;

    selectedFloorLevel: string;
    selectedUnitNumber: any;
    isLocked: boolean;

    unit!: UnitDto;
    unitDetail!: UnitDetailDto;
    buildingDetails: BuildingDetailDto;
    buildingId: number;

    instance: DynamicDialogComponent | undefined;

    //forms
    editUnitDetailsForm: FormGroup;

    constructor(
        private dialogService: DialogService,
        public ref: DynamicDialogRef,
        private fb: FormBuilder,
        private unitDataService: UnitDataService
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
            this.unit = this.instance.data.unit;
            this.unitDetail = this.instance.data.unit.unitDetail;
            this.buildingDetails = this.instance.data.buildingDetails;

            this.selectedFloorLevel = this.unit.unitNumberPrefix;
            this.selectedUnitNumber = this.unit.unitNumber;
            this.isLocked = this.unit.isLocked;

            this.editUnitDetailsForm = this.fb.group({
                name: ['', Validators.required],
                occupancyStatus: ['', Validators.required],
                numberOfBedrooms: [null],
                use: [],
                isRented: [Validators.required],
                rent: [],
                contact: [],
            });
            console.log(this.unitDetail);
            this.editUnitDetailsForm.patchValue({
                ...this.unitDetail,
            });
        }
    }

    ngOnInit(): void {
        this.initalizeFloorsArray(
            this.buildingDetails.floorCount,
            this.buildingDetails.basementCount
        );

        this.editUnitDetailsForm = this.fb.group({
            name: ['', Validators.required],
            occupancyStatus: ['', Validators.required],
            numberOfBedrooms: [null],
            use: [],
            isRented: [Validators.required],
            rent: [],
            contact: [],
        });
        console.log(this.unitDetail);
        this.editUnitDetailsForm.patchValue({
            ...this.unitDetail,
        });
    }

    updateUnit() {
        this.unitDataService
            .UpdateUnit(
                {
                    unitNumberPrefix: this.selectedFloorLevel,
                    isLocked: this.isLocked,
                    unitNumber: this.selectedUnitNumber,
                },
                this.unit.id
            )
            .subscribe((res) => {
                if (res) {
                    this.ref.close({
                        dataChanged: true,
                    });
                }
            });
    }

    updateUnitDetails() {
        console.log(this.editUnitDetailsForm.value, 'UNIT DETAILS');
        this.unitDataService
            .UpdateUnitDetails(this.unit.id, this.editUnitDetailsForm.value)
            .subscribe((res) => {
                console.log(res, 'RES');
                if (res) {
                    this.ref.close({
                        dataChanged: true,
                    });
                }
            });
    }

    unMapQr() {}

    mapQr() {}

    initalizeFloorsArray(maxFloor: number, basementCount: number) {
        for (let i = basementCount; i >= 1; i--) {
            if (i === 1) {
                this.floorLevelOption.push('B');
            } else {
                this.floorLevelOption.push(i.toString() + 'B');
            }
        }
        for (let i = 1; i <= maxFloor; i++) {
            this.floorLevelOption.push(i.toString());
        }
    }

    getQr(val) {
        return val;
    }
}
