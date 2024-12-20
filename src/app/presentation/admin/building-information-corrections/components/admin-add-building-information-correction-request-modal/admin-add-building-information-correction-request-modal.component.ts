import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { BuildingCorrectionRequestDataService } from 'src/app/core/services/building-correction-request.dataservice';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-admin-add-building-information-correction-request-modal',
    templateUrl:
        './admin-add-building-information-correction-request-modal.component.html',
    styleUrls: [
        './admin-add-building-information-correction-request-modal.component.css',
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
    ],
})
export class AdminAddBuildingInformationCorrectionRequestModalComponent
    implements OnInit
{
    selectedPdfFile: any;

    ownerCid: string;
    plotId: string;
    requestorCid: string;
    requestorName: string;
    requestorPhoneNumber: number;

    constructor(
        private fb: FormBuilder,
        private ref: DynamicDialogRef,
        private buildingCorrectionRequestDataService: BuildingCorrectionRequestDataService
    ) {}

    ngOnInit() {}

    onFileSelected(event: any) {
        if (event.files[0].type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }
        this.selectedPdfFile = event.files[0];
    }

    uploadRequest() {
        if (
            !this.selectedPdfFile ||
            !this.plotId ||
            !this.ownerCid ||
            !this.requestorName ||
            !this.requestorCid ||
            !this.requestorPhoneNumber
        ) {
            alert('Please fill all required fields and upload a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedPdfFile);
        formData.append('plotId', this.plotId);
        formData.append('ownerCid', this.ownerCid);
        formData.append('requestorName', this.requestorName);
        formData.append('requestorCid', this.requestorCid);
        formData.append(
            'requestorPhoneNumber',
            this.requestorPhoneNumber.toString()
        );

        this.buildingCorrectionRequestDataService
            .CreateBuildingCorrectionRequest(formData)
            .subscribe(
                (res) => {
                    this.ref.close({
                        status: 201,
                    });
                },
                (err) => {
                    alert('Failed to submit request. Please try again.');
                }
            );
    }
}
