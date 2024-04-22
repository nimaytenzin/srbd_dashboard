import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators,
    ReactiveFormsModule,
    FormsModule,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
    DynamicDialogComponent,
    DynamicDialogRef,
    DialogService,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { BuildingOwnershipTypes } from 'src/app/core/constants';
import {
    BuildingOwnershipDto,
    UnitOwnershipDto,
} from 'src/app/core/models/ownership/owner.dto';
import { UnitDto } from 'src/app/core/models/units/unit.dto';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
    selector: 'app-admin-add-strata-unitownership',
    templateUrl: './admin-add-strata-unitownership.component.html',
    styleUrls: ['./admin-add-strata-unitownership.component.css'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ButtonModule,
        MultiSelectModule,
        MessagesModule,
        FormsModule,
        CommonModule,
        TableModule,
        ConfirmPopupModule,
        InputGroupModule,
        InputGroupAddonModule,
    ],
    providers: [ConfirmationService, MessageService],
})
export class AdminAddStrataUnitownershipComponent implements OnInit {
    instance: DynamicDialogComponent | undefined;
    buildingId: number;
    myForm: FormGroup;
    visible = false;

    buildingOwnership: BuildingOwnershipDto;

    ownershipTypes = Object.values(BuildingOwnershipTypes);
    ownershipPercentage = 100;
    units: UnitDto[] = [];

    unitOwnerships: UnitOwnershipDto[] = [];

    @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;
    @ViewChild(ConfirmPopup) confirmPopup2!: ConfirmPopup;

    accept() {
        this.confirmPopup.accept();
    }
    reject() {
        this.confirmPopup.reject();
    }
    accept2() {
        this.confirmPopup.accept();
    }
    reject3() {
        this.confirmPopup.reject();
    }
    constructor(
        public ref: DynamicDialogRef,
        private dialogService: DialogService,
        private ownershipDataService: OwnershipDataService,
        private unitdataservice: UnitDataService,
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
            this.buildingOwnership = this.instance.data;
        }
    }

    ngOnInit(): void {
        this.getUnitsByBuilding();
        this.myForm = this.fb.group({
            cid: ['', Validators.required],
            name: ['', Validators.required],
            contact: [null],
            type: [Validators.required],
            ownershipPercentage: [],
            buildingId: [this.buildingId],
        });
    }

    selectUnitJoint(event:Event,unit:UnitDto){
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'map the units/?',
            accept: () => {
                this.ownershipDataService
                    .MapUnitOwnership({
                        buildingOwnershipId: this.buildingOwnership.id,
                        unitId: unit.id,
                        ownershipPercentage: this.ownershipPercentage,
                    })
                    .subscribe((res) => {
                        this.getUnitsByBuilding();
                    });
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Rejected',
                    detail: 'You have rejected',
                    life: 3000,
                });
            },
        });

    }

    selectUnit(event: Event, unit: UnitDto) {
        this.ownershipDataService
            .MapUnitOwnership({
                buildingOwnershipId: this.buildingOwnership.id,
                unitId: unit.id,
                ownershipPercentage: this.ownershipPercentage,
            })
            .subscribe((res) => {
                this.getUnitsByBuilding();
            });
    }

    getUnitOwnership() {
        this.ownershipDataService
            .GetAllUnitOwnershipByBuildingOwnership(this.buildingOwnership.id)
            .subscribe((res: any) => {
                this.unitOwnerships = res;
                console.log(res, 'UNIT OWNERS');
            });
    }

    getUnitsByBuilding() {
        this.unitdataservice
            .GetAllUnitsByBuilding(this.buildingId)
            .subscribe((res) => {
                console.log(res);
                this.units = res;
            });
    }

    unmapUnit(passedUnit: UnitDto) {
        console.log(this.buildingOwnership.id, passedUnit.id);
        this.ownershipDataService
            .DeleteUnitOwnershipByBuildingOwnerUnit(
                this.buildingOwnership.id,
                passedUnit.id
            )
            .subscribe((res) => {
                this.getUnitsByBuilding();
            });
    }

    checkIfSelected(passedUnit: UnitDto): boolean {
        return this.unitOwnerships.some(
            (item) => item.unitId === passedUnit.id
        );
    }

    mapUnits() {
        // for (let unit of this.selectedUnits) {
        //     console.log(unit);
        //     console.log(this.buildingOwnership);
        // }
    }
}
