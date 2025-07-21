import { SurveyDataItem } from '../data/survey-data.dto';

// EpiCollect API Configuration
export interface EpiCollectConfig {
    baseUrl: string;
    projectSlug: string;
    authToken: string;
    cookies?: string;
}

// Image download and rendering interface
export interface EpiCollectImage {
    filename: string;
    url: string;
    blob?: Blob;
    dataUrl?: string;
    type: 'photo' | 'sketch';
    fieldName: string;
}

// EpiCollect Helper Class
export class EpiCollectHelper {
    private config: EpiCollectConfig;
    private imageCache = new Map<string, EpiCollectImage>();

    constructor(config: EpiCollectConfig) {
        this.config = config;
    }

    /**
     * Downloads an image from EpiCollect API
     */
    async downloadImage(
        filename: string,
        type: 'photo' | 'sketch' = 'photo'
    ): Promise<EpiCollectImage> {
        // Check cache first
        if (this.imageCache.has(filename)) {
            return this.imageCache.get(filename)!;
        }

        const headers = new Headers();
        headers.append('Authorization', this.config.authToken);

        if (this.config.cookies) {
            headers.append('Cookie', this.config.cookies);
        }

        const requestOptions: RequestInit = {
            method: 'GET',
            headers: headers,
            redirect: 'follow',
        };

        const url = `${this.config.baseUrl}/api/export/media/${this.config.projectSlug}?type=${type}&format=entry_original&name=${filename}`;

        try {
            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const dataUrl = await this.blobToDataUrl(blob);

            const imageData: EpiCollectImage = {
                filename,
                url,
                blob,
                dataUrl,
                type,
                fieldName: '',
            };

            // Cache the image
            this.imageCache.set(filename, imageData);

            return imageData;
        } catch (error) {
            console.error(`Error downloading image ${filename}:`, error);
            throw error;
        }
    }

    /**
     * Downloads multiple images for a survey item
     */
    async downloadSurveyImages(
        surveyItem: SurveyDataItem
    ): Promise<EpiCollectImage[]> {
        const imageFields = [
            {
                field: '40_Sketch_a_plan_of_',
                type: 'sketch' as const,
                name: 'Sketch Plan',
            },
            {
                field: '41_Front_side_photo_',
                type: 'photo' as const,
                name: 'Front Side',
            },
            {
                field: '42_Left_side_photo_o',
                type: 'photo' as const,
                name: 'Left Side',
            },
            {
                field: '43_Back_side_photo_o',
                type: 'photo' as const,
                name: 'Back Side',
            },
            {
                field: '44_Right_side_photo_',
                type: 'photo' as const,
                name: 'Right Side',
            },
            {
                field: '45_Photo_of_any_spec',
                type: 'photo' as const,
                name: 'Special Photo 1',
            },
            {
                field: '46_Photo_of_any_spec',
                type: 'photo' as const,
                name: 'Special Photo 2',
            },
        ];

        const downloadPromises = imageFields
            .filter(
                (field) =>
                    surveyItem[field.field] &&
                    surveyItem[field.field].trim() !== ''
            )
            .map(async (field) => {
                try {
                    const image = await this.downloadImage(
                        surveyItem[field.field],
                        field.type
                    );
                    image.fieldName = field.name;
                    return image;
                } catch (error) {
                    console.warn(
                        `Failed to download ${field.name} for ${surveyItem.ec5_uuid}:`,
                        error
                    );
                    return null;
                }
            });

        const results = await Promise.all(downloadPromises);
        return results.filter((img) => img !== null) as EpiCollectImage[];
    }

    /**
     * Creates an image gallery HTML element
     */
    createImageGallery(
        images: EpiCollectImage[],
        containerId: string
    ): HTMLElement {
        const container = document.createElement('div');
        container.className = 'epicollect-image-gallery';
        container.id = containerId;

        if (images.length === 0) {
            container.innerHTML =
                '<p class="no-images">No images available</p>';
            return container;
        }

        const galleryHTML = `
            <div class="gallery-header">
                <h4>Survey Images (${images.length})</h4>
            </div>
            <div class="gallery-grid">
                ${images
                    .map(
                        (img, index) => `
                    <div class="gallery-item" data-index="${index}">
                        <div class="image-container">
                            <img src="${img.dataUrl}" alt="${img.fieldName}" loading="lazy" />
                            <div class="image-overlay">
                                <span class="image-label">${img.fieldName}</span>
                                <div class="image-actions">
                                    <button class="btn-view" onclick="window.epicollectHelper.viewImage('${img.filename}')">
                                        <i class="pi pi-eye"></i>
                                    </button>
                                    <button class="btn-download" onclick="window.epicollectHelper.downloadImageFile('${img.filename}')">
                                        <i class="pi pi-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;

        container.innerHTML = galleryHTML;
        return container;
    }

