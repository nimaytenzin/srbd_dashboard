import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { GalleriaModule } from 'primeng/galleria';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import {
    API_URL,
    BuildingDataStatus,
    BuildingTypology,
} from 'src/app/core/constants/constants';
import {
    BuildingImageDTO,
    BuildingDataService,
    MarkBuildingCleanedResponse,
} from 'src/app/core/services/building.dataservice';
import { BuildingDetails } from '../admin-building-inventory/components/admin-building-inventory-view-details/admin-building-inventory-view-details.component';
import { ActivatedRoute, Router } from '@angular/router';
import {
    BuildingAssociativePositions,
    BuildingExistancyStatus,
    BuildingPrimaryUse,
} from 'src/app/core/constants';
import { AuthService } from 'src/app/core/services/auth.data.service';
import { CreateBuildingsCleanedDto } from 'src/app/core/models/buildings/building.dto';

// Extended interface for image rotation
interface BuildingImageWithRotation extends BuildingImageDTO {
    rotation?: number;
    description?: string;
}

@Component({
    selector: 'app-admin-building-data-editor',
    templateUrl: './admin-building-data-editor.component.html',
    styleUrls: ['./admin-building-data-editor.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DialogModule,
        GalleriaModule,
        DropdownModule,
        InputTextModule,
        InputNumberModule,
        ButtonModule,
        ProgressSpinnerModule,
        TagModule,
    ],
})
export class AdminBuildingDataEditorComponent implements OnInit {
    buildingId: number;
    buildingDetails: any = {}; // Using any to avoid type conflicts for now
    buildingImages: BuildingImageWithRotation[] = [];
    displayDialog: boolean = false;
    displayImageViewer: boolean = false;
    selectedImage: BuildingImageWithRotation | null = null;
    currentImageIndex: number = 0;

