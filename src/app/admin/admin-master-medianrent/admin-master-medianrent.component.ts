import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { MedianRentDataService } from 'src/app/dataservice/median-rent.dataservice';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-admin-master-medianrent',
    standalone: true,
    imports: [TableModule, ButtonModule],
    templateUrl: './admin-master-medianrent.component.html',
    styleUrl: './admin-master-medianrent.component.scss',
})
export class AdminMasterMedianrentComponent implements OnInit {
    constructor(private medianRentDataservice: MedianRentDataService) {}

    medianRents: any[] = [];

    ngOnInit(): void {
        this.fetchMedianRents();
    }

    fetchMedianRents() {
        this.medianRentDataservice.GetMedianRents().subscribe((res: any) => {
            this.medianRents = res;
        });
    }
}
