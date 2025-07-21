import {
    EpiCollectHelper,
    EpiCollectImage,
    injectEpiCollectStyles,
} from '../epi-collect-helpers/epicollect.helper';

export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    UTM_Northing: number;
    UTM_Easting: number;
    UTM_Zone: string;
}

export interface SurveyDataItem {
    ec5_uuid: string;
    created_at: string;
    uploaded_at: string;
    created_by: string;
    title: string;
    '2_Owners_Name': string;
    '3_CID_No': number;
    '4_House_No': string;
    '5_Tharm_No': string;
    '6_Contact_No': string;
    '8_Location_Lat_Long': LocationCoordinates;
    '9_Gewog': string;
    '10_Chiwog': string;
    '11_Village': string;
    '13_Construction_comp': string;
    '14_Approximately': string[];
    '15_Under_Constructio': string[];
    '17_Use_Type': string[];
    '18_OthersRemarks': string;
    '20_No_of_stories': number;
    '21_Length_of_Buildin': string;
    '22_Breadth_of_Buildi': string;
    '24_Male_Age_13__60': string;
    '25_Male_Age_above_60': string;
    '26_Female_Age_13__60': string;
    '27_Female_Age_above_': string;
    '28_Children_Age_less': string;
    '29_Approximate_Total': string;
    '31_Exterior_Finishes': string;
    '32_Electrical_System': string;
    '33_Water_System': string;
    '34_Toilet_System': string;
    '35_Mobile_Network': string;
    '36_Any_specific_obse': string;
    '38_Typology': string;
    '39_OthersRemarks': string;
    '40_Sketch_a_plan_of_': string;
    '41_Front_side_photo_': string;
    '42_Left_side_photo_o': string;
    '43_Back_side_photo_o': string;
    '44_Right_side_photo_': string;
    '45_Photo_of_any_spec': string;
    '46_Photo_of_any_spec': string;
}

export interface SurveyDataResponse {
    data: SurveyDataItem[];
}

// Optional: More readable interface with better property names
export interface BuildingSurveyData {
    uuid: string;
    createdAt: string;
    uploadedAt: string;
    createdBy: string;
    title: string;
    ownerName: string;
    cidNumber: number;
    houseNumber: string;
    tharmNumber: string;
    contactNumber: string;
    location: LocationCoordinates;
    gewog: string;
    chiwog: string;
    village: string;
    constructionCompletion: string;
    approximateAge: string[];
    underConstruction: string[];
    useType: string[];
    useTypeRemarks: string;
    numberOfStories: number;
    buildingLength: string;
    buildingBreadth: string;
    maleAge13To60: string;
    maleAgeAbove60: string;
    femaleAge13To60: string;
    femaleAgeAbove60: string;
    childrenAgeLess13: string;
    approximateTotal: string;
    exteriorFinishes: string;
    electricalSystem: string;
    waterSystem: string;
    toiletSystem: string;
    mobileNetwork: string;
    specificObservations: string;
    typology: string;
    typologyRemarks: string;
    sketchPlanPhoto: string;
    frontSidePhoto: string;
    leftSidePhoto: string;
    backSidePhoto: string;
    rightSidePhoto: string;
    specialPhoto1: string;
    specialPhoto2: string;
}