    /**
     * Opens image in a modal viewer
     */
    viewImage(filename: string): void {
        const image = this.imageCache.get(filename);
        if (!image) {
            console.error('Image not found in cache:', filename);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'epicollect-image-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>${image.fieldName}</h3>
                        <button class="modal-close" onclick="this.closest('.epicollect-image-modal').remove()">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <img src="${image.dataUrl}" alt="${image.fieldName}" />
                    </div>
                    <div class="modal-footer">
                        <button class="btn-download" onclick="window.epicollectHelper.downloadImageFile('${filename}')">
                            <i class="pi pi-download"></i> Download
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Downloads image file to user's device
     */
    downloadImageFile(filename: string): void {
        const image = this.imageCache.get(filename);
        if (!image || !image.blob) {
            console.error('Image not found or blob not available:', filename);
            return;
        }

        const url = URL.createObjectURL(image.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Convert blob to data URL
     */
    private async blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Clear image cache
     */
    clearCache(): void {
        this.imageCache.clear();
    }

    /**
     * Get cached image count
     */
    getCacheSize(): number {
        return this.imageCache.size;
    }

    /**
     * Get cache info
     */
    getCacheInfo(): { filename: string; size: number; type: string }[] {
        return Array.from(this.imageCache.entries()).map(
            ([filename, image]) => ({
                filename,
                size: image.blob?.size || 0,
                type: image.type,
            })
        );
    }
}

// Factory function to create EpiCollect helper
export function createEpiCollectHelper(
    projectSlug: string,
    authToken: string,
    cookies?: string
): EpiCollectHelper {
    const config: EpiCollectConfig = {
        baseUrl: 'https://five.epicollect.net',
        projectSlug,
        authToken,
        cookies,
    };

    const helper = new EpiCollectHelper(config);

    // Make it globally accessible for button callbacks
    (window as any).epicollectHelper = helper;

    return helper;
}

// CSS styles for the image gallery and modal
export const EPICOLLECT_STYLES = `
.epicollect-image-gallery {
    width: 100%;
    margin: 1rem 0;
}

.gallery-header h4 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.gallery-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}

.gallery-item:hover {
    transform: translateY(-2px);
}

.image-container {
    position: relative;
    width: 100%;
    height: 150px;
}

.image-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%);
    opacity: 0;
    transition: opacity 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.5rem;
}

.gallery-item:hover .image-overlay {
    opacity: 1;
}

.image-label {
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}

.image-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.btn-view, .btn-download {
    background: rgba(255,255,255,0.9);
    border: none;
    border-radius: 4px;
    padding: 0.25rem;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-view:hover, .btn-download:hover {
    background: white;
}

.no-images {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 2rem;
}

.epicollect-image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
}

.modal-overlay {
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.25rem;
}

.modal-body {
    flex: 1;
    padding: 1rem;
    text-align: center;
    overflow: auto;
}

.modal-body img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
}

.modal-footer {
    padding: 1rem;
    border-top: 1px solid #eee;
    text-align: right;
}

.modal-footer .btn-download {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-footer .btn-download:hover {
    background: #0056b3;
}

@media (max-width: 768px) {
    .gallery-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.5rem;
    }
    
    .image-container {
        height: 120px;
    }
    
    .modal-overlay {
        padding: 1rem;
    }
}
`;

// Function to inject styles
export function injectEpiCollectStyles(): void {
    if (!document.getElementById('epicollect-styles')) {
        const style = document.createElement('style');
        style.id = 'epicollect-styles';
        style.textContent = EPICOLLECT_STYLES;
        document.head.appendChild(style);
    }
}