    // Dropdown options
    existencyStatusOptions = Object.values(BuildingExistancyStatus);
    typologyOptions = Object.values(BuildingTypology);
    primaryUseOptions = Object.values(BuildingPrimaryUse);
    statusOptions = Object.values(BuildingDataStatus);
    associativePositionOptions = Object.values(BuildingAssociativePositions);

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
        },
        {
            breakpoint: '768px',
            numVisible: 2,
        },
        {
            breakpoint: '560px',
            numVisible: 1,
        },
    ];

    // Status and navigation properties
    dataCleaningStatus: boolean = false;
    allBuildingIds: string[] = []; // Updated to string array to match API
    currentBuildingPosition: number = 0;
    buildingContext: any = null; // Store context from session storage
    isLoadingData: boolean = false; // Add loading state for navigation
    isSavingData: boolean = false; // Add saving state for form submission
    hasLoadingError: boolean = false; // Add error state
    errorMessage: string = ''; // Add error message

    // History and cleaned data properties
    originalBuildingData: any = null; // Store original building data
    cleanedBuildingData: any = null; // Store cleaned building data
    hasCleanedData: boolean = false; // Track if cleaned data exists
    displayHistoryDialog: boolean = false; // Track history dialog visibility

    constructor(
        private buildingService: BuildingDataService,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {
        this.route.params.subscribe((params) => {
            this.buildingId = Number(params['buildingId']);
        });
        console.log(this.buildingId);

        // Load navigation data from session storage
        this.loadNavigationFromSession();
    }

    ngOnInit() {
        this.loadBuildingData();
    }

    /**
     * Load building details and images for the current building ID
     */
    loadBuildingData(): void {
        // Set loading state
        this.isLoadingData = true;
        this.hasLoadingError = false;
        this.errorMessage = '';

        // Reset current state
        this.buildingDetails = {};
        this.buildingImages = [];
        this.displayImageViewer = false;
        this.selectedImage = null;
        this.currentImageIndex = 0;
        this.originalBuildingData = null;
        this.cleanedBuildingData = null;
        this.hasCleanedData = false;
        this.displayHistoryDialog = false;

        // Load building details (original data)
        this.buildingService.GetBuildingById(this.buildingId).subscribe({
            next: (res) => {
                console.log('Building Details (Original):', res);
                this.originalBuildingData = { ...res }; // Store original data

                // Update data cleaning status based on building details
                this.dataCleaningStatus = res.isDataCleaned || false;

                // If building is marked as cleaned, try to fetch cleaned data
                if (res.isDataCleaned) {
                    this.isLoadingData = true;
                    this.fetchCleanedData();
                } else {
                    // If not cleaned, use original data as current data
                    this.buildingDetails = res;
                }

                this.isLoadingData = false;
            },
            error: (error) => {
                console.error('Error loading building details:', error);
                this.isLoadingData = false;
                this.hasLoadingError = true;
                this.errorMessage = 'Failed to load building data';
            },
        });

        // Load building images separately
        this.loadBuildingImages();

        // Update session storage with current building ID
        sessionStorage.setItem('currentBuildingId', this.buildingId.toString());
    }

    /**
     * Load building images
     */
    private loadBuildingImages(): void {
        this.buildingService
            .GetAllBuildingPhotosById(this.buildingId)
            .subscribe({
                next: (data) => {
                    this.buildingImages = data.map((image) => ({
                        ...image,
                        rotation: 0, // Initialize rotation for each image
                    }));
                },
                error: (error) => {
                    console.error('Error loading building images:', error);
                    // Don't set hasLoadingError for images, just log the error
                },
            });
    }

    /**
     * Fetch cleaned building data if available
     */
    private fetchCleanedData(): void {
        this.buildingService
            .findCleanedBuildingByBuildingId(this.buildingId)
            .subscribe({
                next: (cleanedData) => {
                    console.log('Cleaned Building Data:', cleanedData);
                    this.cleanedBuildingData = { ...cleanedData };
                    this.hasCleanedData = true;

                    // Use cleaned data as current display data by default
                    this.buildingDetails = cleanedData;
                    this.isLoadingData = false;
                },
                error: (error) => {
                    console.error(
                        'Error loading cleaned building data:',
                        error
                    );
                    // If cleaned data fails to load, fall back to original data
                    this.buildingDetails = this.originalBuildingData;
                    this.hasCleanedData = false;
                },
            });
    }

    /**
     * Open history dialog to view original (uncleaned) data
     */
    openHistoryDialog(): void {
        if (this.hasCleanedData && this.originalBuildingData) {
            this.displayHistoryDialog = true;
        }
    }

    /**
     * Close history dialog
     */
    closeHistoryDialog(): void {
        this.displayHistoryDialog = false;
    }

    /**
     * Check if history view should be available
     */
    canViewHistory(): boolean {
        return (
            this.hasCleanedData &&
            this.originalBuildingData !== null &&
            this.cleanedBuildingData !== null &&
            !this.isLoadingData
        );
    }

    /**
     * Get data status display text
     */
    getDataStatusText(): string {
        return this.hasCleanedData ? 'CLEANED' : 'UNCLEANED';
    }

    /**
     * Get the correct building ID to display
     * If cleaned data exists, show cleaned buildingId, otherwise show original id
     */
    getDisplayBuildingId(): string | number {
        if (this.hasCleanedData && this.cleanedBuildingData?.buildingId) {
            return this.cleanedBuildingData.buildingId;
        }
        return this.buildingDetails?.id || this.buildingId;
    }

    parseUri(uri: string) {
        return `${API_URL}/images/building/${uri}`;
    }

    // Image grid methods
    openImageViewer(image: BuildingImageWithRotation, index: number) {
        this.selectedImage = image;
        this.currentImageIndex = index;
        this.displayImageViewer = true;
    }

    rotateImage(image: BuildingImageWithRotation, event: Event) {
        event.stopPropagation();
        if (!image.rotation) {
            image.rotation = 0;
        }
        image.rotation = (image.rotation + 90) % 360;
    }

    // Image viewer methods
    nextImage() {
        if (this.currentImageIndex < this.buildingImages.length - 1) {
            this.currentImageIndex++;
            this.selectedImage = this.buildingImages[this.currentImageIndex];
        }
    }

    previousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.selectedImage = this.buildingImages[this.currentImageIndex];
        }
    }

    rotateCurrentImage() {
        if (this.selectedImage) {
            if (!this.selectedImage.rotation) {
                this.selectedImage.rotation = 0;
            }
            this.selectedImage.rotation =
                (this.selectedImage.rotation + 90) % 360;
        }
    }

    resetImageRotation() {
        if (this.selectedImage) {
            this.selectedImage.rotation = 0;
        }
    }

    // Form methods
    updateBuildingData() {
        try {
            // Get user ID from decoded token
            const decodedToken = this.authService.decodeToken();
            const userId = decodedToken?.userId;

            console.log(userId);
            if (!userId) {
                alert(
                    'Error: User authentication failed. Please log in again.'
                );
                return;
            }

            // Prepare the data for the API
            const cleanedData: CreateBuildingsCleanedDto = {
                buildingId: this.buildingId,
                geom: this.buildingDetails.geom,
                geomSource: this.buildingDetails.geomSource,
                address: this.buildingDetails.address,
                qrUuid: this.buildingDetails.qrUuid,
                existencyStatus: this.buildingDetails.existencyStatus,
                associativePosition: this.buildingDetails.associativePosition,
                name: this.buildingDetails.name,
                typology: this.buildingDetails.typology,
                type: this.buildingDetails.type,
                primaryUse: this.buildingDetails.primaryUse,
                secondaryUse: this.buildingDetails.secondaryUse,
                regularFloorCount: this.buildingDetails.regularFloorCount,
                basementCount: this.buildingDetails.basementCount,
                stiltCount: this.buildingDetails.stiltCount,
                atticCount: this.buildingDetails.atticCount,
                jamthogCount: this.buildingDetails.jamthogCount,
                length: this.buildingDetails.length,
                breadth: this.buildingDetails.breadth,
                footprintArea: this.buildingDetails.footprintArea,
                contact: this.buildingDetails.contact,
                isProtected: this.buildingDetails.isProtected,
                status: this.buildingDetails.status,
                isDataCleaned: true, // Mark as cleaned
                updatedBy: userId,
                subAdministrativeZoneId:
                    this.buildingDetails.subAdministrativeZoneId,
            };

            // Set loading state
            this.isSavingData = true;

            // Call the mark cleaned API
            this.buildingService
                .markBuildingCleaned(this.buildingId, userId, cleanedData)
                .subscribe({
                    next: (response: MarkBuildingCleanedResponse) => {
                        console.log('Building marked as cleaned:', response);

                        if (response.success) {
                            // Update local state
                            this.dataCleaningStatus = true;
                            this.buildingDetails.isDataCleaned = true;
                            this.isSavingData = false;

                            // Update cleaned data cache
                            this.cleanedBuildingData = {
                                ...this.buildingDetails,
                            };
                            this.hasCleanedData = true;

                            alert(
                                response.message ||
                                    'Building data updated and marked as cleaned successfully!'
                            );
                        } else {
                            this.isSavingData = false;
                            alert(
                                'Error: ' +
                                    (response.message ||
                                        'Failed to mark building as cleaned')
                            );
                        }
                    },
                    error: (error) => {
                        console.error('Error updating building data:', error);
                        this.isSavingData = false;

                        const errorMessage =
                            error?.error?.message ||
                            'Failed to update building data';
                        alert(`Error: ${errorMessage}`);
                    },
                });
        } catch (error) {
            console.error('Error preparing building data:', error);
            alert('Error: Failed to prepare building data for update');
        }
    }

    cancelEdit() {
        this.router.navigate(['/admin']);
    }

    /**
     * Check if form should be disabled
     */
    isFormDisabled(): boolean {
        return this.isLoadingData || this.isSavingData;
    }

    /**
     * Get form field disabled state with tooltip
     */
    getFieldDisabledTooltip(): string {
        if (this.isLoadingData) {
            return 'Loading data...';
        }
        if (this.isSavingData) {
            return 'Saving data...';
        }
        return '';
    }

    // Navigation methods
    getCurrentBuildingIndex(): number {
        return this.currentBuildingPosition + 1;
    }

    getTotalBuildings(): number {
        return this.allBuildingIds.length || 1;
    }

    hasPreviousBuilding(): boolean {
        return this.currentBuildingPosition > 0 && !this.isLoadingData;
    }

    hasNextBuilding(): boolean {
        return (
            this.currentBuildingPosition < this.allBuildingIds.length - 1 &&
            !this.isLoadingData
        );
    }

    navigateToPrevious(): void {
        if (this.hasPreviousBuilding() && !this.isLoadingData) {
            this.currentBuildingPosition--;
            const previousBuildingId =
                this.allBuildingIds[this.currentBuildingPosition];

            // Update the building ID and load new data
            this.buildingId = Number(previousBuildingId);

            // Update session storage with new current building ID
            sessionStorage.setItem(
                'currentBuildingId',
                previousBuildingId.toString()
            );

            this.loadBuildingData();

            // Update the URL without triggering a full navigation
            this.router.navigate(['/admin/building-edit', previousBuildingId], {
                replaceUrl: true,
            });
        }
    }

    navigateToNext(): void {
        if (this.hasNextBuilding() && !this.isLoadingData) {
            this.currentBuildingPosition++;
            const nextBuildingId =
                this.allBuildingIds[this.currentBuildingPosition];

            // Update the building ID and load new data
            this.buildingId = Number(nextBuildingId);

            // Update session storage with new current building ID
            sessionStorage.setItem(
                'currentBuildingId',
                nextBuildingId.toString()
            );

            this.loadBuildingData();

            // Update the URL without triggering a full navigation
            this.router.navigate(['/admin/building-edit', nextBuildingId], {
                replaceUrl: true,
            });
        }
    }

    // Legacy methods (keeping for compatibility)
    viewImage(image: BuildingImageDTO) {
        const imageUrl = this.parseUri(image.uri);
        const newWindow = window.open(imageUrl, '_blank');
        if (newWindow) {
            newWindow.focus();
        }
    }

    openDialog(image: BuildingImageDTO) {
        this.selectedImage = image;
        this.displayDialog = true;
    }

    /**
     * Load navigation data from session storage
     */
    private loadNavigationFromSession(): void {
        try {
            // Get building IDs array from session storage
            const buildingIdsJson = sessionStorage.getItem('buildingIds');
            if (buildingIdsJson) {
                this.allBuildingIds = JSON.parse(buildingIdsJson);

                // Find current position in the array
                const currentBuildingId = this.buildingId.toString();
                this.currentBuildingPosition =
                    this.allBuildingIds.indexOf(currentBuildingId);

                // Update current building ID in session storage
                sessionStorage.setItem('currentBuildingId', currentBuildingId);
            }

            // Get building context from session storage
            const contextJson = sessionStorage.getItem('buildingContext');
            if (contextJson) {
                this.buildingContext = JSON.parse(contextJson);
            }
        } catch (error) {
            console.error('Error loading navigation from session:', error);
        }
    }

    /**
     * Get current building position info for display
     */
    getCurrentPositionInfo(): string {
        if (this.allBuildingIds.length === 0) return '';
        return `${this.currentBuildingPosition + 1} of ${
            this.allBuildingIds.length
        }`;
    }

    /**
     * Get building context info for display
     */
    getBuildingContextInfo(): string {
        if (!this.buildingContext) return '';
        return `${this.buildingContext.dzongkhag} | ${this.buildingContext.gewog}`;
    }

    /**
     * Clear error state
     */
    clearError(): void {
        this.hasLoadingError = false;
        this.errorMessage = '';
    }

    /**
     * Retry loading building data
     */
    retryLoadData(): void {
        this.clearError();
        this.loadBuildingData();
    }

    /**
     * Navigate back to gewog selector
     */
    navigateBackToGewogSelector(): void {
        this.router.navigate(['/admin/gewog-selector']);
    }
}
