import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
    BUILDINGCORRECTIONSTATUSENUM,
    UpdateBuildingCorrectionRequestDTO,
} from 'src/app/core/models/bulding-correction.dto';
import { BuildingCorrectionRequestDataService } from 'src/app/core/services/building-correction-request.dataservice';
import { AuthService } from 'src/app/core/services/auth.data.service';

@Component({
    selector: 'app-admin-resolve-correction-modal',
    templateUrl: './admin-resolve-correction-modal.component.html',
    styleUrls: ['./admin-resolve-correction-modal.component.css'],
    standalone: true,
    imports: [FormsModule, ButtonModule, InputTextareaModule],
})
export class AdminResolveCorrectionModalComponent implements OnInit {
    status: BUILDINGCORRECTIONSTATUSENUM;
    correctionId: number;

    remarks: string;

    constructor(
        private config: DynamicDialogConfig,
        private buildingCorrectionRequestDataService: BuildingCorrectionRequestDataService,
        private authService: AuthService,
        private ref: DynamicDialogRef
    ) {
        this.status = this.config.data.status;
        this.correctionId = this.config.data.id;
    }

    ngOnInit() {}

    getButtonLabel() {
        if (this.status === BUILDINGCORRECTIONSTATUSENUM.RESOLVED) {
            return 'Resolve';
        } else {
            return 'Reject';
        }
    }
    getButtonSeverity() {
        if (this.status === BUILDINGCORRECTIONSTATUSENUM.RESOLVED) {
            return 'success';
        } else {
            return 'danger';
        }
    }

    updateStatus() {
        const data: UpdateBuildingCorrectionRequestDTO = {
            id: this.correctionId,
            resolverId: this.authService.decodeToken().userId,
            remarks: this.remarks,
            status: this.status,
        };
        this.buildingCorrectionRequestDataService
            .UpdateStatus(this.correctionId, data)
            .subscribe((res) => {
                this.ref.close({
                    status: 200,
                });
            });
    }
}
