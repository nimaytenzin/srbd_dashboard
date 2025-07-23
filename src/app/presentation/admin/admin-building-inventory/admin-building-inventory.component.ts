import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { MessageService, SelectItem } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { LocationDataService } from 'src/app/core/services/location.dataservice';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import {
    BuildingWithGeom,
    GeometryDataService,
} from 'src/app/core/services/geometry.dataservice';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { BuildingDTO } from 'src/app/core/models/buildings/building.dto';
import {
    DialogService,
    DynamicDialogModule,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AdminBuildingInventoryViewDetailsComponent } from './components/admin-building-inventory-view-details/admin-building-inventory-view-details.component';
import { EpicollectSurveyViewerComponent } from './components/epicollect-survey-viewer/epicollect-survey-viewer.component';
import { BuildingDetailsDialogComponent } from './components/building-details-dialog/building-details-dialog.component';
import { SurveyBuildingMappingDialogComponent } from './components/survey-building-mapping-dialog/survey-building-mapping-dialog.component';
import { ToastModule } from 'primeng/toast';

// Import EpiCollect Helper and Survey Data DTO
import {
    EpiCollectHelper,
    createEpiCollectHelper,
    injectEpiCollectStyles,
} from './epi-collect-helpers/epicollect.helper';
import {
    SurveyDataItem,
    SurveyDataResponse,
    convertSurveyDataToGeoJSON,
    SurveyDataGeoJSONLoader,
    createSurveyDataLoaderWithImages,
} from './data/survey-data.dto';
import { BuildingSurveyCSVData } from './data/csv.data.dto';

// OAuth Token Management Interface
interface OAuthTokenData {
    access_token: string;
    token_type: string;
    expires_in: number;
    expires_at: number; // timestamp when token expires
}

interface EpiCollectCredentials {
    clientId: string;
    clientSecret: string;
}

@Component({
    selector: 'app-admin-building-inventory',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DropdownModule,
        CardModule,
        ButtonModule,
        DividerModule,
        DynamicDialogModule,
        FileUploadModule,
        ToastModule,
    ],
    providers: [DialogService, MessageService],
    templateUrl: './admin-building-inventory.component.html',
    styleUrl: './admin-building-inventory.component.scss',
})
export class AdminBuildingInventoryComponent implements OnInit, OnDestroy {
    constructor(
        private locationDataService: LocationDataService,
        private geometryDataService: GeometryDataService,
        private buildingDataService: BuildingDataService,
        public dialogService: DialogService,
        private messageService: MessageService
    ) {}

    ref: DynamicDialogRef | undefined;

    googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
    map!: L.Map;
    buildingGeojson!: L.GeoJSON;
    cleanedBuildingsLayer!: L.GeoJSON;
    uncleanedBuildingsLayer!: L.GeoJSON;
    plotsGeojson!: L.GeoJSON;
    boundary = {} as L.GeoJSON;

    // Building data storage
    cleanedBuildings: BuildingWithGeom[] = [];
    uncleanedBuildings: BuildingWithGeom[] = [];

    dzongkhags: any[] = [];
    administrativeZones: any[] = [];
    subadministrativeZones: any[] = [];

    selectedDzongkhag: any;
    selectedAdministrativeZone: any;
    selectedSubAdministrativeZone: any;
    selected = false;
    mapStateStored = localStorage.getItem('mapState');

    // OAuth Token Management
    oauthCredentials: EpiCollectCredentials = {
        clientId: '6549',
        clientSecret: 'mSaIfSYZoShjVcpDtQCgfxPAWdxiLDiKOLinf7rX',
    };

    oauthToken: OAuthTokenData | null = null;
    tokenRefreshTimer: any = null;
    tokenMonitorTimer: any = null; // Timer for periodic token checking
    isTokenRefreshing = false;

    // EpiCollect Configuration
    epicollectConfig = {
        projectSlug: 'dagana-building-inventory',
        authToken: '',
    };

    // Survey data properties
    isFileLoaded = false;
    loadedSurveyData: SurveyDataItem[] = [];
    surveyDataLayer!: L.GeoJSON;

    // CSV Building Survey data properties
    isCSVLoaded = false;
    loadedCSVData: BuildingSurveyCSVData[] = [];
    csvDataLayer!: L.GeoJSON;

    // Locate feature properties
    locateUuid: string = '';
    locateBuildingId: number | null = null;

    // EpiCollect Helper
    epicollectHelper?: EpiCollectHelper;
    surveyDataLoader?: SurveyDataGeoJSONLoader;

    ngOnInit(): void {
        this.renderMap();
        this.loadDzongkhags();
        this.initializeOAuthToken();
        this.initializeEpiCollectHelper();
        this.startTokenMonitoring();
    }

