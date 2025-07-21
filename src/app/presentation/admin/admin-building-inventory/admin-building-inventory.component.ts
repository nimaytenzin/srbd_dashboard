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
    plotsGeojson!: L.GeoJSON;
    boundary = {} as L.GeoJSON;

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
        // Check if we have selected administrative zone
        if (!this.selectedAdministrativeZone?.id) {
            console.warn('No administrative zone selected');
            return;
        }

        // Load buildings by administrative zone (gewog)
        this.buildingDataService
            .GetBuildingsWithoutImagesByGewog(
                this.selectedAdministrativeZone.id
            )
            .subscribe({
                next: (buildings: BuildingWithGeom[]) => {
                    console.log('Loaded buildings:', buildings);

                    const buildingsWithoutImageGeojson =
                        this.convertBuildingsToGeoJSON(buildings);

                    // Clear existing building layer if it exists
                    if (this.buildingGeojson) {
                        this.map.removeLayer(this.buildingGeojson);
                    }

                    console.log(
                        'buidlign without image',
                        buildingsWithoutImageGeojson
                    );
                    // Render buildings on map with red outline and transparent background
                    this.buildingGeojson = L.geoJSON(
                        buildingsWithoutImageGeojson,
                        {
                            style: function (feature) {
                                const hasImages =
                                    feature.properties.buildingImages &&
                                    feature.properties.buildingImages.length >
                                        0;
                                return {
                                    fillColor: 'transparent',
                                    weight: 2,
                                    opacity: 1,
                                    color: hasImages ? 'yellow' : 'red',
                                    fillOpacity: 0,
                                };
                            },
                            onEachFeature: (feature, layer) => {
                                layer.on({
                                    click: (e: any) => {
                                        this.showBuildingDetails(
                                            feature.properties
                                        );
                                    },
                                });
                            },
                        }
                    ).addTo(this.map);

                    // Fit map to building bounds if there are buildings
                    if (buildings.length > 0) {
                        this.fitMapBounds();
                    }
                },
                error: (error) => {
                    console.error('Error loading buildings:', error);
                },
            });
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

    // loadPlotsAndBuildings() {
    //     this.geometryDataService
    //         .GetBuildingFootprintsBySubAdministrativeBoundary(
    //             this.selectedSubAdministrativeZone.id
    //         )
    //         .subscribe((res: any) => {
    //             this.buildingGeojson = L.geoJSON(res, {
    //                 style: function (feature) {
    //                     return {
    //                         fillColor: 'transparent',
    //                         weight: 3,
    //                         opacity: 1,
    //                         color: 'white',
    //                     };
    //                 },
    //                 onEachFeature: (feature, layer) => {
    //                     layer.on({
    //                         click: (e: any) => {
    //                             console.log('lskdjf;alksjdflkj', feature);
    //                             this.showBuilding(
    //                                 feature.properties.buildingid,
    //                                 feature.properties.id_0
    //                             );
    //                         },
    //                     });
    //                 },
    //             }).addTo(this.map);
    //         });

    //     // this.fitMapBounds();
    //     // this.clearMapState();
    //     // this.geometryDataService
    //     //     .GetSubAdministrativeBoundary(this.selectedSubAdministrativeZone.id)
    //     //     .subscribe((res: any) => {
    //     //         this.boundary = L.geoJSON(res, {
    //     //             style: function (feature) {
    //     //                 return {
    //     //                     fillColor: 'transparent',
    //     //                     weight: 3,
    //     //                     opacity: 1,
    //     //                     color: 'yellow',
    //     //                 };
    //     //             },
    //     //         });

    //     //         this.geometryDataService
    //     //             .GetPlotsGeomBySubAdministrativeBoundary(
    //     //                 this.selectedSubAdministrativeZone.id
    //     //             )
    //     //             .subscribe((res: any) => {
    //     //                 this.plotsGeojson = L.geoJSON(res, {
    //     //                     style: function (feature) {
    //     //                         return {
    //     //                             fillColor: 'transparent',
    //     //                             weight: 1,
    //     //                             opacity: 1,
    //     //                             color: 'red',
    //     //                         };
    //     //                     },
    //     //                 }).addTo(this.map);

    //     //                 this.geometryDataService
    //     //                     .GetBuildingFootprintsBySubAdministrativeBoundary(
    //     //                         this.selectedSubAdministrativeZone.id
    //     //                     )
    //     //                     .subscribe((res: any) => {
    //     //                         this.buildingGeojson = L.geoJSON(res, {
    //     //                             style: function (feature) {
    //     //                                 return {
    //     //                                     fillColor: 'transparent',
    //     //                                     weight: 3,
    //     //                                     opacity: 1,
    //     //                                     color: 'white',
    //     //                                 };
    //     //                             },
    //     //                             onEachFeature: (feature, layer) => {
    //     //                                 layer.on({
    //     //                                     click: (e: any) => {
    //     //                                         console.log(
    //     //                                             'lskdjf;alksjdflkj',
    //     //                                             feature
    //     //                                         );
    //     //                                         this.showBuilding(
    //     //                                             feature.properties
    //     //                                                 .buildingid,
    //     //                                             feature.properties.id_0
    //     //                                         );
    //     //                                     },
    //     //                                 });
    //     //                             },
    //     //                         }).addTo(this.map);
    //     //                     });

    //     //                 this.fitMapBounds();
    //     //             });
    //     //     });
    // }
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
}
