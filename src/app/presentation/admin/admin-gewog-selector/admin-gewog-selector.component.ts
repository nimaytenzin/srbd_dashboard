import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { AuthService } from 'src/app/core/services/auth.data.service';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PARSEBUILDINGFLOORS } from 'src/app/core/helper-function';

export interface Dzongkhag {
    id: number;
    name: string;
    code?: string;
}

export interface SubAdministrativeZone {
    id: number;
    name: string;
    administrativeZoneId: number;
    code?: string;
    buildings: BuildingDTO;
}

export interface AdministrativeZone {
    id: number;
    name: string;
    dzongkhagId: number;
    code?: string;
    subAdministrativeZones: SubAdministrativeZone[];
}

@Component({
    selector: 'app-admin-gewog-selector',
    templateUrl: './admin-gewog-selector.component.html',
    styleUrls: ['./admin-gewog-selector.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        ProgressSpinnerModule,
        RippleModule,
        TooltipModule,
        BadgeModule,
        DropdownModule,
        TableModule,
        TagModule,
        MessagesModule,
        MessageModule,
        InputTextModule,
        ToastModule,
    ],
    providers: [MessageService],
})
export class AdminGewogSelectorComponent implements OnInit {
    dzongkhags: Dzongkhag[] = [];
    gewogs: AdministrativeZone[] = [];
    buildings: BuildingDTO[] = [];
    filteredBuildings: BuildingDTO[] = []; // Track filtered buildings for navigation

    selectedDzongkhag: Dzongkhag | null = null;
    selectedGewog: AdministrativeZone | null = null;
    loadingDzongkhags = false;
    loadingGewogs = false;
    loadingBuildings = false;

    restoredFromSession = false; // Track if selection was restored from session

    // Filter options for data cleaning status
    dataCleaningFilter: 'all' | 'cleaned' | 'uncleaned' = 'all';
    dataCleaningFilterOptions = [
        { label: 'All', value: 'all' },
        { label: 'Cleaned', value: 'cleaned' },
        { label: 'Uncleaned', value: 'uncleaned' },
    ];

    errorMessage = '';
    parseBuildingFloor = PARSEBUILDINGFLOORS;

    constructor(
        private locationService: LocationDataService,
        private buildingService: BuildingDataService,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadDzongkhags();
        // Try to restore previous selection from session storage
        this.restoreSelectionFromSession();

        // Show welcome message after a small delay to ensure component is ready
        setTimeout(() => {
            this.showWelcomeMessage();
        }, 500);
    }

    /**
     * Show welcome message with user's name from decoded token
     */
    private showWelcomeMessage() {
        try {
            console.log('Attempting to show welcome message...');
            const decodedToken = this.authService.decodeToken();
            console.log('Decoded token:', decodedToken);

            const userName = decodedToken?.fullName || 'User';
            console.log('User name:', userName);

            this.messageService.add({
                severity: 'success',
                summary: `Welcome, ${userName}!`,
                detail: '..to the ELE Data cleaning workshop',
                life: 5000,
            });

            console.log('Welcome message added successfully');
        } catch (error) {
            console.error('Error showing welcome message:', error);
            // Fallback welcome message
            this.messageService.add({
                severity: 'info',
                summary: 'Welcome!',
                detail: 'You can now manage building data across dzongkhags and gewogs.',
                life: 5000,
            });
        }
    }

    loadDzongkhags() {
        this.loadingDzongkhags = true;
        this.errorMessage = '';

        this.locationService.GetAllDzonghags().subscribe({
            next: (data: any) => {
                this.dzongkhags = data;
                this.loadingDzongkhags = false;
            },
            error: (error) => {
                console.error('Error loading dzongkhags:', error);
                this.errorMessage =
                    'Failed to load dzongkhags. Please try again.';
                this.loadingDzongkhags = false;
            },
        });
    }

    onDzongkhagSelect(event: any) {
        this.selectedDzongkhag = event.value;
        this.selectedGewog = null;
        this.gewogs = [];
        this.buildings = [];

        if (this.selectedDzongkhag) {
            this.loadGewogs(this.selectedDzongkhag.id);
            // Save selected dzongkhag to session storage
            this.saveSelectionToSession();
        } else {
            // Clear selection from session storage if dzongkhag is deselected
            this.clearSelectionFromSession();
        }
    }

