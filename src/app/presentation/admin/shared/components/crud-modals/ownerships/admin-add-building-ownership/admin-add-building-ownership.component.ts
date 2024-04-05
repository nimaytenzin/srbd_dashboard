import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { AppModule } from 'src/app/app.module';
import { BuildingOwnershipTypes } from 'src/app/core/constants';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';

@Component({
    selector: 'app-admin-add-building-ownership',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ButtonModule,
        CommonModule,
        MessagesModule,
    ],
    providers: [MessageService],
    templateUrl: './admin-add-building-ownership.component.html',
    styleUrls: ['./admin-add-building-ownership.component.css'],
})
export class AdminAddBuildingOwnershipComponent implements OnInit {
    instance: DynamicDialogComponent | undefined;
    buildingId: number;
    myForm: FormGroup;
    error_msg: string = ""
    ownershipTypes = Object.values(BuildingOwnershipTypes);

    error: boolean = false;
    isButtonDisabled: boolean = true;

    constructor(
        public ref: DynamicDialogRef,
        private dialogService: DialogService,
        private ownershipDataService: OwnershipDataService,
        private messageService: MessageService,

        private fb: FormBuilder
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
        }
    }

    ngOnInit(): void {
        this.myForm = this.fb.group({
            cid: ['', Validators.required],
            name: ['', Validators.required],
            contact: [null],
            type: [Validators.required],
            ownershipPercentage: [100, Validators.required],
            buildingId: [this.buildingId],
        });
        this.updateOwnerTypeAndPercentageButton(false)
    }

    updateOwnerTypeAndPercentageButton(enable: boolean) {
        if (enable) {
            this.myForm.get('type').enable();
            this.myForm.get('ownershipPercentage').enable();
            this.isButtonDisabled = false;
        } else {
            this.myForm.get('type').disable();
            this.myForm.get('ownershipPercentage').disable();
            this.isButtonDisabled = true;
        }
    }

    updateOwnershipForStrata() {
        if (this.myForm.get('type').value == 'STRATA') {
            this.myForm.patchValue({
                ownershipPercentage: 100
            })
        }
    }


    createOwnership() {
        this.updateOwnershipForStrata();
        this.ownershipDataService
            .CreateBuildingOwnership(this.myForm.value)
            .subscribe((res) => {
                if (res) {
                    this.ref.close({
                        added: true,
                    });
                }
            });
    }

    resetForm() {
        this.myForm.patchValue({
            name: '',
            contact: null,
            type: null,
            ownershipPercentage: 100
        })
    }


    searchCid() {
        let cid = this.myForm.value.cid;
        this.ownershipDataService.GetOneByCid(cid).subscribe(
            (res) => {
                this.error = false
                this.myForm.patchValue({
                    name: res.name,
                    contact: res.contact,
                });
                this.updateOwnerTypeAndPercentageButton(true)
            },
            (error) => {
                this.error = true
                this.error_msg = "CID not found. Please add owner details in Master."
                this.updateOwnerTypeAndPercentageButton(false)
                this.resetForm()
            }
        );
    }
}
