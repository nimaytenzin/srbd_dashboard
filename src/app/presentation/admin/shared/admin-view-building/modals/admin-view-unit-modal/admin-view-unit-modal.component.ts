import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { UnitOccupancyStatus, UnitPrimaryUses } from 'src/app/core/constants';
import { UnitDataService } from 'src/app/core/services/unit.dataservice';

@Component({
    selector: 'app-admin-view-unit-modal',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ButtonModule,
        DynamicDialogModule,
    ],
    templateUrl: './admin-view-unit-modal.component.html',
    styleUrl: './admin-view-unit-modal.component.scss',
})
export class AdminViewUnitModalComponent implements OnInit, OnDestroy {
    instance: DynamicDialogComponent | undefined;
    unitId: number;
    unit: any;
    unitDetails: any;
    unitOccupancyStatus = Object.values(UnitOccupancyStatus);
    unitUse = Object.values(UnitPrimaryUses);
    myForm: FormGroup;

    constructor(
        public ref: DynamicDialogRef,
        private dialogService: DialogService,
        private unitDataService: UnitDataService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private fb: FormBuilder
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.unitId = this.instance.data.unitId;
        }
    }

    ngOnInit(): void {
        this.myForm = this.fb.group({
            rent: ['', Validators.required],
            occupancyStatus: ['', Validators.required],
            use: ['', Validators.required],
            numberOfBedrooms: [null, Validators.required],
            contact: [''],
        });
        this.getUnit(this.unitId);
        this.getUnitDetails(this.unitId);
    }

    ngOnDestroy(): void {
        this.ref.destroy();
    }

    getUnit(unitId: number) {
        this.unitDataService.GetUnitById(unitId).subscribe((res) => {
            this.unit = res;
        });
    }

    getUnitDetails(unitId: number) {
        this.unitDataService.GetUnitDetails(unitId).subscribe((res) => {
            this.unitDetails = res;
            this.myForm.patchValue({
                rent: this.unitDetails?.rent,
                occupancyStatus: this.unitDetails?.occupancyStatus,
                use: this.unitDetails?.use,
                numberOfBedrooms: this.unitDetails?.numberOfBedrooms,
                contact: this.unitDetails?.contact,
            });
        });
    }

    updateDetails() {
        console.log(this.myForm.value);
        this.unitDataService
            .UpdateUnitDetails(this.unitId, this.myForm.value)
            .subscribe((res) => {
                if (res) {
                    this.ref.close({
                        updated: true,
                    });
                }
            });
    }

    // goToBuildingDetailedView(buildingId) {
    //     this.router.navigate(['/admin/building-detailed', buildingId]);
    //     this.ref.close();
    // }
    // round(number) {
    //     return Math.round(number);
    // }

    // getBuilding(buildingId) {
    //     this.buildingDataService.GetBuildingById(10499).subscribe((res) => {
    //         this.building = res;
    //     });
    // }

    // getBuildingPlots(buildingId) {
    //     this.buildingPlotDataService
    //         .GetPlotsOfBuilding(buildingId)
    //         .subscribe((res: any) => {
    //             this.buildingPlots = res;
    //             console.log('BUIDLING PLOTS', res);
    //         });
    // }
    // getBuildingDetails(buildingId) {
    //     this.buildingDetailService
    //         .GetBuildingDetailsByBuildingId(buildingId)
    //         .subscribe((res) => {
    //             console.log(res);
    //             this.buildingDetails = res;
    //         });
    // }

    // getQr(unit) {
    //     return unit;
    // }

    // getUnitsByBuildingId(buildingId) {
    //     this.unitDataService
    //         .GetAllUnitsByBuilding(buildingId)
    //         .subscribe((res: any[]) => {
    //             this.units = res;
    //             console.log(this.units);
    //         });
    // }
    // confirm2(event: Event) {
    //     this.confirmationService.confirm({
    //         target: event.target as EventTarget,
    //         message: 'Do you want to delete this record?',
    //         header: 'Delete Confirmation',
    //         icon: 'pi pi-info-circle',
    //         acceptButtonStyleClass: 'p-button-danger p-button-text',
    //         rejectButtonStyleClass: 'p-button-text p-button-text',
    //         acceptIcon: 'none',
    //         rejectIcon: 'none',

    //         accept: () => {
    //             this.buildingDataService
    //                 .DeleteBuilding(this.buildingId)
    //                 .subscribe((res) => {
    //                     this.messageService.add({
    //                         severity: 'info',
    //                         summary: 'Confirmed',
    //                         detail: 'Record deleted',
    //                     });
    //                     this.ref.close({
    //                         delete: true,
    //                     });
    //                 });
    //         },
    //         reject: () => {},
    //     });
    // }
}