    loadGewogs(dzongkhagId: number) {
        this.loadingGewogs = true;
        this.errorMessage = '';

        this.locationService
            .GetAllAdministrativeZonesByDzongkhag(dzongkhagId)
            .subscribe({
                next: (data: any) => {
                    this.gewogs = data;
                    this.loadingGewogs = false;
                },
                error: (error) => {
                    console.error('Error loading gewogs:', error);
                    this.errorMessage =
                        'Failed to load gewogs. Please try again.';
                    this.loadingGewogs = false;
                },
            });
    }

    onGewogSelect(event: any) {
        this.selectedGewog = event.value;
        this.buildings = [];

        if (this.selectedGewog) {
            this.loadBuildingsByGewog(this.selectedGewog.id);
            // Save selected gewog to session storage
            this.saveSelectionToSession();
        }
    }

    loadBuildingsByGewog(gewogId: number) {
        this.loadingBuildings = true;
        this.errorMessage = '';

        this.buildingService.GetBuildingsByGewog(gewogId).subscribe({
            next: (data: any) => {
                this.buildings = data;
                this.applyDataCleaningFilter(); // Apply current filter
                this.loadingBuildings = false;

                // Update session storage with new building list
                this.updateBuildingSessionStorage();
            },
            error: (error) => {
                console.error('Error loading buildings:', error);
                this.errorMessage =
                    'Failed to load buildings. Please try again.';
                this.loadingBuildings = false;
            },
        });
    }

    resetSelection() {
        this.selectedDzongkhag = null;
        this.selectedGewog = null;
        this.gewogs = [];
        this.buildings = [];
        this.filteredBuildings = [];
        this.errorMessage = '';
        this.restoredFromSession = false; // Clear the restored flag
        this.dataCleaningFilter = 'all'; // Reset filter

        // Clear both building and selection session storage when resetting
        this.clearBuildingSessionStorage();
        this.clearSelectionFromSession();
    }

    viewBuilding(building: BuildingDTO) {
        // TODO: Navigate to building detail view or open in modal
        console.log('Viewing building:', building);
        // You can add navigation logic here, for example:
        // this.router.navigate(['/admin/building', building.id]);
    }

    editBuilding(building: BuildingDTO) {
        // Use filtered buildings for navigation (respects current table filters)
        const buildingIds = this.filteredBuildings.map((b) => b.id);
        const currentBuildingId = building.id;

        // Store in session storage
        sessionStorage.setItem('buildingIds', JSON.stringify(buildingIds));
        sessionStorage.setItem('currentBuildingId', currentBuildingId);

        // Store additional context for better UX
        sessionStorage.setItem(
            'buildingContext',
            JSON.stringify({
                dzongkhag: this.selectedDzongkhag?.name,
                gewog: this.selectedGewog?.name,
                totalBuildings: this.filteredBuildings.length, // Use filtered count
                currentIndex: buildingIds.indexOf(currentBuildingId),
            })
        );

        // Navigate to building edit view
        this.router.navigate(['/admin/building-edit', building.id]);
    }

    navigateToStatistics(): void {
        this.router.navigate(['/admin/stats']);
    }

    getExistencyStatusSeverity(status: string): string {
        switch (status?.toLowerCase()) {
            case 'existing':
            case 'standing':
                return 'success';
            case 'non existent':
            case 'demolished':
                return 'danger';
            case 'under construction':
                return 'warning';
            case 'proposed':
                return 'info';
            default:
                return 'secondary';
        }
    }

    getDataCleaningPercentage(): number {
        if (this.buildings.length === 0) return 0;
        const cleanedCount = this.buildings.filter(
            (building) => building.isDataCleaned
        ).length;
        return Math.round((cleanedCount / this.buildings.length) * 100);
    }

    getDataCleaningStats(): {
        cleaned: number;
        total: number;
        percentage: number;
    } {
        const total = this.buildings.length;
        const cleaned = this.buildings.filter(
            (building) => building.isDataCleaned
        ).length;
        const percentage = total > 0 ? Math.round((cleaned / total) * 100) : 0;

        return { cleaned, total, percentage };
    }

    /**
     * Apply data cleaning filter based on current selection
     */
    applyDataCleaningFilter() {
        switch (this.dataCleaningFilter) {
            case 'cleaned':
                this.filteredBuildings = this.buildings.filter(
                    (b) => b.isDataCleaned
                );
                break;
            case 'uncleaned':
                this.filteredBuildings = this.buildings.filter(
                    (b) => !b.isDataCleaned
                );
                break;
            default: // 'all'
                this.filteredBuildings = [...this.buildings];
                break;
        }
    }

