import { Component } from '@angular/core';
import { AdminViewBuildingComponent } from '../../admin-view-building/admin-view-building.component';
import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';

@Component({
    selector: 'app-view-individual-building-modal',
    standalone: true,
    imports: [AdminViewBuildingComponent],
    templateUrl: './view-individual-building-modal.component.html',
    styleUrl: './view-individual-building-modal.component.scss',
})
export class ViewIndividualBuildingModalComponent {
    buildingId: number;
    instance: DynamicDialogComponent | undefined;

    constructor(
        public ref: DynamicDialogRef,
        private dialogService: DialogService
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
        }
    }
}
