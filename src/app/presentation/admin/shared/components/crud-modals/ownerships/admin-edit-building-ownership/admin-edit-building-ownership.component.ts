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
import { BuildingOwnershipTypes } from 'src/app/core/constants';
import { BuildingOwnershipDto } from 'src/app/core/models/ownership/owner.dto';
import { OwnershipDataService } from 'src/app/core/services/ownership.dataservice';

@Component({
    selector: 'app-admin-edit-building-ownership',
    templateUrl: './admin-edit-building-ownership.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        ButtonModule,

        MessagesModule,
    ],
    styleUrls: ['./admin-edit-building-ownership.component.css'],
})
export class AdminEditBuildingOwnershipComponent implements OnInit {
    instance: DynamicDialogComponent | undefined;
    buildingId: number;
    myForm: FormGroup;

    buildingOwnership: BuildingOwnershipDto;

    ownershipTypes = Object.values(BuildingOwnershipTypes);

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
            this.buildingOwnership = this.instance.data;
        }
    }

    ngOnInit(): void {
        this.myForm = this.fb.group({
            cid: ['', Validators.required],
            name: ['', Validators.required],
            contact: [null],
            type: [Validators.required],
            ownershipPercentage: [],
            buildingId: [this.buildingId],
        });
        this.myForm.patchValue({
            ...this.buildingOwnership,
            cid: this.buildingOwnership.owner.cid,
            name: this.buildingOwnership.owner.name,
            contact: this.buildingOwnership.owner.contact,
        });
    }
    searchOwners(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            const cid = this.myForm.controls['cid'].value;

            this.ownershipDataService.GetOneByCid(cid).subscribe(
                (res) => {
                    this.myForm.patchValue({
                        name: res.name,
                        contact: res.contact,
                    });
                },
                (error) => { }
            );
        }
    }
    updateOwnership() {
        this.updateOwnershipForStrata()
        this.ownershipDataService.UpdateBuildingOwnership(this.buildingOwnership.id, {
            ...this.myForm.value,
        })
            .subscribe((res) => {
                if (res) {
                    this.ref.close({
                        updated: true,
                    });
                }
            });
    }

    updateOwnershipForStrata() {
        if (this.myForm.get('type').value == 'STRATA') {
            this.myForm.patchValue({
                ownershipPercentage: 100
            })
        }
    }

    deleteOwnership() {
        this.ownershipDataService
            .DeleteBuildingOwnership(this.buildingOwnership.id)
            .subscribe((res) => {
                if (res) {
                    this.ref.close({
                        deleted: true,
                    });
                }
            });
    }
}
