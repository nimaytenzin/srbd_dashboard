import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { AdminAddBuildingInformationCorrectionRequestModalComponent } from '../components/admin-add-building-information-correction-request-modal/admin-add-building-information-correction-request-modal.component';
import { BuildingCorrectionRequestDataService } from 'src/app/core/services/building-correction-request.dataservice';
import {
    BuildingCorrectionRequestDTO,
    BUILDINGCORRECTIONSTATUSENUM,
} from 'src/app/core/models/bulding-correction.dto';
import { AdminViewCorrectionRequestPdfComponent } from '../components/admin-view-correction-request-pdf/admin-view-correction-request-pdf.component';
import { AdminResolveCorrectionModalComponent } from '../components/admin-resolve-correction-modal/admin-resolve-correction-modal.component';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { AdminTrackBuildingInformationRequestStatusModalComponent } from '../components/admin-track-building-information-request-status-modal/admin-track-building-information-request-status-modal.component';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-admin-building-information-correction-listings',
    templateUrl:
        './admin-building-information-correction-listings.component.html',
    styleUrls: [
        './admin-building-information-correction-listings.component.css',
    ],
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        InputGroupAddonModule,
        InputGroupModule,
        InputNumberModule,
        FormsModule,
        InputTextModule,
    ],
    providers: [DialogService],
})
export class AdminBuildingInformationCorrectionListingsComponent
    implements OnInit
{
    ref: DynamicDialogRef | undefined;
    correctionStatusEnum = BUILDINGCORRECTIONSTATUSENUM;
    pendingRequest: BuildingCorrectionRequestDTO[] = [];
    plotId: string;

    constructor(
        private dialogService: DialogService,
        private buildingInformationCorrectionRequestDataService: BuildingCorrectionRequestDataService
    ) {}

    ngOnInit() {
        this.findAllPending();
    }
    toUpperCase() {
        this.plotId = this.plotId.toUpperCase();
    }

    findAllPending() {
        this.buildingInformationCorrectionRequestDataService
            .FindAllPendingRequest()
            .subscribe((res) => {
                this.pendingRequest = res;
            });
    }

    openCreateBuildingCorrectionModal() {
        this.ref = this.dialogService.open(
            AdminAddBuildingInformationCorrectionRequestModalComponent,
            {
                header: 'Upload correction Request',

                data: {},
            }
        );
        this.ref.onClose.subscribe((res) => {
            if (res && res.status === 201) {
                this.findAllPending();
            }
        });
    }

    openViewCorrectionRequestPdf(
        correctionRequest: BuildingCorrectionRequestDTO
    ) {
        this.ref = this.dialogService.open(
            AdminViewCorrectionRequestPdfComponent,
            {
                header: 'PDF',

                data: {
                    ...correctionRequest,
                },
            }
        );
    }

    openResolveCorrectionModal(
        status: BUILDINGCORRECTIONSTATUSENUM,
        id: number
    ) {
        this.ref = this.dialogService.open(
            AdminResolveCorrectionModalComponent,
            {
                header: 'resolve',
                data: {
                    status: status,
                    id: id,
                },
            }
        );
        this.ref.onClose.subscribe((res) => {
            if (res && res.status === 200) {
                this.findAllPending();
            }
        });
    }
    searchStatusByPlotId() {
        this.ref = this.dialogService.open(
            AdminTrackBuildingInformationRequestStatusModalComponent,
            {
                header: 'Request Status',

                data: {
                    plotId: this.plotId,
                },
            }
        );
    }
}
