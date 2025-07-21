import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { BuildingDataService } from '../../../../../core/services/building.dataservice';
import {
    EpiCollectHelper,
    EpiCollectImage,
} from '../../epi-collect-helpers/epicollect.helper';
import { SurveyDataItem } from '../../data/survey-data.dto';

@Component({
    selector: 'app-survey-building-mapping-dialog',
    standalone: true,
    imports: [CommonModule, ButtonModule, DividerModule, ChipModule],
    templateUrl: './survey-building-mapping.dialog.component.html',
    styleUrls: ['./survey-building-mapping.dialog.component.css'],
})
export class SurveyBuildingMappingDialogComponent {
    surveyUuid: string = '';
    buildingId: string = '';
    buildingName: string = '';
    buildingAddress: string = '';
    surveyDataItem: SurveyDataItem = null;
    isUploading: boolean = false;
    epicollectHelper?: EpiCollectHelper;

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private buildingDataService: BuildingDataService
    ) {
        const data = this.config.data || {};
        this.surveyUuid = data.surveyUuid || '';
        this.buildingId = data.buildingId || '';
        this.buildingName = data.buildingName || '';
        this.buildingAddress = data.buildingAddress || '';
        this.surveyDataItem = data.surveyDataItem || null;
        this.epicollectHelper = data.epicollectHelper;

        console.log(
            'SurveyBuildingMappingDialogComponent initialized with data:',
            {
                surveyUuid: this.surveyUuid,
                surveyDataItem: this.surveyDataItem,
            }
        );
    }

    async confirm(): Promise<void> {
        this.isUploading = true;

        try {
            // If there are photos and epicollect helper, download and upload them
            if (this.surveyDataItem && this.epicollectHelper) {
                console.log('Processing photos for building:', this.buildingId);

                // Use EpiCollect helper to download all survey images
                const images: EpiCollectImage[] =
                    await this.epicollectHelper.downloadSurveyImages(
                        this.surveyDataItem
                    );

                if (images.length > 0) {
                    console.log('Downloaded images:', images.length);

                    // Upload each image using building data service
                    for (let i = 0; i < images.length; i++) {
                        const image = images[i];
                        try {
                            if (image.blob) {
                                // Create a File object from the blob with proper naming
                                const file = new File(
                                    [image.blob],
                                    `${image.fieldName}_${image.filename}`.replace(
                                        /[^a-zA-Z0-9_.-]/g,
                                        '_'
                                    ),
                                    {
                                        type: image.blob.type || 'image/jpeg',
                                    }
                                );

                                // Upload the file
                                await this.buildingDataService
                                    .uploadMovieMedia(
                                        file,
                                        parseInt(this.buildingId)
                                    )
                                    .toPromise();

                                console.log(
                                    'Successfully uploaded image:',
                                    image.fieldName,
                                    image.filename
                                );
                            }
                        } catch (error) {
                            console.error(
                                'Failed to upload image:',
                                image.fieldName,
                                image.filename,
                                error
                            );
                        }
                    }
                } else {
                    console.log('No images found in survey data');
                }
            }

            this.ref.close(true);
        } catch (error) {
            console.error('Error during photo upload process:', error);
            this.ref.close(true); // Still close dialog even if some uploads failed
        } finally {
            this.isUploading = false;
        }
    }

    close(result: boolean = false): void {
        this.ref.close(result);
    }
}
