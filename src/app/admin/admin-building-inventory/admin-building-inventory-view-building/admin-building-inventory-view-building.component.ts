import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { QRCodeModule } from 'angularx-qrcode';

import {
    DialogService,
    DynamicDialogComponent,
    DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { UnitDataService } from 'src/app/dataservice/unit.dataservice';

@Component({
    selector: 'app-admin-building-inventory-view-building',
    templateUrl: './admin-building-inventory-view-building.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        AccordionModule,
        DividerModule,
        FieldsetModule,
        TableModule,
        QRCodeModule,
    ],
    styleUrls: ['./admin-building-inventory-view-building.component.css'],
})
export class AdminBuildingInventoryViewBuildingComponent
    implements OnInit, OnDestroy
{
    instance: DynamicDialogComponent | undefined;
    buildingId: number;
    buildingDetails: any;
    units: any[];
    products = [
        {
            id: '1000',
            code: 'f230fh0g3',
            name: 'Bamboo Watch',
            description: 'Product Description',
            image: 'bamboo-watch.jpg',
            price: 65,
            category: 'Accessories',
            quantity: 24,
            inventoryStatus: 'INSTOCK',
            rating: 5,
        },
        {
            id: '1001',
            code: 'nvklal433',
            name: 'Black Watch',
            description: 'Product Description',
            image: 'black-watch.jpg',
            price: 72,
            category: 'Accessories',
            quantity: 61,
            inventoryStatus: 'OUTOFSTOCK',
            rating: 4,
        },
        {
            id: '1002',
            code: 'zz21cz3c1',
            name: 'Blue Band',
            description: 'Product Description',
            image: 'blue-band.jpg',
            price: 79,
            category: 'Fitness',
            quantity: 2,
            inventoryStatus: 'LOWSTOCK',
            rating: 3,
        },
        {
            id: '1003',
            code: '244wgerg2',
            name: 'Blue T-Shirt',
            description: 'Product Description',
            image: 'blue-t-shirt.jpg',
            price: 29,
            category: 'Clothing',
            quantity: 25,
            inventoryStatus: 'INSTOCK',
            rating: 5,
        },
        {
            id: '1004',
            code: 'h456wer53',
            name: 'Bracelet',
            description: 'Product Description',
            image: 'bracelet.jpg',
            price: 15,
            category: 'Accessories',
            quantity: 73,
            inventoryStatus: 'INSTOCK',
            rating: 4,
        },
        {
            id: '1005',
            code: 'av2231fwg',
            name: 'Brown Purse',
            description: 'Product Description',
            image: 'brown-purse.jpg',
            price: 120,
            category: 'Accessories',
            quantity: 0,
            inventoryStatus: 'OUTOFSTOCK',
            rating: 4,
        },
    ];

    constructor(
        public ref: DynamicDialogRef,
        private dialogService: DialogService,
        private buildingDetailService: BuildingDetailService,
        private unitDataService: UnitDataService
    ) {
        this.instance = this.dialogService.getInstance(this.ref);
        if (this.instance && this.instance.data) {
            this.buildingId = this.instance.data.buildingId;
            this.getBuildingDetails(this.buildingId);
            this.getUnitsByBuildingId(this.buildingId);
        }
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.ref.destroy();
    }

    getBuildingDetails(buildingId) {
        this.buildingDetailService
            .GetBuildingDetailsByBuildingId(10499)
            .subscribe((res) => {
                console.log(res);
                this.buildingDetails = res;
            });
    }

    getQr(unit) {
        return unit;
    }

    getUnitsByBuildingId(buildingId) {
        this.unitDataService
            .GetAllUnitsByBuilding(10499)
            .subscribe((res: any[]) => {
                this.units = res;
                console.log(this.units);
            });
    }
}
