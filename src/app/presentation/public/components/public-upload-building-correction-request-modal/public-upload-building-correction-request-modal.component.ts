import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingCorrectionRequestDataService } from 'src/app/core/services/building-correction-request.dataservice';
import { ToastModule } from 'primeng/toast';
import { PublicUploadSuccessModalComponent } from '../public-upload-success-modal/public-upload-success-modal.component';

@Component({
    selector: 'app-public-upload-building-correction-request-modal',
    templateUrl:
        './public-upload-building-correction-request-modal.component.html',
    styleUrls: [
        './public-upload-building-correction-request-modal.component.css',
    ],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputNumberModule,
        InputTextModule,
        ButtonModule,
        DividerModule,
        FileUploadModule,
        FormsModule,
        InputNumberModule,
        CommonModule,
        ToastModule,
    ],
    providers: [MessageService],
})
export class PublicUploadBuildingCorrectionRequestModalComponent
    implements OnInit
{
    correctionForm: FormGroup;
    selectedPdfFile: File | null = null;
    showDialogRef: DynamicDialogRef | undefined;

    constructor(
        private fb: FormBuilder,
        private ref: DynamicDialogRef,
        private buildingCorrectionRequestDataService: BuildingCorrectionRequestDataService,
        private messageService: MessageService,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        this.correctionForm = this.fb.group({
            plotId: ['', Validators.required],
            ownerCid: ['', Validators.required],
            requestorName: ['', Validators.required],
            requestorCid: ['', Validators.required],
            requestorPhoneNumber: [
                '',
                [Validators.required, Validators.pattern(/^\d{8,15}$/)],
            ],
        });
    }

    onFileSelected(event: any) {
        const file = event.files[0];
        if (file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }
        this.selectedPdfFile = file;
    }

    onSubmit() {
        if (this.correctionForm.invalid || !this.selectedPdfFile) {
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedPdfFile);
        Object.keys(this.correctionForm.value).forEach((key) =>
            formData.append(key, this.correctionForm.value[key])
        );

        this.buildingCorrectionRequestDataService
            .CreateBuildingCorrectionRequest(formData)
            .subscribe(
                (res) => {
                    this.ref.close();
                    this.showDialogRef = this.dialogService.open(
                        PublicUploadSuccessModalComponent,
                        {
                            header: 'Success',

                            data: {
                                ...res,
                            },
                        }
                    );
                },
                (err) => {
                    alert('Failed to submit request. Please try again.');
                }
            );
    }

    close() {
        this.ref.close();
    }
}
