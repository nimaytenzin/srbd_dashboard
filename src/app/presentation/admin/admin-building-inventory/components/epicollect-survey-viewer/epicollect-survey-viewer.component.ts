import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import {
    SurveyDataItem,
    convertSurveyData,
    BuildingSurveyData,
} from '../../data/survey-data.dto';
import {
    EpiCollectHelper,
    EpiCollectImage,
} from '../../epi-collect-helpers/epicollect.helper';

@Component({
    selector: 'app-epicollect-survey-viewer',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CardModule,
        DividerModule,
        TagModule,
        TabViewModule,
        TooltipModule,
    ],
    templateUrl: './epicollect-survey-viewer.component.html',
    styleUrl: './epicollect-survey-viewer.component.scss',
})
export class EpicollectSurveyViewerComponent implements OnInit {
    surveyData: SurveyDataItem;
    surveyDataReadable: BuildingSurveyData;
    images: EpiCollectImage[] = [];
    isLoadingImages = false;
    epicollectHelper?: EpiCollectHelper;

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig
    ) {
        this.surveyData = this.config.data.surveyData;
        this.epicollectHelper = this.config.data.epicollectHelper;
        this.surveyDataReadable = convertSurveyData(this.surveyData);
    }

    ngOnInit(): void {
        this.loadImages();
    }

    async loadImages(): Promise<void> {
        if (!this.epicollectHelper) return;

        this.isLoadingImages = true;
        try {
            this.images = await this.epicollectHelper.downloadSurveyImages(
                this.surveyData
            );
        } catch (error) {
            console.error('Error loading images:', error);
        } finally {
            this.isLoadingImages = false;
        }
    }

    getConstructionStatusSeverity(): string {
        const status = this.surveyDataReadable.constructionCompletion;
        if (!status) return 'danger';

        const statusStr = typeof status === 'string' ? status : String(status);
        switch (statusStr.toLowerCase()) {
            case 'complete':
                return 'success';
            case 'under construction':
                return 'warning';
            case 'planned':
                return 'info';
            default:
                return 'danger';
        }
    }

    getUseTypeString(): string {
        return Array.isArray(this.surveyDataReadable.useType)
            ? this.surveyDataReadable.useType.join(', ')
            : this.surveyDataReadable.useType || 'N/A';
    }

    getApproximateAgeString(): string {
        return Array.isArray(this.surveyDataReadable.approximateAge)
            ? this.surveyDataReadable.approximateAge.join(', ')
            : this.surveyDataReadable.approximateAge || 'N/A';
    }

    getUnderConstructionString(): string {
        return Array.isArray(this.surveyDataReadable.underConstruction)
            ? this.surveyDataReadable.underConstruction.join(', ')
            : this.surveyDataReadable.underConstruction || 'N/A';
    }

    getTotalResidents(): number {
        const male13to60 = parseInt(this.surveyDataReadable.maleAge13To60) || 0;
        const maleAbove60 =
            parseInt(this.surveyDataReadable.maleAgeAbove60) || 0;
        const female13to60 =
            parseInt(this.surveyDataReadable.femaleAge13To60) || 0;
        const femaleAbove60 =
            parseInt(this.surveyDataReadable.femaleAgeAbove60) || 0;
        const children =
            parseInt(this.surveyDataReadable.childrenAgeLess13) || 0;

        return (
            male13to60 + maleAbove60 + female13to60 + femaleAbove60 + children
        );
    }

    viewImage(image: EpiCollectImage): void {
        if (this.epicollectHelper) {
            this.epicollectHelper.viewImage(image.filename);
        }
    }

    downloadImage(image: EpiCollectImage): void {
        if (this.epicollectHelper) {
            this.epicollectHelper.downloadImageFile(image.filename);
        }
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    }

    formatCoordinates(): string {
        const lat = this.surveyDataReadable.location?.latitude;
        const lng = this.surveyDataReadable.location?.longitude;
        if (!lat || !lng || isNaN(Number(lat)) || isNaN(Number(lng)))
            return 'N/A';
        return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
    }

    formatUTM(): string {
        const location = this.surveyDataReadable.location;
        if (!location?.UTM_Easting || !location?.UTM_Northing) return 'N/A';
        return `${location.UTM_Easting}, ${location.UTM_Northing} (Zone: ${
            location.UTM_Zone || 'N/A'
        })`;
    }

    onClose(): void {
        this.ref.close();
    }

    exportData(): void {
        const dataStr = JSON.stringify(this.surveyData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `survey-${this.surveyData.ec5_uuid}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    copyToClipboard(text: string): void {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                // Could add a toast notification here
                console.log('UUID copied to clipboard');
            })
            .catch((err) => {
                console.error('Failed to copy UUID: ', err);
            });
    }
}
