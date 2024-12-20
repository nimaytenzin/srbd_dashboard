import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
    DialogService,
    DynamicDialogConfig,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import {
    BuildingCorrectionRequestDTO,
    BUILDINGCORRECTIONSTATUSENUM,
} from 'src/app/core/models/bulding-correction.dto';
import { BuildingCorrectionRequestDataService } from 'src/app/core/services/building-correction-request.dataservice';
import { AdminResolveCorrectionModalComponent } from '../admin-resolve-correction-modal/admin-resolve-correction-modal.component';
import { AdminViewCorrectionRequestPdfComponent } from '../admin-view-correction-request-pdf/admin-view-correction-request-pdf.component';

@Component({
    selector: 'app-admin-track-building-information-request-status-modal',
    templateUrl:
        './admin-track-building-information-request-status-modal.component.html',
    styleUrls: [
        './admin-track-building-information-request-status-modal.component.css',
    ],
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule],
    providers: [DialogService],
})
export class AdminTrackBuildingInformationRequestStatusModalComponent
    implements OnInit
{
    plotId: string;
    correctionRequests: BuildingCorrectionRequestDTO[] = [];
    ref: DynamicDialogRef | undefined;
    correctionStatusEnum = BUILDINGCORRECTIONSTATUSENUM;

    constructor(
        private config: DynamicDialogConfig,
        private buildingCorrectionRequestDataService: BuildingCorrectionRequestDataService,
        private dialogService: DialogService,
        private closeRef: DynamicDialogRef
    ) {
        this.plotId = this.config.data.plotId;
    }

    ngOnInit() {
        this.findByPlot();
    }

    findByPlot() {
        this.buildingCorrectionRequestDataService
            .FindAllByPlotId(this.plotId)
            .subscribe((res) => {
                this.correctionRequests = res;
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
                this.findByPlot();
            }
        });
    }
}