    /**
     * Handle data cleaning filter change
     */
    onDataCleaningFilterChange(event: any) {
        this.dataCleaningFilter = event.value;
        this.applyDataCleaningFilter();
    }

    /**
     * Get data cleaning stats for currently filtered buildings
     */
    getFilteredDataCleaningStats(): {
        cleaned: number;
        total: number;
        percentage: number;
    } {
        const total = this.filteredBuildings.length;
        const cleaned = this.filteredBuildings.filter(
            (building) => building.isDataCleaned
        ).length;
        const percentage = total > 0 ? Math.round((cleaned / total) * 100) : 0;

        return { cleaned, total, percentage };
    }

    /**
     * Updates session storage with current building list and context
     */
    private updateBuildingSessionStorage() {
        if (this.buildings.length > 0) {
            // Always use the full building list for initial context
            const buildingIds = this.buildings.map((b) => b.id);
            sessionStorage.setItem('buildingIds', JSON.stringify(buildingIds));

            // Store context information
            sessionStorage.setItem(
                'buildingContext',
                JSON.stringify({
                    dzongkhag: this.selectedDzongkhag?.name,
                    gewog: this.selectedGewog?.name,
                    totalBuildings: this.buildings.length,
                    lastUpdated: new Date().toISOString(),
                })
            );
        }
    }

    /**
     * Clears building-related session storage
     */
    private clearBuildingSessionStorage() {
        sessionStorage.removeItem('buildingIds');
        sessionStorage.removeItem('currentBuildingId');
        sessionStorage.removeItem('buildingContext');
    }

    /**
     * Save current dzongkhag and gewog selection to session storage
     */
    private saveSelectionToSession() {
        const selectionData = {
            dzongkhag: this.selectedDzongkhag,
            gewog: this.selectedGewog,
            timestamp: new Date().toISOString(),
        };
        sessionStorage.setItem('gewogSelection', JSON.stringify(selectionData));
    }

    /**
     * Clear dzongkhag and gewog selection from session storage
     */
    private clearSelectionFromSession() {
        sessionStorage.removeItem('gewogSelection');
    }

    /**
     * Restore dzongkhag and gewog selection from session storage
     */
    private restoreSelectionFromSession() {
        try {
            const selectionJson = sessionStorage.getItem('gewogSelection');
            if (selectionJson) {
                const selectionData = JSON.parse(selectionJson);

                // Check if the data is not too old (optional - prevents stale data)
                const timestamp = new Date(selectionData.timestamp);
                const now = new Date();
                const hoursDiff =
                    (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

                // Only restore if less than 24 hours old
                if (hoursDiff < 24) {
                    // Wait for dzongkhags to load first
                    const checkDzongkhags = () => {
                        if (this.dzongkhags && this.dzongkhags.length > 0) {
                            this.restoreSelection(selectionData);
                        } else {
                            // Try again after a short delay
                            setTimeout(checkDzongkhags, 100);
                        }
                    };
                    checkDzongkhags();
                }
            }
        } catch (error) {
            console.error('Error restoring selection from session:', error);
            this.clearSelectionFromSession();
        }
    }

    /**
     * Actually restore the selection after dzongkhags are loaded
     */
    private restoreSelection(selectionData: any) {
        // Restore dzongkhag selection
        if (selectionData.dzongkhag) {
            const dzongkhag = this.dzongkhags.find(
                (d) => d.id === selectionData.dzongkhag.id
            );
            if (dzongkhag) {
                this.selectedDzongkhag = dzongkhag;
                this.restoredFromSession = true; // Mark as restored

                // Load gewogs for the selected dzongkhag
                this.loadGewogs(dzongkhag.id);

                // Restore gewog selection after gewogs are loaded
                if (selectionData.gewog) {
                    const checkGewogs = () => {
                        if (this.gewogs && this.gewogs.length > 0) {
                            const gewog = this.gewogs.find(
                                (g) => g.id === selectionData.gewog.id
                            );
                            if (gewog) {
                                this.selectedGewog = gewog;
                                // Load buildings for the selected gewog
                                this.loadBuildingsByGewog(gewog.id);
                            }
                        } else {
                            // Try again after a short delay
                            setTimeout(checkGewogs, 100);
                        }
                    };
                    checkGewogs();
                }
            }
        }
    }
}
