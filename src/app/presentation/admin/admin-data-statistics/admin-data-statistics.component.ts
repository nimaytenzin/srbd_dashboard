import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import {
    LocationDataService,
    DataCleaningStatus,
} from 'src/app/core/services/location.dataservice';

@Component({
    selector: 'app-admin-data-statistics',
    templateUrl: './admin-data-statistics.component.html',
    styleUrls: ['./admin-data-statistics.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ChartModule,
        TableModule,
        TagModule,
        ProgressBarModule,
        ButtonModule,
        SkeletonModule,
    ],
})
export class AdminDataStatisticsComponent implements OnInit, OnDestroy {
    dzongkhagStats: DataCleaningStatus[] = [];
    totalBuildings: number = 0;
    totalCleanedBuildings: number = 0;
    totalUncleanedBuildings: number = 0;
    overallCleaningPercentage: number = 0;

    isLoading: boolean = true;
    hasError: boolean = false;
    errorMessage: string = '';
    lastRefreshed: string = '';

    // Chart data
    overviewChartData: any;
    overviewChartOptions: any;
    progressChartData: any;
    progressChartOptions: any;

    // Polling subscription
    private pollingSubscription: Subscription | null = null;
    private readonly POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

    constructor(private locationService: LocationDataService) {
        this.initializeChartOptions();
    }

    ngOnInit() {
        this.startPolling();
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    /**
     * Start long polling for data cleaning status
     */
    private startPolling(): void {
        this.pollingSubscription = interval(this.POLLING_INTERVAL)
            .pipe(
                startWith(0), // Start immediately
                switchMap(() => this.locationService.getDataCleaningStatus())
            )
            .subscribe({
                next: (data: DataCleaningStatus[]) => {
                    this.processDataCleaningResponse(data);
                    this.lastRefreshed = new Date().toLocaleString();
                    this.isLoading = false;
                    this.hasError = false;
                    this.updateChartData();
                },
                error: (error) => {
                    console.error(
                        'Error fetching data cleaning status:',
                        error
                    );
                    this.isLoading = false;
                    this.hasError = true;
                    this.errorMessage =
                        error?.error?.message ||
                        'Failed to fetch data cleaning status';
                },
            });
    }

    /**
     * Stop polling when component is destroyed
     */
    private stopPolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = null;
        }
    }

    /**
     * Manually refresh data
     */
    refreshData(): void {
        this.isLoading = true;
        this.hasError = false;
        this.locationService.getDataCleaningStatus().subscribe({
            next: (data: DataCleaningStatus[]) => {
                this.processDataCleaningResponse(data);
                this.lastRefreshed = new Date().toLocaleString();
                this.isLoading = false;
                this.updateChartData();
            },
            error: (error) => {
                console.error('Error refreshing data:', error);
                this.isLoading = false;
                this.hasError = true;
                this.errorMessage =
                    error?.error?.message || 'Failed to refresh data';
            },
        });
    }

    /**
     * Process the API response and calculate totals
     */
    private processDataCleaningResponse(data: DataCleaningStatus[]): void {
        this.dzongkhagStats = data;

        // Calculate totals
        this.totalBuildings = data.reduce(
            (sum, d) => sum + d.totalBuildings,
            0
        );
        this.totalCleanedBuildings = data.reduce(
            (sum, d) => sum + d.cleanedBuildings,
            0
        );
        this.totalUncleanedBuildings = data.reduce(
            (sum, d) => sum + d.notCleanedBuildings,
            0
        );

        // Calculate overall percentage
        this.overallCleaningPercentage =
            this.totalBuildings > 0
                ? Math.round(
                      (this.totalCleanedBuildings / this.totalBuildings) * 100
                  )
                : 0;
    }

    /**
     * Initialize chart options
     */
    private initializeChartOptions(): void {
        this.overviewChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
        };

        this.progressChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function (value: any) {
                            return value + '%';
                        },
                    },
                },
            },
        };
    }

    /**
     * Update chart data when new data is received
     */
    private updateChartData(): void {
        if (!this.dzongkhagStats || this.dzongkhagStats.length === 0) return;

        // Overview pie chart
        this.overviewChartData = {
            labels: ['Cleaned Buildings', 'Uncleaned Buildings'],
            datasets: [
                {
                    data: [
                        this.totalCleanedBuildings,
                        this.totalUncleanedBuildings,
                    ],
                    backgroundColor: ['#10B981', '#EF4444'],
                    borderColor: ['#059669', '#DC2626'],
                    borderWidth: 2,
                },
            ],
        };

        // Progress bar chart by dzongkhag
        this.progressChartData = {
            labels: this.dzongkhagStats.map((d) => d.dzongkhagName),
            datasets: [
                {
                    label: 'Cleaning Progress (%)',
                    data: this.dzongkhagStats.map((d) => d.cleanedPercentage),
                    backgroundColor: this.dzongkhagStats.map((d) =>
                        d.cleanedPercentage >= 80
                            ? '#10B981'
                            : d.cleanedPercentage >= 50
                            ? '#F59E0B'
                            : '#EF4444'
                    ),
                    borderColor: '#1F2937',
                    borderWidth: 1,
                },
            ],
        };
    }

    /**
     * Get severity tag based on cleaning percentage
     */
    getProgressSeverity(percentage: number): 'success' | 'warning' | 'danger' {
        if (percentage >= 80) return 'success';
        if (percentage >= 50) return 'warning';
        return 'danger';
    }

    /**
     * Get progress label based on cleaning percentage
     */
    getProgressLabel(percentage: number): string {
        if (percentage >= 80) return 'Excellent';
        if (percentage >= 50) return 'Good';
        return 'Needs Attention';
    }

    /**
     * Get progress icon based on cleaning percentage
     */
    getProgressIcon(percentage: number): string {
        if (percentage >= 80) return 'pi-check-circle';
        if (percentage >= 50) return 'pi-exclamation-triangle';
        return 'pi-times-circle';
    }
}
