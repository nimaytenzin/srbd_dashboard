import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import {
    BuildingCorrectionRequestDTO,
    BUILDINGCORRECTIONSTATUSENUM,
} from 'src/app/core/models/bulding-correction.dto';
import { BuildingCorrectionRequestDataService } from 'src/app/core/services/building-correction-request.dataservice';
import { PublicUploadBuildingCorrectionRequestModalComponent } from '../components/public-upload-building-correction-request-modal/public-upload-building-correction-request-modal.component';
import { PublicViewPdfComponent } from '../components/public-view-pdf/public-view-pdf.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
    selector: 'app-public-home',
    templateUrl: './public-home.component.html',
    styleUrls: ['./public-home.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        InputGroupModule,
        InputTextModule,
        FormsModule,
        TableModule,
        ToastModule,
    ],
    providers: [DialogService, MessageService],
})
export class PublicHomeComponent implements OnInit {
    plotId: string;
    ref: DynamicDialogRef | undefined;
    searched: boolean = false;
    searchOwnerCid: string;

    correctionRequests: BuildingCorrectionRequestDTO[] = [];
    correctionRequestEnum = BUILDINGCORRECTIONSTATUSENUM;
    constructor(
        private correctionRequestDataService: BuildingCorrectionRequestDataService,
        private dialogService: DialogService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'Message Content',
            life: 3000,
        });
        console.log(this.messageService);
    }

    toUpperCase() {
        this.plotId = this.plotId.toUpperCase();
    }

    getStatusClass(status: BUILDINGCORRECTIONSTATUSENUM) {
        switch (status) {
            case BUILDINGCORRECTIONSTATUSENUM.PENDING:
                return 'bg-red-100 border-round  text-red-900 px-2';
            case BUILDINGCORRECTIONSTATUSENUM.RESOLVED:
                return 'bg-green-100 border-round  text-gren-900 px-2';
            case BUILDINGCORRECTIONSTATUSENUM.REJECTED:
                return 'bg-red-100 border-round  text-red-900 px-2';

            default:
                return 'bg-gray-100 border-round  text-gray-900 px-2';
        }
    }

    searchStatusByPlotId() {
        this.searched = true;
        this.correctionRequestDataService
            .FindAllByPlotAndOwnerCID(this.plotId, this.searchOwnerCid)
            .subscribe((res) => {
                this.correctionRequests = res;
            });
    }

    openUploadCorrectionRequestModal() {
        this.ref = this.dialogService.open(
            PublicUploadBuildingCorrectionRequestModalComponent,
            {
                header: 'Upload Correction Form',
            }
        );
    }
    openViewCorrectionRequestPdf(
        correctionRequest: BuildingCorrectionRequestDTO
    ) {
        this.ref = this.dialogService.open(PublicViewPdfComponent, {
            header: 'PDF',

            data: {
                ...correctionRequest,
            },
        });
    }
}