// Utility function to convert from API format to readable format
export function convertSurveyData(apiData: SurveyDataItem): BuildingSurveyData {
    return {
        uuid: apiData.ec5_uuid,
        createdAt: apiData.created_at,
        uploadedAt: apiData.uploaded_at,
        createdBy: apiData.created_by,
        title: apiData.title,
        ownerName: apiData['2_Owners_Name'],
        cidNumber: apiData['3_CID_No'],
        houseNumber: apiData['4_House_No'],
        tharmNumber: apiData['5_Tharm_No'],
        contactNumber: apiData['6_Contact_No'],
        location: apiData['8_Location_Lat_Long'],
        gewog: apiData['9_Gewog'],
        chiwog: apiData['10_Chiwog'],
        village: apiData['11_Village'],
        constructionCompletion: apiData['13_Construction_comp'],
        approximateAge: apiData['14_Approximately'],
        underConstruction: apiData['15_Under_Constructio'],
        useType: apiData['17_Use_Type'],
        useTypeRemarks: apiData['18_OthersRemarks'],
        numberOfStories: apiData['20_No_of_stories'],
        buildingLength: apiData['21_Length_of_Buildin'],
        buildingBreadth: apiData['22_Breadth_of_Buildi'],
        maleAge13To60: apiData['24_Male_Age_13__60'],
        maleAgeAbove60: apiData['25_Male_Age_above_60'],
        femaleAge13To60: apiData['26_Female_Age_13__60'],
        femaleAgeAbove60: apiData['27_Female_Age_above_'],
        childrenAgeLess13: apiData['28_Children_Age_less'],
        approximateTotal: apiData['29_Approximate_Total'],
        exteriorFinishes: apiData['31_Exterior_Finishes'],
        electricalSystem: apiData['32_Electrical_System'],
        waterSystem: apiData['33_Water_System'],
        toiletSystem: apiData['34_Toilet_System'],
        mobileNetwork: apiData['35_Mobile_Network'],
        specificObservations: apiData['36_Any_specific_obse'],
        typology: apiData['38_Typology'],
        typologyRemarks: apiData['39_OthersRemarks'],
        sketchPlanPhoto: apiData['40_Sketch_a_plan_of_'],
        frontSidePhoto: apiData['41_Front_side_photo_'],
        leftSidePhoto: apiData['42_Left_side_photo_o'],
        backSidePhoto: apiData['43_Back_side_photo_o'],
        rightSidePhoto: apiData['44_Right_side_photo_'],
        specialPhoto1: apiData['45_Photo_of_any_spec'],
        specialPhoto2: apiData['46_Photo_of_any_spec'],
    };
}

// GeoJSON interfaces
export interface GeoJSONFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    properties: any;
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

// Function to convert SurveyDataItem array to GeoJSON
export function convertSurveyDataToGeoJSON(
    surveyData: SurveyDataItem[]
): GeoJSONFeatureCollection {
    const features: GeoJSONFeature[] = surveyData
        .filter(
            (item) =>
                item['8_Location_Lat_Long'] &&
                item['8_Location_Lat_Long'].latitude &&
                item['8_Location_Lat_Long'].longitude
        )
        .map((item) => {
            const location = item['8_Location_Lat_Long'];

            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude],
                },
                properties: {
                    // Core identification
                    uuid: item.ec5_uuid,
                    title: item.title,
                    createdAt: item.created_at,
                    createdBy: item.created_by,

                    // Owner information
                    ownerName: item['2_Owners_Name'],
                    cidNumber: item['3_CID_No'],
                    houseNumber: item['4_House_No'],
                    tharmNumber: item['5_Tharm_No'],
                    contactNumber: item['6_Contact_No'],

                    // Location details
                    gewog: item['9_Gewog'],
                    chiwog: item['10_Chiwog'],
                    village: item['11_Village'],
                    locationAccuracy: location.accuracy,
                    utmNorthing: location.UTM_Northing,
                    utmEasting: location.UTM_Easting,
                    utmZone: location.UTM_Zone,

                    // Building characteristics
                    constructionCompletion: item['13_Construction_comp'],
                    approximateAge: item['14_Approximately'],
                    underConstruction: item['15_Under_Constructio'],
                    useType: item['17_Use_Type'],
                    useTypeRemarks: item['18_OthersRemarks'],
                    numberOfStories: item['20_No_of_stories'],
                    buildingLength: item['21_Length_of_Buildin'],
                    buildingBreadth: item['22_Breadth_of_Buildi'],

                    // Demographics
                    maleAge13To60: item['24_Male_Age_13__60'],
                    maleAgeAbove60: item['25_Male_Age_above_60'],
                    femaleAge13To60: item['26_Female_Age_13__60'],
                    femaleAgeAbove60: item['27_Female_Age_above_'],
                    childrenAgeLess13: item['28_Children_Age_less'],
                    approximateTotal: item['29_Approximate_Total'],

                    // Infrastructure
                    exteriorFinishes: item['31_Exterior_Finishes'],
                    electricalSystem: item['32_Electrical_System'],
                    waterSystem: item['33_Water_System'],
                    toiletSystem: item['34_Toilet_System'],
                    mobileNetwork: item['35_Mobile_Network'],

                    // Additional information
                    specificObservations: item['36_Any_specific_obse'],
                    typology: item['38_Typology'],
                    typologyRemarks: item['39_OthersRemarks'],

                    // Photos
                    sketchPlanPhoto: item['40_Sketch_a_plan_of_'],
                    frontSidePhoto: item['41_Front_side_photo_'],
                    leftSidePhoto: item['42_Left_side_photo_o'],
                    backSidePhoto: item['43_Back_side_photo_o'],
                    rightSidePhoto: item['44_Right_side_photo_'],
                    specialPhoto1: item['45_Photo_of_any_spec'],
                    specialPhoto2: item['46_Photo_of_any_spec'],
                },
            };
        });

    return {
        type: 'FeatureCollection',
        features: features,
    };
}

