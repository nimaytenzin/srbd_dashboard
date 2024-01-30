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
    }

    createOwnership() {
        console.log(this.myForm.value);
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
                (error) => {}
            );
        }
    }
}
