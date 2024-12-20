import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    ReactiveFormsModule,
    FormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingCorrectionRequestDataService } from 'src/app/core/services/building-correction-request.dataservice';

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
    ],
})
export class PublicUploadBuildingCorrectionRequestModalComponent
    implements OnInit
{
    correctionForm: FormGroup;
    selectedPdfFile: File | null = null;

    constructor(
        private fb: FormBuilder,
        private ref: DynamicDialogRef,
        private buildingCorrectionRequestDataService: BuildingCorrectionRequestDataService
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
                () => {
                    this.ref.close({ status: 201 });
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