// Function to export GeoJSON as downloadable file
export function exportGeoJSONFile(
    geoJson: GeoJSONFeatureCollection,
    filename: string = 'survey-data.geojson'
): void {
    const dataStr = JSON.stringify(geoJson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/geo+json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Function to export as regular JSON file
export function exportJSONFile(
    data: SurveyDataItem[],
    filename: string = 'survey-data.json'
): void {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Function to read and parse JSON file with SurveyDataResponse structure
export function loadSurveyDataFromFile(file: File): Promise<SurveyDataItem[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const jsonString = event.target?.result as string;
                const parsedData = JSON.parse(jsonString);

                // Check if the parsed data has the expected structure
                if (parsedData && typeof parsedData === 'object') {
                    // If it has a 'data' property (SurveyDataResponse structure)
                    if (parsedData.data && Array.isArray(parsedData.data)) {
                        resolve(parsedData.data as SurveyDataItem[]);
                    }
                    // If it's directly an array of SurveyDataItem
                    else if (Array.isArray(parsedData)) {
                        resolve(parsedData as SurveyDataItem[]);
                    }
                    // If it's a single SurveyDataItem, wrap it in an array
                    else if (parsedData.ec5_uuid) {
                        resolve([parsedData as SurveyDataItem]);
                    } else {
                        reject(
                            new Error(
                                'Invalid JSON structure. Expected object with "data" property containing array of SurveyDataItem, or direct array of SurveyDataItem.'
                            )
                        );
                    }
                } else {
                    reject(new Error('Invalid JSON format.'));
                }
            } catch (error) {
                reject(new Error(`Failed to parse JSON: ${error}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file.'));
        };

        reader.readAsText(file);
    });
}

// Function to convert JSON file to GeoJSON
export async function convertJSONFileToGeoJSON(
    file: File
): Promise<GeoJSONFeatureCollection> {
    try {
        const surveyData = await loadSurveyDataFromFile(file);
        return convertSurveyDataToGeoJSON(surveyData);
    } catch (error) {
        throw new Error(`Failed to convert JSON file to GeoJSON: ${error}`);
    }
}

// Function to handle file input and export as GeoJSON
export async function processFileAndExportGeoJSON(
    file: File,
    outputFilename: string = 'converted-survey-data.geojson'
): Promise<void> {
    try {
        const geoJson = await convertJSONFileToGeoJSON(file);
        exportGeoJSONFile(geoJson, outputFilename);
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
}

// GeoJSON Data Loader Interface
export interface GeoJSONDataLoader {
    loadFile(file: File): Promise<GeoJSONFeatureCollection>;
    loadFromUrl(url: string): Promise<GeoJSONFeatureCollection>;
    renderOnMap(geoJson: GeoJSONFeatureCollection, map: any): any; // returns Leaflet layer
}

// Implementation of the GeoJSON Data Loader
export class SurveyDataGeoJSONLoader implements GeoJSONDataLoader {
    private epicollectHelper?: EpiCollectHelper;
    private onSurveyPointClick?: (uuid: string) => void;
    private surveyData: SurveyDataItem[] = [];

    constructor(
        epicollectHelper?: EpiCollectHelper,
        onSurveyPointClick?: (uuid: string) => void
    ) {
        this.epicollectHelper = epicollectHelper;
        this.onSurveyPointClick = onSurveyPointClick;
        // Inject styles for image gallery
        injectEpiCollectStyles();
    }

    async loadFile(file: File): Promise<GeoJSONFeatureCollection> {
        return await convertJSONFileToGeoJSON(file);
    }

    async loadFromUrl(url: string): Promise<GeoJSONFeatureCollection> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();

            // Handle different JSON structures
            let surveyData: SurveyDataItem[];
            if (jsonData.data && Array.isArray(jsonData.data)) {
                surveyData = jsonData.data as SurveyDataItem[];
            } else if (Array.isArray(jsonData)) {
                surveyData = jsonData as SurveyDataItem[];
            } else if (jsonData.ec5_uuid) {
                surveyData = [jsonData as SurveyDataItem];
            } else {
                throw new Error('Invalid JSON structure from URL');
            }

            return convertSurveyDataToGeoJSON(surveyData);
        } catch (error) {
            throw new Error(`Failed to load data from URL: ${error}`);
        }
    }

    renderOnMap(geoJson: GeoJSONFeatureCollection, map: any): any {
        // Import Leaflet dynamically to avoid circular dependencies
        const L = (window as any).L;

        if (!L) {
            throw new Error('Leaflet is not available');
        }

        return L.geoJSON(geoJson, {
            pointToLayer: (feature: any, latlng: any) => {
                // Create custom markers for survey points
                const marker = L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: this.getMarkerColor(feature.properties),
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8,
                });

                return marker;
            },
            onEachFeature: (feature: any, layer: any) => {
                // Create simple popup with basic info and view details button
                // const popupContent = `
                //     <div class="survey-popup-content">
                //         <h4>${feature.properties.title || 'Survey Point'}</h4>
                //         <div class="popup-section">
                //             <strong>Owner:</strong> ${
                //                 feature.properties.ownerName || 'N/A'
                //             }<br>
                //             <strong>Location:</strong> ${
                //                 feature.properties.gewog || 'N/A'
                //             }, ${feature.properties.village || 'N/A'}<br>
                //             <strong>Status:</strong> ${
                //                 feature.properties.constructionCompletion ||
                //                 'N/A'
                //             }
                //         </div>
                //         <div class="popup-actions">
                //             <button class="view-details-btn" onclick="window.surveyDataLoader.handleSurveyClick('${
                //                 feature.properties.uuid
                //             }')">
                //                 <i class="pi pi-eye"></i> View Full Details
                //             </button>
                //         </div>
                //     </div>
                // `;

                // layer.bindPopup(popupContent, {
                //     maxWidth: 300,
                //     className: 'survey-popup',
                // });

                // Add click event to open dialog directly
                layer.on('click', () => {
                    if (this.onSurveyPointClick) {
                        this.onSurveyPointClick(feature.properties.uuid);
                    }
                });
            },
        }).addTo(map);
    }

    private getMarkerColor(properties: any): string {
        // Color code based on construction completion status
        if (properties.constructionCompletion === 'Complete') {
            return '#4CAF50'; // Green
        } else if (properties.constructionCompletion === 'Under Construction') {
            return '#FF9800'; // Orange
        } else if (properties.constructionCompletion === 'Planned') {
            return '#2196F3'; // Blue
        } else {
            return '#F44336'; // Red for unknown/incomplete
        }
    }

    private createPopupContent(properties: any): string {
        const hasImages = this.hasImageData(properties);
        const imageSection =
            hasImages && this.epicollectHelper
                ? `
            <div class="popup-section">
                <strong>Images:</strong><br>
                <button class="load-images-btn" onclick="window.surveyDataLoader.loadImagesForSurvey('${properties.uuid}')">
                    <i class="pi pi-image"></i> Load Images
                </button>
                <div id="images-${properties.uuid}" class="images-container" style="display: none;">
                    <div class="loading">Loading images...</div>
                </div>
            </div>
        `
                : '';

        return `
            <div class="survey-popup-content">
                <h4>${properties.title || 'Survey Point'}</h4>
                <div class="popup-section">
                    <strong>Owner:</strong> ${properties.ownerName || 'N/A'}<br>
                    <strong>House No:</strong> ${
                        properties.houseNumber || 'N/A'
                    }<br>
                    <strong>Contact:</strong> ${
                        properties.contactNumber || 'N/A'
                    }
                </div>
                <div class="popup-section">
                    <strong>Location:</strong><br>
                    Gewog: ${properties.gewog || 'N/A'}<br>
                    Chiwog: ${properties.chiwog || 'N/A'}<br>
                    Village: ${properties.village || 'N/A'}
                </div>
                <div class="popup-section">
                    <strong>Building Info:</strong><br>
                    Stories: ${properties.numberOfStories || 'N/A'}<br>
                    Use Type: ${
                        properties.useType
                            ? properties.useType.join(', ')
                            : 'N/A'
                    }<br>
                    Status: ${properties.constructionCompletion || 'N/A'}
                </div>
                <div class="popup-section">
                    <strong>Demographics:</strong><br>
                    Total Residents: ${properties.approximateTotal || 'N/A'}
                </div>
                ${imageSection}
            </div>
        `;
    }

    private hasImageData(properties: any): boolean {
        const imageFields = [
            'sketchPlanPhoto',
            'frontSidePhoto',
            'leftSidePhoto',
            'backSidePhoto',
            'rightSidePhoto',
            'specialPhoto1',
            'specialPhoto2',
        ];
        return imageFields.some(
            (field) => properties[field] && properties[field].trim() !== ''
        );
    }

    async loadImagesForSurvey(uuid: string): Promise<void> {
        if (!this.epicollectHelper) {
            console.error('EpiCollect helper not available');
            return;
        }

        const container = document.getElementById(`images-${uuid}`);
        if (!container) return;

        container.style.display = 'block';
        container.innerHTML = '<div class="loading">Loading images...</div>';

        try {
            // Find the survey item by UUID
            const surveyItem = this.findSurveyItemByUuid(uuid);
            if (!surveyItem) {
                container.innerHTML =
                    '<div class="error">Survey data not found</div>';
                return;
            }

            // Download images
            const images = await this.epicollectHelper.downloadSurveyImages(
                surveyItem
            );

            if (images.length === 0) {
                container.innerHTML =
                    '<div class="no-images">No images available</div>';
                return;
            }

            // Create image gallery
            const gallery = this.epicollectHelper.createImageGallery(
                images,
                `gallery-${uuid}`
            );
            container.innerHTML = '';
            container.appendChild(gallery);
        } catch (error) {
            console.error('Error loading images:', error);
            container.innerHTML =
                '<div class="error">Failed to load images</div>';
        }
    }

    private findSurveyItemByUuid(uuid: string): SurveyDataItem | null {
        const currentData = (this as any).currentSurveyData as SurveyDataItem[];
        return currentData?.find((item) => item.ec5_uuid === uuid) || null;
    }

    // Method to set the current survey data for image loading
    setSurveyData(surveyData: SurveyDataItem[]): void {
        (this as any).currentSurveyData = surveyData;
    }

    setClickCallback(callback: (uuid: string) => void): void {
        this.onSurveyPointClick = callback;
    }

    handleSurveyClick(uuid: string): void {
        if (this.onSurveyPointClick) {
            this.onSurveyPointClick(uuid);
        }
    }
}

// Utility function to create a data loader instance
export function createSurveyDataLoader(
    epicollectHelper?: EpiCollectHelper
): SurveyDataGeoJSONLoader {
    const loader = new SurveyDataGeoJSONLoader(epicollectHelper);

    // Make it globally accessible for button callbacks
    (window as any).surveyDataLoader = loader;

    return loader;
}

// Utility function to create EpiCollect-enabled data loader
export function createSurveyDataLoaderWithImages(
    projectSlug: string,
    authToken: string,
    cookies?: string
): SurveyDataGeoJSONLoader {
    const epicollectHelper = new EpiCollectHelper({
        baseUrl: 'https://five.epicollect.net',
        projectSlug,
        authToken,
        cookies,
    });

    return createSurveyDataLoader(epicollectHelper);
}
