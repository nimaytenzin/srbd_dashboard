import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import {
    BuildingDataService,
    BuildingImageDTO,
} from 'src/app/core/services/building.dataservice';
import { GalleriaModule } from 'primeng/galleria';

export interface BuildingDetails {
    id: string;
    clientBuildingId: string | null;
    geomSource: string;
    address: string | null;
    qrUuid: string | null;
    existencyStatus: string;
    associativePosition: string;
    name: string;
    typology: string | null;
    type: string;
    primaryUse: string;
    secondaryUse: string | null;
    regularFloorCount: number;
    basementCount: number;
    stiltCount: number;
    atticCount: number;
    jamthogCount: number;
    length: number | null;
    breadth: number | null;
    footprintArea: number | null;
    contact: number;
    isProtected: boolean;
    status: string | null;
    subAdministrativeZoneId: number;
    createdAt: string;
    updatedAt: string;
}
@Component({
    selector: 'app-admin-building-inventory-view-details',
    templateUrl: './admin-building-inventory-view-details.component.html',
    styleUrls: ['./admin-building-inventory-view-details.component.css'],
    standalone: true,
    imports: [CommonModule, DialogModule, GalleriaModule],
})
export class AdminBuildingInventoryViewDetailsComponent implements OnInit {
    buildingDetails: BuildingDetails;
    buildingImages: BuildingImageDTO[] = [];
    displayDialog: boolean = false;
    selectedImage: BuildingImageDTO | null = null;

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

    constructor(
        private config: DynamicDialogConfig,
        private buildingService: BuildingDataService
    ) {
        this.buildingDetails = this.config.data;
    }

    ngOnInit() {
        this.buildingService
            .GetAllBuildingPhotosById(Number(this.buildingDetails.id))
            .subscribe({
                next: (data) => {
                    this.buildingImages = data;
                },
            });
    }

    parseUri(uri: string) {
        console.log(
            'URI:',
            `https://www.zhichar.bt/app/images/building/${uri}`
        );
        return `https://www.zhichar.bt/app/images/building/${uri}`;
    }

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
}