    ngOnDestroy(): void {
        // Clean up timers when component is destroyed
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
        }
        if (this.tokenMonitorTimer) {
            clearInterval(this.tokenMonitorTimer);
        }
    }

    // Get current auth token (OAuth or manual)
    getCurrentAuthToken(): string {
        // Use OAuth token if available and valid
        if (this.oauthToken && this.isTokenValid(this.oauthToken)) {
            return `Bearer ${this.oauthToken.access_token}`;
        }

        // If OAuth token exists but is expired, try to refresh it
        if (this.oauthToken && !this.isTokenValid(this.oauthToken)) {
            console.log('OAuth token is expired, refreshing...');
            this.refreshOAuthToken(); // This will run async
        }

        // Fall back to manual token if OAuth is not available
        return this.epicollectConfig.authToken || '';
    }

    renderMap() {
        var satelliteMap = L.tileLayer(this.googleSatUrl, {
            maxNativeZoom: 21,
            maxZoom: 21,
        });
        this.map = L.map('map', {
            layers: [satelliteMap],
            zoomControl: false,
            attributionControl: false,
            maxZoom: 25,
            renderer: L.canvas({ tolerance: 3 }),
        }).setView([27.4712, 89.64191], 12);
    }

    onDzongkahgChange(event) {
        this.loadAdministrativeZonesByDzongkhag(event.id);
    }

    loadDzongkhags() {
        this.locationDataService.GetAllDzonghags().subscribe((res: any) => {
            this.dzongkhags = res;
            // this.selectedDzongkhag = res[0];
        });
    }
    loadAdministrativeZonesByDzongkhag(dzongkhagId: number) {
        this.selected = true;
        this.locationDataService
            .GetAllAdministrativeZonesByDzongkhag(dzongkhagId)
            .subscribe((res: any) => {
                this.administrativeZones = res;
                this.selectedAdministrativeZone = res[0];
            });
    }

    onSubAdministrativeZoneChange() {
        console.log(
            'Sub-administrative zone changed:',
            this.selectedSubAdministrativeZone
        );
        this.clearMapState();
    }

    loadPlotsAndBuildings() {
        // Check if we have selected dzongkhag
        if (!this.selectedDzongkhag?.id) {
            console.warn('No Dzongkhag selected');
            return;
        }

        // Clear existing building layers
        this.clearBuildingLayers();

        // Load both cleaned and uncleaned buildings in parallel
        const cleanedBuildings$ =
            this.buildingDataService.GetCleanedBuildingsByDzongkhag(
                this.selectedDzongkhag.id
            );

        const uncleanedBuildings$ =
            this.buildingDataService.GetUncleanedBuildingsByDzongkhag(
                this.selectedDzongkhag.id
            );

        // Load cleaned buildings
        cleanedBuildings$.subscribe({
            next: (buildings: BuildingWithGeom[]) => {
                console.log('Loaded cleaned buildings:', buildings.length);
                this.cleanedBuildings = buildings;
                this.renderCleanedBuildings(buildings);
            },
            error: (error) => {
                console.error('Error loading cleaned buildings:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load cleaned buildings',
                    life: 3000,
                });
            },
        });

        // Load uncleaned buildings
        uncleanedBuildings$.subscribe({
            next: (buildings: BuildingWithGeom[]) => {
                console.log('Loaded uncleaned buildings:', buildings.length);
                this.uncleanedBuildings = buildings;
                this.renderUncleanedBuildings(buildings);

                // Fit map to all buildings after loading uncleaned (assuming they load last)
                this.fitMapToAllBuildings();
            },
            error: (error) => {
                console.error('Error loading uncleaned buildings:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load uncleaned buildings',
                    life: 3000,
                });
            },
        });
    }

    /**
     * Clear all building layers from the map
     */
    clearBuildingLayers(): void {
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
        if (this.cleanedBuildingsLayer) {
            this.map.removeLayer(this.cleanedBuildingsLayer);
        }
        if (this.uncleanedBuildingsLayer) {
            this.map.removeLayer(this.uncleanedBuildingsLayer);
        }
    }

    /**
     * Render cleaned buildings with green color
     */
    renderCleanedBuildings(buildings: BuildingWithGeom[]): void {
        if (buildings.length === 0) return;

        const buildingsGeoJSON = this.convertBuildingsToGeoJSON(buildings);

        this.cleanedBuildingsLayer = L.geoJSON(buildingsGeoJSON, {
            style: function (feature) {
                const hasImages =
                    feature.properties.buildingImages &&
                    feature.properties.buildingImages.length > 0;
                return {
                    fillColor: 'transparent',
                    weight: 2,
                    opacity: 1,
                    color: hasImages ? '#90EE90' : '#008000', // Light green for with images, dark green for without
                    fillOpacity: 0,
                };
            },
            onEachFeature: (feature, layer) => {
                layer.on({
                    click: (e: any) => {
                        this.showBuildingDetails(feature.properties);
                    },
                });
            },
        }).addTo(this.map);

        console.log(`Rendered ${buildings.length} cleaned buildings in green`);
    }

    /**
     * Render uncleaned buildings with red color
     */
    renderUncleanedBuildings(buildings: BuildingWithGeom[]): void {
        if (buildings.length === 0) return;

        const buildingsGeoJSON = this.convertBuildingsToGeoJSON(buildings);

        this.uncleanedBuildingsLayer = L.geoJSON(buildingsGeoJSON, {
            style: function (feature) {
                const hasImages =
                    feature.properties.buildingImages &&
                    feature.properties.buildingImages.length > 0;
                return {
                    fillColor: 'transparent',
                    weight: 2,
                    opacity: 1,
                    color: hasImages ? '#FFA500' : '#FF0000', // Orange for with images, red for without
                    fillOpacity: 0,
                };
            },
            onEachFeature: (feature, layer) => {
                layer.on({
                    click: (e: any) => {
                        this.showBuildingDetails(feature.properties);
                    },
                });
            },
        }).addTo(this.map);

        console.log(`Rendered ${buildings.length} uncleaned buildings in red`);
    }

    /**
     * Fit map to show all building layers
     */
    fitMapToAllBuildings(): void {
        const bounds = L.latLngBounds([]);
        let hasBuildings = false;

        if (
            this.cleanedBuildingsLayer &&
            this.cleanedBuildingsLayer.getBounds().isValid()
        ) {
            bounds.extend(this.cleanedBuildingsLayer.getBounds());
            hasBuildings = true;
        }

        if (
            this.uncleanedBuildingsLayer &&
            this.uncleanedBuildingsLayer.getBounds().isValid()
        ) {
            bounds.extend(this.uncleanedBuildingsLayer.getBounds());
            hasBuildings = true;
        }

        if (hasBuildings) {
            this.map.fitBounds(bounds, { padding: [20, 20] });
        }
    }

    convertBuildingsToGeoJSON(
        buildings: BuildingWithGeom[]
    ): GeoJSON.FeatureCollection {
        return {
            type: 'FeatureCollection',
            features: buildings.map((building) => ({
                type: 'Feature',
                geometry: building.geom,
                properties: {
                    ...building,
                },
            })),
        };
    }

    showBuilding(properties: any) {
        console.log('showBuilding', properties);
        this.ref = this.dialogService.open(
            AdminBuildingInventoryViewDetailsComponent,
            {
                header: 'Details',
                data: {
                    ...properties,
                },
            }
        );
    }

    clearMapState() {
        localStorage.removeItem('mapState');
        if (this.plotsGeojson) {
            this.map.removeLayer(this.plotsGeojson);
        }
        if (this.boundary) {
            this.map.removeLayer(this.boundary);
        }
        if (this.buildingGeojson) {
            this.map.removeLayer(this.buildingGeojson);
        }
        if (this.cleanedBuildingsLayer) {
            this.map.removeLayer(this.cleanedBuildingsLayer);
        }
        if (this.uncleanedBuildingsLayer) {
            this.map.removeLayer(this.uncleanedBuildingsLayer);
        }
    }

    fitMapBounds() {
        this.map.fitBounds(this.buildingGeojson.getBounds());
        // this.boundary.bringToBack();
    }

    async updateBuildingGeom(buildingId, data) {
        return await this.geometryDataService
            .updateBuildingGeom(buildingId, data)
            .toPromise();
    }

    async insertBuildingPoint(data) {
        return await this.geometryDataService
            .postBuildingPoint(data)
            .toPromise();
    }

    async insertBuildingGeom(data) {
        return await this.geometryDataService
            .postBuildingGeom(data)
            .toPromise();
    }

    async insertBuildingPlots(data) {
        return await this.geometryDataService
            .postBuildingPlot(data)
            .toPromise();
    }

    // OAuth Token Management Methods
    async initializeOAuthToken(): Promise<void> {
        console.log('Initializing OAuth token...');

        // Check if we have a valid token in localStorage
        const storedToken = localStorage.getItem('epicollect_oauth_token');

        if (storedToken) {
            try {
                const tokenData: OAuthTokenData = JSON.parse(storedToken);

                // Check if token is still valid
                if (this.isTokenValid(tokenData)) {
                    console.log('Valid token found in localStorage');
                    this.oauthToken = tokenData;
                    this.scheduleTokenRefresh();
                    return;
                } else {
                    console.log(
                        'Token in localStorage is expired, removing...'
                    );
                    localStorage.removeItem('epicollect_oauth_token');
                }
            } catch (error) {
                console.error('Error parsing stored token:', error);
                localStorage.removeItem('epicollect_oauth_token');
            }
        }

        // No valid token found, request new one
        console.log('No valid token found, requesting new token...');
        await this.refreshOAuthToken();
    }

    async refreshOAuthToken(): Promise<void> {
        if (this.isTokenRefreshing) {
            console.log('Token refresh already in progress, skipping...');
            return; // Prevent concurrent refresh attempts
        }

        this.isTokenRefreshing = true;
        console.log('Refreshing OAuth token...');

        try {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json');

            const raw = JSON.stringify({
                grant_type: 'client_credentials',
                client_id: parseInt(this.oauthCredentials.clientId),
                client_secret: this.oauthCredentials.clientSecret,
            });

            const requestOptions: RequestInit = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow',
            };

            const response = await fetch(
                `https://five.epicollect.net/api/oauth/token?grant_type=client_credentials&client_id=${this.oauthCredentials.clientId}&client_secret=${this.oauthCredentials.clientSecret}`,
                requestOptions
            );

            if (!response.ok) {
                throw new Error(
                    `OAuth request failed: ${response.status} ${response.statusText}`
                );
            }

            const result = await response.json();

            // Calculate expires_at timestamp
            const expiresAt = Date.now() + result.expires_in * 1000;

            this.oauthToken = {
                access_token: result.access_token,
                token_type: result.token_type,
                expires_in: result.expires_in,
                expires_at: expiresAt,
            };

            // Store in localStorage
            localStorage.setItem(
                'epicollect_oauth_token',
                JSON.stringify(this.oauthToken)
            );

            // Schedule next refresh
            this.scheduleTokenRefresh();

            console.log('OAuth token refreshed successfully');
            console.log(
                'Token expires at:',
                new Date(expiresAt).toLocaleString()
            );
        } catch (error) {
            console.error('Failed to refresh OAuth token:', error);
            this.oauthToken = null;
            localStorage.removeItem('epicollect_oauth_token');
        } finally {
            this.isTokenRefreshing = false;
        }
    }

    private isTokenValid(token: OAuthTokenData): boolean {
        // Check if token expires in next 5 minutes (300000ms)
        return token.expires_at > Date.now() + 300000;
    }

    private scheduleTokenRefresh(): void {
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
        }

        if (!this.oauthToken) return;

        // Refresh 5 minutes before expiry
        const refreshTime = this.oauthToken.expires_at - Date.now() - 300000;

        if (refreshTime > 0) {
            this.tokenRefreshTimer = setTimeout(() => {
                this.refreshOAuthToken();
            }, refreshTime);
        }
    }

    getTokenExpiryInfo(): string {
        if (!this.oauthToken) return 'No token';

        const expiresAt = new Date(this.oauthToken.expires_at);
        const now = new Date();
        const minutesLeft = Math.floor(
            (this.oauthToken.expires_at - now.getTime()) / 60000
        );

        if (minutesLeft <= 0) {
            return `Token expired at ${expiresAt.toLocaleString()}`;
        }

        return `Expires: ${expiresAt.toLocaleString()} (${minutesLeft} min left)`;
    }

    // Manual token refresh method for the button
    async manualRefreshToken(): Promise<void> {
        console.log('Manual token refresh requested');

        if (
            !this.oauthCredentials.clientId ||
            !this.oauthCredentials.clientSecret
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Missing Credentials',
                detail: 'Please enter valid OAuth credentials before refreshing token',
                life: 5000,
            });
            return;
        }

        try {
            await this.refreshOAuthToken();
            console.log('Manual token refresh completed successfully');

            // Reinitialize EpiCollect helper with new token
            this.initializeEpiCollectHelper();

            this.messageService.add({
                severity: 'success',
                summary: 'Token Refreshed',
                detail: 'OAuth token has been refreshed successfully',
                life: 3000,
            });
        } catch (error) {
            console.error('Manual token refresh failed:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Token Refresh Failed',
                detail: 'Failed to refresh token. Please check your credentials and try again.',
                life: 5000,
            });
        }
    }

    // Check if we need to show token warning
    isTokenExpiringSoon(): boolean {
        if (!this.oauthToken) return false;

        const now = Date.now();
        const timeUntilExpiry = this.oauthToken.expires_at - now;
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

        return timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0;
    }

    // Check if token is completely expired
    isTokenExpired(): boolean {
        if (!this.oauthToken) return true;
        return this.oauthToken.expires_at <= Date.now();
    }

    // Start periodic monitoring of token status
    startTokenMonitoring(): void {
        // Check token status every minute
        this.tokenMonitorTimer = setInterval(() => {
            if (
                this.oauthToken &&
                this.isTokenExpired() &&
                !this.isTokenRefreshing
            ) {
                console.log(
                    'Token expired during monitoring, attempting refresh...'
                );
                this.refreshOAuthToken();
            }
        }, 60000); // Check every minute
    }

    onCredentialsChange(): void {
        console.log(
            'OAuth credentials changed, checking if refresh is needed...'
        );

        // Clear current token when credentials change
        this.oauthToken = null;
        localStorage.removeItem('epicollect_oauth_token');

        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
        }

        // Only get new token if we have both client ID and secret
        if (
            this.oauthCredentials.clientId &&
            this.oauthCredentials.clientSecret
        ) {
            this.refreshOAuthToken();
        } else {
            console.log('Incomplete credentials, skipping token refresh');
        }

        // Reinitialize EpiCollect helper with new credentials
        this.initializeEpiCollectHelper();
    }

    // EpiCollect Helper Initialization
    initializeEpiCollectHelper(): void {
        // Inject EpiCollect styles
        injectEpiCollectStyles();

        // Create EpiCollect helper if we have credentials
        const authToken = this.getCurrentAuthToken();
        if (authToken && this.epicollectConfig.projectSlug) {
            this.epicollectHelper = createEpiCollectHelper(
                this.epicollectConfig.projectSlug,
                authToken
            );

            // Create survey data loader with image support
            this.surveyDataLoader = createSurveyDataLoaderWithImages(
                this.epicollectConfig.projectSlug,
                authToken
            );

            // Set click callback for survey details
            this.surveyDataLoader.setClickCallback((uuid: string) => {
                this.showSurveyDetails(uuid);
            });

            console.log(
                'EpiCollect helper initialized with project:',
                this.epicollectConfig.projectSlug
            );
        }
    }

    onFileSelect(event: any): void {
        // Handle file selection for survey data
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);

                    // Handle different JSON structures
                    let surveyArray: SurveyDataItem[] = [];

                    if (Array.isArray(jsonData)) {
                        // Direct array
                        surveyArray = jsonData;
                    } else if (jsonData.data && Array.isArray(jsonData.data)) {
                        // Nested in 'data' property (EpiCollect standard format)
                        surveyArray = jsonData.data;
                    } else if (
                        jsonData.entries &&
                        Array.isArray(jsonData.entries)
                    ) {
                        // Nested in 'entries' property (EpiCollect alternative format)
                        surveyArray = jsonData.entries;
                    } else if (
                        jsonData.features &&
                        Array.isArray(jsonData.features)
                    ) {
                        // GeoJSON format - convert to survey format
                        surveyArray = jsonData.features.map(
                            (f: any) =>
                                ({
                                    ...f.properties,
                                    '8_Location_Lat_Long': {
                                        latitude: f.geometry.coordinates[1],
                                        longitude: f.geometry.coordinates[0],
                                        accuracy: f.properties.accuracy || 0,
                                        UTM_Northing:
                                            f.properties.UTM_Northing || 0,
                                        UTM_Easting:
                                            f.properties.UTM_Easting || 0,
                                        UTM_Zone: f.properties.UTM_Zone || '',
                                    },
                                } as SurveyDataItem)
                        );
                    } else {
                        // Try to find any array property
                        for (const key in jsonData) {
                            if (Array.isArray(jsonData[key])) {
                                surveyArray = jsonData[key];
                                break;
                            }
                        }
                    }

                    if (surveyArray.length === 0) {
                        throw new Error(
                            'No survey data array found in JSON file'
                        );
                    }

                    this.loadedSurveyData = surveyArray;
                    this.isFileLoaded = true;

                    // Set survey data in the loader for image handling
                    if (this.surveyDataLoader) {
                        this.surveyDataLoader.setSurveyData(surveyArray);
                    }

                    console.log(
                        'Survey data loaded:',
                        this.loadedSurveyData.length,
                        'items'
                    );
                    console.log('First survey item:', this.loadedSurveyData[0]);

                    // Render survey data on map
                    this.renderSurveyDataOnMap();
                } catch (error: any) {
                    console.error('Error parsing survey data:', error);
                    this.isFileLoaded = false;

                    // Show user-friendly error message using toast
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Survey Data Loading Error',
                        detail: `Error loading survey data: ${error.message}`,
                        life: 5000,
                    });
                }
            };
            reader.readAsText(file);
        }
    }

    renderSurveyDataOnMap(): void {
        // Clear existing survey data layer
        if (this.surveyDataLayer) {
            this.map.removeLayer(this.surveyDataLayer);
        }

        if (!this.loadedSurveyData || this.loadedSurveyData.length === 0) {
            return;
        }

        try {
            // Use the proper conversion function from survey-data.dto
            const geoJsonData = convertSurveyDataToGeoJSON(
                this.loadedSurveyData
            );

            console.log('geonjson data', geoJsonData);

            // Use the survey data loader if available, otherwise fallback to basic rendering
            // if (this.surveyDataLoader) {
            //     this.surveyDataLayer = this.surveyDataLoader.renderOnMap(
            //         geoJsonData,
            //         this.map
            //     );
            // } else {
            //     // Fallback rendering without advanced features

            // }

            this.surveyDataLayer = L.geoJSON(geoJsonData, {
                pointToLayer: (feature, latlng) => {
                    return L.circleMarker(latlng, {
                        radius: 4,
                        fillColor: '#00FFFF',
                        color: '#00FFFF',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.5,
                    });
                },
                onEachFeature: (feature, layer) => {
                    // Add popup with survey details

                    // Add click event for survey details
                    layer.on('dblclick', (e: any) => {
                        // Prevent event propagation to map
                        L.DomEvent.stopPropagation(e);

                        // Get survey UUID from feature properties
                        const surveyUuid =
                            feature.properties.ec5_uuid ||
                            feature.properties.id ||
                            feature.properties.uuid;

                        console.log('Survey point clicked, UUID:', surveyUuid);
                        console.log('Feature properties:', feature.properties);

                        if (surveyUuid) {
                            this.showSurveyDetails(surveyUuid);
                        } else {
                            console.warn(
                                'No survey UUID found in feature properties'
                            );
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Survey ID Missing',
                                detail: 'Survey ID not found. Cannot show details.',
                                life: 3000,
                            });
                        }
                    });

                    // Add double-click event for immediate survey details
                    layer.on('dblclick', (e: any) => {
                        // Prevent event propagation
                        L.DomEvent.stopPropagation(e);

                        const surveyUuid =
                            feature.properties.ec5_uuid ||
                            feature.properties.id ||
                            feature.properties.uuid;

                        if (surveyUuid) {
                            this.showSurveyDetails(surveyUuid);
                        }
                    });

                    // Make survey points draggable
                    this.makeBuildingPointDraggable(layer, feature);
                },
            }).addTo(this.map);

            console.log(
                `Rendered ${geoJsonData.features.length} survey points on map`
            );
        } catch (error) {
            console.error('Error rendering survey data on map:', error);
        }
    }

    getSurveyPointColor(properties: any): string {
        // Color based on survey status
        const status =
            properties.status ||
            properties['35_What_is_the_const'] ||
            'incomplete';

        switch (status.toLowerCase()) {
            case 'complete':
            case 'completed':
            case 'finished':
                return '#4caf50'; // Green
            case 'in progress':
            case 'ongoing':
            case 'in_progress':
                return '#ff9800'; // Orange
            case 'incomplete':
            case 'not started':
            case 'pending':
            default:
                return '#f44336'; // Red
        }
    }

    createSurveyPopupContent(properties: any): string {
        const buildingName =
            properties['5_Building_name'] ||
            properties.building_name ||
            'Unknown Building';
        const status =
            properties.status ||
            properties['35_What_is_the_const'] ||
            'Unknown';
        const owner =
            properties['6_Name_of_the_owner'] ||
            properties.owner_name ||
            'Unknown Owner';

        return `
            <div class="survey-popup-content">
                <h4>${buildingName}</h4>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Owner:</strong> ${owner}</p>
                <p><strong>UUID:</strong> ${
                    properties.ec5_uuid || properties.id
                }</p>
                <button onclick="this.closest('.leaflet-popup').dispatchEvent(new CustomEvent('viewDetails', { detail: '${
                    properties.ec5_uuid || properties.id
                }' }))">
                    View Details
                </button>
            </div>
        `;
    }

    showSurveyDetails(surveyUuid: string): void {
        console.log('Looking for survey with UUID:', surveyUuid);
        console.log(
            'Available survey data count:',
            this.loadedSurveyData.length
        );

        // Log first few survey items to debug UUID format
        if (this.loadedSurveyData.length > 0) {
            console.log(
                'First survey item keys:',
                Object.keys(this.loadedSurveyData[0])
            );
            console.log('First survey UUIDs:', {
                ec5_uuid: this.loadedSurveyData[0].ec5_uuid,
                id: (this.loadedSurveyData[0] as any).id,
                uuid: (this.loadedSurveyData[0] as any).uuid,
            });
        }

        const surveyItem = this.loadedSurveyData.find(
            (item) =>
                item.ec5_uuid === surveyUuid ||
                (item as any).id === surveyUuid ||
                (item as any).uuid === surveyUuid
        );

        if (!surveyItem) {
            console.error('Survey item not found for UUID:', surveyUuid);
            console.log(
                'Available UUIDs:',
                this.loadedSurveyData.map((item) => ({
                    ec5_uuid: item.ec5_uuid,
                    id: (item as any).id,
                    uuid: (item as any).uuid,
                }))
            );

            this.messageService.add({
                severity: 'error',
                summary: 'Survey Not Found',
                detail: `Survey item not found for UUID: ${surveyUuid}. Please check the console for debugging information.`,
                life: 5000,
            });
            return;
        }

        console.log('Found survey item:', surveyItem);

        // Extract photo URIs from survey data
        const photoUris: string[] = [];
        for (const key in surveyItem) {
            if (
                key.includes('photo') ||
                key.includes('image') ||
                key.includes('Picture')
            ) {
                const photoData = surveyItem[key];
                if (typeof photoData === 'string' && photoData.trim()) {
                    photoUris.push(photoData);
                } else if (Array.isArray(photoData)) {
                    photoUris.push(
                        ...photoData.filter(
                            (uri) => typeof uri === 'string' && uri.trim()
                        )
                    );
                }
            }
        }

        // Open EpiCollect survey viewer dialog
        this.ref = this.dialogService.open(EpicollectSurveyViewerComponent, {
            header: `Epi Collect Data - ${
                surveyItem['2_Owners_Name'] ||
                surveyItem['5_Building_name'] ||
                'Unknown Owner'
            }`,

            data: {
                surveyData: surveyItem,
                ec5_uuid: surveyUuid,
                photoUris: photoUris,
                epicollectHelper: this.epicollectHelper,
            },
            maximizable: true,
            resizable: true,
        });

        // Optional: Handle dialog close events
        this.ref.onClose.subscribe((result) => {
            if (result) {
                console.log('Survey dialog closed with result:', result);
                // Handle any updates if needed
                this.renderSurveyDataOnMap();
            }
        });
    }

    clearSurveyData(): void {
        if (this.surveyDataLayer) {
            this.map.removeLayer(this.surveyDataLayer);
        }
        this.loadedSurveyData = [];
        this.isFileLoaded = false;
    }

    /**
     * Handle CSV file selection for building survey data
     */
    onCSVFileSelect(event: any): void {
        const file = event.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csvText = e.target?.result as string;
                    const parsedData = this.parseCSVData(csvText);

                    this.loadedCSVData = parsedData;
                    this.isCSVLoaded = true;

                    console.log(
                        'CSV data loaded:',
                        this.loadedCSVData.length,
                        'items'
                    );
                    console.log('First CSV item:', this.loadedCSVData[0]);

                    // Render CSV data on map
                    this.renderCSVDataOnMap();

                    this.messageService.add({
                        severity: 'success',
                        summary: 'CSV Data Loaded',
                        detail: `Successfully loaded ${this.loadedCSVData.length} building survey points`,
                        life: 3000,
                    });
                } catch (error: any) {
                    console.error('Error parsing CSV data:', error);
                    this.isCSVLoaded = false;

                    this.messageService.add({
                        severity: 'error',
                        summary: 'CSV Loading Error',
                        detail: `Error loading CSV data: ${error.message}`,
                        life: 5000,
                    });
                }
            };
            reader.readAsText(file);
        }
    }

    /**
     * Parse CSV data into BuildingSurveyCSVData format
     */
    private parseCSVData(csvText: string): BuildingSurveyCSVData[] {
        const lines = csvText.split('\n').filter((line) => line.trim());
        if (lines.length < 2) {
            throw new Error(
                'CSV file must have at least a header and one data row'
            );
        }

        // Parse headers
        const headers = lines[0]
            .split(',')
            .map((h) => h.trim().replace(/"/g, ''));
        const data: BuildingSurveyCSVData[] = [];

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) {
                console.warn(
                    `Row ${i + 1} has ${values.length} values but expected ${
                        headers.length
                    }`
                );
                continue;
            }

            const rowData: any = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index];
            });

            // Convert to BuildingSurveyCSVData format
            const buildingData: BuildingSurveyCSVData = {
                slNo: parseInt(rowData['Sl. No.']) || 0,
                uuid: rowData['uuid'] || '',
                createdBy: rowData['createdBy'] || '',
                ownerName: this.parseOptionalString(rowData['ownerName']),
                houseNumber: this.parseOptionalString(rowData['houseNumber']),
                thramNumber: this.parseOptionalString(rowData['thramNumber']),
                contact: this.parseOptionalString(rowData['contact']),
                lat: parseFloat(rowData['lat']) || 0,
                long: parseFloat(rowData['long']) || 0,
                gewog: this.parseOptionalString(rowData['gewog']),
                chiwog: this.parseOptionalString(rowData['chiwog']),
                village: this.parseOptionalString(rowData['village']),
                yearCompleted: this.parseOptionalString(
                    rowData['yearCompleted']
                ),
                constructionYear: this.parseOptionalString(
                    rowData['constructionYear']
                ),
                constructionStatus: this.parseOptionalString(
                    rowData['constructionStatus']
                ),
                use: this.parseOptionalString(rowData['use']),
                remarks: this.parseOptionalString(rowData['remarks']),
                typology: this.parseOptionalString(rowData['typology']),
                remarksTypology: this.parseOptionalString(
                    rowData['remarksTypology']
                ),
                numberOfFloors: this.parseOptionalNumber(
                    rowData['numberOfFloors']
                ),
                storeyHeight: this.parseOptionalNumber(rowData['storeyHeight']),
                length: this.parseOptionalNumber(rowData['length']),
                breadth: this.parseOptionalNumber(rowData['breadth']),
                areaM2: this.parseOptionalNumber(rowData['areaM2']),
                photo1: this.parseOptionalString(rowData['photo1']),
                photo2: this.parseOptionalString(rowData['photo2']),
                photo3: this.parseOptionalString(rowData['photo3']),
                photo4: this.parseOptionalString(rowData['photo4']),
                photo5: this.parseOptionalString(rowData['photo5']),
                photo6: this.parseOptionalString(rowData['photo6']),
                total: this.parseOptionalString(rowData['Total']),
                exteriorFinishes: this.parseOptionalString(
                    rowData['Exterior Finishes']
                ),
                electricalSystem: this.parseOptionalString(
                    rowData['Electrical System']
                ),
                waterSystem: this.parseOptionalString(rowData['Water System']),
                toiletSystem: this.parseOptionalString(
                    rowData['Toilet System']
                ),
                mobileNetwork: this.parseOptionalString(
                    rowData['Mobile Network']
                ),
                floorType: this.parseOptionalString(rowData['Floor Type']),
                othersRemarks: this.parseOptionalString(
                    rowData['Others/Remarks']
                ),
            };

            data.push(buildingData);
        }

        return data;
    }

    /**
     * Parse a CSV line handling quoted values
     */
    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        // Add last field
        result.push(current.trim());
        return result;
    }

    /**
     * Helper to parse optional string fields
     */
    private parseOptionalString(value: string): string | undefined {
        if (!value || value.trim() === '' || value.toUpperCase() === 'NA') {
            return undefined;
        }
        return value.trim();
    }

    /**
     * Helper to parse optional number fields
     */
    private parseOptionalNumber(value: string): number | undefined {
        if (!value || value.trim() === '' || value.toUpperCase() === 'NA') {
            return undefined;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? undefined : parsed;
    }

    /**
     * Render CSV data as points on the map
     */
    renderCSVDataOnMap(): void {
        // Clear existing CSV data layer
        if (this.csvDataLayer) {
            this.map.removeLayer(this.csvDataLayer);
        }

        if (!this.loadedCSVData || this.loadedCSVData.length === 0) {
            return;
        }

        try {
            // Convert CSV data to GeoJSON
            const geoJsonData = this.convertCSVToGeoJSON(this.loadedCSVData);

            // Create layer with custom styling
            this.csvDataLayer = L.geoJSON(geoJsonData, {
                pointToLayer: (feature, latlng) => {
                    const marker = L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: '#ff7800',
                        color: '#000',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8,
                    });

                    // Add label with uuid

                    return marker;
                },
                onEachFeature: (feature, layer) => {
                    // Create popup content
                    const props = feature.properties;
                    const popupContent = this.createCSVPopupContent(props);
                    layer.bindPopup(popupContent, { maxWidth: 400 });
                },
            });

            // Add layer to map
            this.csvDataLayer.addTo(this.map);

            // Fit map to show all CSV points
            if (this.csvDataLayer.getBounds().isValid()) {
                this.map.fitBounds(this.csvDataLayer.getBounds(), {
                    padding: [20, 20],
                });
            }
        } catch (error) {
            console.error('Error rendering CSV data on map:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Map Rendering Error',
                detail: 'Failed to display CSV data on map',
                life: 3000,
            });
        }
    }

    /**
     * Convert CSV data to GeoJSON format
     */
    private convertCSVToGeoJSON(csvData: BuildingSurveyCSVData[]): any {
        return {
            type: 'FeatureCollection',
            features: csvData.map((item) => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [item.long, item.lat],
                },
                properties: item,
            })),
        };
    }

    /**
     * Create popup content for CSV data points
     */
    private createCSVPopupContent(props: BuildingSurveyCSVData): string {
        const getPhotos = () => {
            const photos = [
                props.photo1,
                props.photo2,
                props.photo3,
                props.photo4,
                props.photo5,
                props.photo6,
            ]
                .filter((p) => p && p.trim())
                .map(
                    (p) =>
                        `<img src="${p}" style="width: 80px; height: 60px; object-fit: cover; margin: 2px;" />`
                );
            return photos.length > 0
                ? `<div style="margin-top: 10px;"><strong>Photos:</strong><br/>${photos.join(
                      ''
                  )}</div>`
                : '';
        };

        return `
            <div style="max-width: 350px;">
                <h4 style="margin: 0 0 10px 0; color: #2563eb;">Building Survey Data</h4>
                
                <div style="margin-bottom: 8px;"><strong>UUID:</strong> ${
                    props.uuid
                }</div>
                <div style="margin-bottom: 8px;"><strong>Owner:</strong> ${
                    props.ownerName || 'N/A'
                }</div>
                <div style="margin-bottom: 8px;"><strong>Location:</strong> ${
                    props.village || 'N/A'
                }, ${props.gewog || 'N/A'}</div>
                <div style="margin-bottom: 8px;"><strong>Use:</strong> ${
                    props.use || 'N/A'
                }</div>
                <div style="margin-bottom: 8px;"><strong>Typology:</strong> ${
                    props.typology || 'N/A'
                }</div>
                <div style="margin-bottom: 8px;"><strong>Floors:</strong> ${
                    props.numberOfFloors || 'N/A'
                }</div>
                <div style="margin-bottom: 8px;"><strong>Area:</strong> ${
                    props.areaM2 ? props.areaM2 + ' m²' : 'N/A'
                }</div>
                <div style="margin-bottom: 8px;"><strong>Construction Year:</strong> ${
                    props.constructionYear || 'N/A'
                }</div>
                <div style="margin-bottom: 8px;"><strong>Contact:</strong> ${
                    props.contact || 'N/A'
                }</div>
                
                ${getPhotos()}
                
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    <strong>Coordinates:</strong> ${props.lat.toFixed(
                        6
                    )}, ${props.long.toFixed(6)}
                </div>
            </div>
        `;
    }

    /**
     * Clear CSV data from map
     */
    clearCSVData(): void {
        if (this.csvDataLayer) {
            this.map.removeLayer(this.csvDataLayer);
        }
        this.loadedCSVData = [];
        this.isCSVLoaded = false;

        this.messageService.add({
            severity: 'info',
            summary: 'CSV Data Cleared',
            detail: 'Building survey data has been removed from the map',
            life: 3000,
        });
    }

    /**
     * Export CSV data as GeoJSON
     */
    exportCSVAsGeoJSON(): void {
        if (!this.loadedCSVData || this.loadedCSVData.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Data',
                detail: 'No CSV data to export',
                life: 3000,
            });
            return;
        }

        const geoJsonData = this.convertCSVToGeoJSON(this.loadedCSVData);
        const dataStr = JSON.stringify(geoJsonData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `building-survey-data-${new Date()
            .toISOString()
            .slice(0, 10)}.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        this.messageService.add({
            severity: 'success',
            summary: 'Export Complete',
            detail: 'Building survey data exported as GeoJSON',
            life: 3000,
        });
    }

    exportCurrentSurveyData(): void {
        if (!this.loadedSurveyData || this.loadedSurveyData.length === 0) {
            console.warn('No survey data to export');
            return;
        }

        const geoJsonData = convertSurveyDataToGeoJSON(this.loadedSurveyData);
        const dataStr = JSON.stringify(geoJsonData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `survey-data-${
            new Date().toISOString().split('T')[0]
        }.geojson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    // Drag and Drop functionality for survey points
    private currentDraggedFeature: any = null;
    private currentDraggedLayer: any = null;
    private dropTargetLayer: any = null;

    makeBuildingPointDraggable(layer: any, feature: any): void {
        // Add visual indication that this is draggable
        layer.bindTooltip('Click and drag to move • Double-click for details', {
            permanent: false,
            direction: 'top',
        });

        let isDragging = false;
        let originalLatLng: L.LatLng;

        // Handle single click for drag initiation
        layer.on('mousedown', (e: any) => {
            isDragging = true;
            originalLatLng = layer.getLatLng();
            this.currentDraggedFeature = feature;
            this.currentDraggedLayer = layer;

            // Change cursor and add visual feedback
            this.map.getContainer().style.cursor = 'grabbing';
            layer.setStyle({
                fillColor: '#ff0000',
                fillOpacity: 0.7,
                radius: 8,
            });

            // Prevent map dragging while dragging building
            this.map.dragging.disable();
            this.map.doubleClickZoom.disable();

            e.originalEvent.preventDefault();
        });

        // Handle double-click for viewing details
        layer.on('dblclick', (e: any) => {
            // Prevent drag operation on double-click
            isDragging = false;
            this.map.getContainer().style.cursor = '';
            this.map.dragging.enable();
            this.map.doubleClickZoom.enable();

            // Reset visual feedback
            layer.setStyle({
                fillColor: this.getSurveyPointColor(feature.properties),
                fillOpacity: 0.8,
                radius: 6,
            });

            this.clearDropTargetHighlight();
            this.currentDraggedFeature = null;
            this.currentDraggedLayer = null;

            // Show survey details dialog
            this.showSurveyDetails(
                feature.properties.ec5_uuid || feature.properties.id
            );

            e.originalEvent.preventDefault();
        });

        this.map.on('mousemove', (e: any) => {
            if (isDragging && this.currentDraggedLayer) {
                // Update marker position
                this.currentDraggedLayer.setLatLng(e.latlng);

                // Check for drop targets
                this.highlightDropTarget(e.latlng);
            }
        });

        this.map.on('mouseup', (e: any) => {
            if (isDragging) {
                isDragging = false;
                this.map.getContainer().style.cursor = '';

                // Re-enable map dragging
                this.map.dragging.enable();
                this.map.doubleClickZoom.enable();

                // Handle drop
                this.handleDrop(e.latlng, originalLatLng);

                // Reset visual feedback
                layer.setStyle({
                    fillColor: this.getSurveyPointColor(feature.properties),
                    fillOpacity: 0.8,
                    radius: 6,
                });

                this.clearDropTargetHighlight();
                this.currentDraggedFeature = null;
                this.currentDraggedLayer = null;
            }
        });

        // Mark building polygons as drop targets
        if (this.buildingGeojson) {
            this.buildingGeojson.eachLayer((polygonLayer: any) => {
                this.makePolygonDropTarget(polygonLayer, polygonLayer.feature);
            });
        }
    }

    makePolygonDropTarget(layer: any, feature: any): void {
        // Add data attribute to identify as drop target
        layer.feature = feature;
        layer.isDropTarget = true;
    }

    highlightDropTarget(latlng: L.LatLng): void {
        // Clear previous highlight
        this.clearDropTargetHighlight();

        // Check if point intersects with building polygons
        if (this.buildingGeojson) {
            this.buildingGeojson.eachLayer((layer: any) => {
                if (
                    layer.isDropTarget &&
                    layer.getBounds &&
                    layer.getBounds().contains(latlng)
                ) {
                    // Check if point is actually inside polygon
                    if (this.isPointInPolygon(latlng, layer)) {
                        this.dropTargetLayer = layer;
                        layer.setStyle({
                            fillColor: '#00ff00',
                            fillOpacity: 0.3,
                            weight: 3,
                            color: '#00ff00',
                        });
                    }
                }
            });
        }
    }

    clearDropTargetHighlight(): void {
        if (this.dropTargetLayer) {
            // Reset to original style
            this.dropTargetLayer.setStyle({
                fillColor: 'transparent',
                weight: 3,
                opacity: 1,
                color: this.getPolygonColor(this.dropTargetLayer.feature),
            });
            this.dropTargetLayer = null;
        }
    }

    isPointInPolygon(latlng: L.LatLng, polygonLayer: any): boolean {
        // Use Leaflet's built-in point in polygon check
        const point = this.map.latLngToLayerPoint(latlng);
        const polygon = polygonLayer._parts || polygonLayer._rings;

        if (!polygon || polygon.length === 0) return false;

        // Simple point-in-polygon algorithm
        let inside = false;
        const ring = polygon[0] || polygon;

        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            const xi = ring[i].x,
                yi = ring[i].y;
            const xj = ring[j].x,
                yj = ring[j].y;

            if (
                yi > point.y !== yj > point.y &&
                point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
            ) {
                inside = !inside;
            }
        }

        return inside;
    }

    getPolygonColor(feature: any): string {
        if (!feature || !feature.properties) return 'red';

        if (feature.properties.status === 'SYNCED') {
            return 'green';
        } else if (feature.properties.status === 'COMPLETE') {
            return 'yellow';
        }
        return 'red';
    }

    handleDrop(dropLatLng: L.LatLng, originalLatLng: L.LatLng): void {
        if (!this.currentDraggedFeature || !this.currentDraggedLayer) return;

        if (this.dropTargetLayer) {
            // Successful drop on polygon
            console.log('Building point moved to polygon:', {
                building: this.currentDraggedFeature.properties,
                polygon: this.dropTargetLayer.feature.properties,
                newLocation: dropLatLng,
            });

            // Get survey UUID and building details
            const surveyUuid =
                this.currentDraggedFeature.properties.uuid ||
                this.currentDraggedFeature.properties.id;
            const buildingId = this.dropTargetLayer.feature.properties.id;
            const buildingName =
                this.dropTargetLayer.feature.properties.name || '';
            const buildingAddress =
                this.dropTargetLayer.feature.properties.address || '';

            // Find the survey item to get photo URIs
            const surveyItem: SurveyDataItem = this.loadedSurveyData.find(
                (item) => item.ec5_uuid === surveyUuid
            );
            console.log('suver item', surveyItem);

            // Open confirmation dialog instead of alert
            this.ref = this.dialogService.open(
                SurveyBuildingMappingDialogComponent,
                {
                    header: 'Confirm Survey Point Mapping',

                    data: {
                        surveyUuid: surveyUuid,
                        buildingId: buildingId,
                        buildingName: buildingName,
                        buildingAddress: buildingAddress,
                        surveyDataItem: surveyItem,
                        epicollectHelper: this.epicollectHelper,
                    },
                    maximizable: false,
                    resizable: false,
                    modal: true,
                    closable: false, // Prevent closing without choosing an option
                }
            );

            // Handle dialog result
            this.ref.onClose.subscribe((confirmed: boolean) => {
                if (confirmed) {
                    console.log('User confirmed the mapping');
                    // Update building coordinates in survey data
                    this.updateSurveyLocation(
                        this.currentDraggedFeature.properties.ec5_uuid ||
                            this.currentDraggedFeature.properties.id,
                        dropLatLng
                    );
                } else {
                    console.log(
                        'User cancelled the mapping, reverting position'
                    );
                    // Revert to original position if user cancels
                    this.currentDraggedLayer.setLatLng(originalLatLng);
                }
            });
        } else {
            // Invalid drop, revert to original position
            this.currentDraggedLayer.setLatLng(originalLatLng);
            console.log('Invalid drop location, reverted to original position');
        }
    }

    updateSurveyLocation(surveyId: string, newLocation: L.LatLng): void {
        // Update the survey data with new coordinates
        const surveyItem = this.loadedSurveyData.find(
            (item) => item.ec5_uuid === surveyId
        );

        if (surveyItem) {
            // Update coordinates based on the existing structure
            if (
                surveyItem['8_Location_Lat_Long'] &&
                typeof surveyItem['8_Location_Lat_Long'] === 'object'
            ) {
                // EpiCollect nested format
                surveyItem['8_Location_Lat_Long'].latitude = newLocation.lat;
                surveyItem['8_Location_Lat_Long'].longitude = newLocation.lng;
            }

            console.log(`Updated survey ${surveyId} location to:`, newLocation);
        }
    }

    showBuildingDetails(building: any): void {
        // Open building details dialog instead of alert
        this.ref = this.dialogService.open(BuildingDetailsDialogComponent, {
            header: `Building Details - ${
                building.name || building.id || 'Unknown'
            }`,

            data: {
                building: building,
            },
            maximizable: false,
            resizable: true,
            modal: true,
        });

        // Optional: Handle dialog close
        this.ref.onClose.subscribe((result) => {
            // Handle any actions if needed when dialog closes
            console.log('Building details dialog closed');
        });
    }

    /**
     * Download cleaned building footprint as GeoJSON
     */
    downloadCleanedBuildingFootprintGeoJSON(): void {
        if (!this.cleanedBuildingsLayer || this.cleanedBuildings.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Data',
                detail: 'No cleaned building footprints available to download.',
            });
            return;
        }

        try {
            // Convert cleaned buildings to GeoJSON
            const geojsonData = this.convertBuildingsToGeoJSON(
                this.cleanedBuildings
            );

            // Create filename with timestamp
            const timestamp = new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/[:.]/g, '-');
            const filename = `cleaned-building-footprints-${
                this.selectedDzongkhag?.name || 'data'
            }-${timestamp}.geojson`;

            // Convert to JSON string and download
            const dataStr = JSON.stringify(geojsonData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            this.messageService.add({
                severity: 'success',
                summary: 'Download Complete',
                detail: `${this.cleanedBuildings.length} cleaned building footprints downloaded as ${filename}`,
            });
        } catch (error) {
            console.error(
                'Error downloading cleaned building footprints:',
                error
            );
            this.messageService.add({
                severity: 'error',
                summary: 'Download Failed',
                detail: 'Failed to download cleaned building footprints.',
            });
        }
    }

    /**
     * Download uncleaned building footprint as GeoJSON
     */
    downloadUncleanedBuildingFootprintGeoJSON(): void {
        if (
            !this.uncleanedBuildingsLayer ||
            this.uncleanedBuildings.length === 0
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Data',
                detail: 'No uncleaned building footprints available to download.',
            });
            return;
        }

        try {
            // Convert uncleaned buildings to GeoJSON
            const geojsonData = this.convertBuildingsToGeoJSON(
                this.uncleanedBuildings
            );

            // Create filename with timestamp
            const timestamp = new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/[:.]/g, '-');
            const filename = `uncleaned-building-footprints-${
                this.selectedDzongkhag?.name || 'data'
            }-${timestamp}.geojson`;

            // Convert to JSON string and download
            const dataStr = JSON.stringify(geojsonData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            this.messageService.add({
                severity: 'success',
                summary: 'Download Complete',
                detail: `${this.uncleanedBuildings.length} uncleaned building footprints downloaded as ${filename}`,
            });
        } catch (error) {
            console.error(
                'Error downloading uncleaned building footprints:',
                error
            );
            this.messageService.add({
                severity: 'error',
                summary: 'Download Failed',
                detail: 'Failed to download uncleaned building footprints.',
            });
        }
    }

    /**
     * Legacy method - Download building footprint as GeoJSON (backward compatibility)
     * This method combines both cleaned and uncleaned buildings
     */
    downloadBuildingFootprintGeoJSON(): void {
        if (
            (!this.cleanedBuildingsLayer ||
                this.cleanedBuildings.length === 0) &&
            (!this.uncleanedBuildingsLayer ||
                this.uncleanedBuildings.length === 0)
        ) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Data',
                detail: 'No building footprints available to download.',
            });
            return;
        }

        try {
            // Combine both cleaned and uncleaned buildings
            const allBuildings = [
                ...this.cleanedBuildings,
                ...this.uncleanedBuildings,
            ];
            const geojsonData = this.convertBuildingsToGeoJSON(allBuildings);

            // Create filename with timestamp
            const timestamp = new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/[:.]/g, '-');
            const filename = `all-building-footprints-${
                this.selectedDzongkhag?.name || 'data'
            }-${timestamp}.geojson`;

            // Convert to JSON string and download
            const dataStr = JSON.stringify(geojsonData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            this.messageService.add({
                severity: 'success',
                summary: 'Download Complete',
                detail: `${allBuildings.length} building footprints downloaded as ${filename}`,
            });
        } catch (error) {
            console.error('Error downloading building footprints:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Download Failed',
                detail: 'Failed to download building footprints.',
            });
        }
    }

    /**
     * Locate and fly to a survey point by UUID
     */
    locateSurveyByUuid(): void {
        if (!this.locateUuid || !this.isFileLoaded || !this.surveyDataLayer) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Invalid Input',
                detail: 'Please enter a valid UUID and ensure survey data is loaded.',
            });
            return;
        }

        const uuid = this.locateUuid.trim();
        let foundFeature: any = null;
        let foundLayer: any = null;

        // Search through survey data layer
        this.surveyDataLayer.eachLayer((layer: any) => {
            const feature = layer.feature;
            if (feature && feature.properties) {
                const props = feature.properties;
                if (
                    props.ec5_uuid === uuid ||
                    props.id === uuid ||
                    props.uuid === uuid
                ) {
                    foundFeature = feature;
                    foundLayer = layer;
                    return;
                }
            }
        });

        if (foundFeature && foundLayer) {
            // Get coordinates
            const coords = foundFeature.geometry.coordinates;
            const latLng = L.latLng(coords[1], coords[0]); // GeoJSON is [lng, lat]

            // Fly to the location
            this.map.flyTo(latLng, 18, {
                duration: 2,
                easeLinearity: 0.5,
            });

            // Highlight the point temporarily
            if (foundLayer.setStyle) {
                const originalStyle = foundLayer.options;
                foundLayer.setStyle({
                    color: '#ff0000',
                    fillColor: '#ff0000',
                    radius: 12,
                    weight: 3,
                });

                // Reset style after 3 seconds
                setTimeout(() => {
                    foundLayer.setStyle(originalStyle);
                }, 3000);
            }

            // Open popup if it exists
            if (foundLayer.getPopup()) {
                foundLayer.openPopup();
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Survey Point Found',
                detail: `Located survey point: ${uuid}`,
            });

            // Clear the input
            this.locateUuid = '';
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Not Found',
                detail: `Survey point with UUID "${uuid}" not found in loaded data.`,
            });
        }
    }

    /**
     * Locate and fly to a building by ID
     */
    locateBuildingById(): void {
        if (!this.locateBuildingId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Invalid Input',
                detail: 'Please enter a valid building ID.',
            });
            return;
        }

        if (!this.cleanedBuildingsLayer && !this.uncleanedBuildingsLayer) {
            this.messageService.add({
                severity: 'warn',
                summary: 'No Data',
                detail: 'Please load building data first.',
            });
            return;
        }

        const buildingId = this.locateBuildingId;
        let foundFeature: any = null;
        let foundLayer: any = null;
        let buildingType: string = '';

        // Search through cleaned buildings first
        if (this.cleanedBuildingsLayer) {
            this.cleanedBuildingsLayer.eachLayer((layer: any) => {
                const feature = layer.feature;
                if (feature && feature.properties) {
                    const props = feature.properties;
                    if (
                        props.id === buildingId ||
                        props.building_id === buildingId ||
                        props.buildingId === buildingId ||
                        parseInt(props.id) === buildingId
                    ) {
                        foundFeature = feature;
                        foundLayer = layer;
                        buildingType = 'cleaned';
                        return;
                    }
                }
            });
        }

        // If not found in cleaned buildings, search uncleaned buildings
        if (!foundFeature && this.uncleanedBuildingsLayer) {
            this.uncleanedBuildingsLayer.eachLayer((layer: any) => {
                const feature = layer.feature;
                if (feature && feature.properties) {
                    const props = feature.properties;
                    if (
                        props.id === buildingId ||
                        props.building_id === buildingId ||
                        props.buildingId === buildingId ||
                        parseInt(props.id) === buildingId
                    ) {
                        foundFeature = feature;
                        foundLayer = layer;
                        buildingType = 'uncleaned';
                        return;
                    }
                }
            });
        }

        if (foundFeature && foundLayer) {
            // Get bounds of the building polygon
            const bounds = foundLayer.getBounds();

            // Fly to the building
            this.map.flyToBounds(bounds, {
                padding: [50, 50],
                maxZoom: 18,
                duration: 2,
            });

            // Highlight the building with cyan color
            if (foundLayer.setStyle) {
                const originalStyle = foundLayer.options;
                foundLayer.setStyle({
                    color: '#00FFFF', // Cyan color
                    weight: 4,
                    fillColor: '#00FFFF', // Cyan fill
                    fillOpacity: 0.4,
                });

                // Reset style after 5 seconds
                setTimeout(() => {
                    foundLayer.setStyle(originalStyle);
                }, 5000);
            }

            // Open popup if it exists
            if (foundLayer.getPopup()) {
                foundLayer.openPopup();
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Building Found',
                detail: `Located ${buildingType} building ID: ${buildingId}`,
            });

            // Clear the input
            this.locateBuildingId = null;
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Not Found',
                detail: `Building with ID "${buildingId}" not found in loaded data.`,
            });
        }
    }
}
