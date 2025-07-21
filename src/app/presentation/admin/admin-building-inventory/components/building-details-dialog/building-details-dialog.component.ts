import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DividerModule } from 'primeng/divider';

@Component({
    selector: 'app-building-details-dialog',
    standalone: true,
    imports: [CommonModule, ButtonModule, DividerModule],
    template: `
        <div class="p-4">
            <div class="building-details">
                <div class="detail-item">
                    <strong>ID:</strong> {{ building.id || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Name:</strong> {{ building.name || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Address:</strong> {{ building.address || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Type:</strong> {{ building.type || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Primary Use:</strong>
                    {{ building.primaryUse || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Status:</strong> {{ building.status || 'N/A' }}
                </div>
                <div class="detail-item">
                    <strong>Floor Count:</strong>
                    {{ building.regularFloorCount || 0 }}
                </div>
                <div class="detail-item">
                    <strong>Image Status:</strong>
                    <span
                        [ngClass]="{
                            'text-green-600': hasImages,
                            'text-red-600': !hasImages
                        }"
                    >
                        {{ imageStatus }}
                    </span>
                </div>
                <div class="detail-item">
                    <strong>Created:</strong> {{ getFormattedDate() }}
                </div>

                <p-divider></p-divider>

                <div class="detail-item">
                    <strong>Basement Count:</strong>
                    {{ building.basementCount || 0 }}
                </div>
                <div class="detail-item">
                    <strong>Stilt Count:</strong> {{ building.stiltCount || 0 }}
                </div>
                <div class="detail-item">
                    <strong>Attic Count:</strong> {{ building.atticCount || 0 }}
                </div>
                <div class="detail-item">
                    <strong>Jamthog Count:</strong>
                    {{ building.jamthogCount || 0 }}
                </div>
                <div class="detail-item" *ngIf="building.length">
                    <strong>Length:</strong> {{ building.length }} m
                </div>
                <div class="detail-item" *ngIf="building.breadth">
                    <strong>Breadth:</strong> {{ building.breadth }} m
                </div>
                <div class="detail-item" *ngIf="building.footprintArea">
                    <strong>Footprint Area:</strong>
                    {{ building.footprintArea }} sq.m
                </div>
                <div class="detail-item" *ngIf="building.contact">
                    <strong>Contact:</strong> {{ building.contact }}
                </div>
                <div class="detail-item">
                    <strong>Protected:</strong>
                    {{ building.isProtected ? 'Yes' : 'No' }}
                </div>
                <div class="detail-item">
                    <strong>Data Cleaned:</strong>
                    {{ building.isDataCleaned ? 'Yes' : 'No' }}
                </div>
            </div>

            <div class="flex justify-content-end mt-4">
                <p-button
                    label="Close"
                    severity="secondary"
                    (click)="close()"
                ></p-button>
            </div>
        </div>
    `,
    styles: [
        `
            .building-details {
                overflow-y: auto;
            }

            .detail-item {
                margin-bottom: 0.75rem;
                padding: 0.5rem;
                border-left: 3px solid #e9ecef;
                background-color: #f8f9fa;
                border-radius: 0 4px 4px 0;
            }

            .detail-item strong {
                display: inline-block;
                min-width: 120px;
                color: #495057;
            }

            .text-green-600 {
                color: #16a34a;
            }

            .text-red-600 {
                color: #dc2626;
            }
        `,
    ],
})
export class BuildingDetailsDialogComponent {
    building: any;
    hasImages: boolean = false;
    imageStatus: string = '';

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.building = this.config.data?.building || {};
        this.hasImages =
            this.building.buildingImages &&
            this.building.buildingImages.length > 0;
        this.imageStatus = this.hasImages
            ? `Has ${this.building.buildingImages.length} images`
            : 'No images';
    }

    getFormattedDate(): string {
        if (!this.building.createdAt) return 'N/A';
        return new Date(this.building.createdAt).toLocaleDateString();
    }

    close(): void {
        this.ref.close();
    }
}
