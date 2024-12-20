import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AdminLayoutService } from '../service/admin-layout.service';

@Component({
    selector: 'app-admin-menu',
    templateUrl: './admin-menu.component.html',
})
export class AdminMenuComponent implements OnInit {
    model: any[] = [];

    constructor(public layoutService: AdminLayoutService) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    {
                        label: 'Search',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/admin'],
                    },
                    {
                        label: 'Building Inventory',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/building-inventory'],
                    },
                    {
                        label: 'Correction Requests',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/correction-requests'],
                    },
                ],
            },
            {
                label: 'Building Tax',
                items: [
                    {
                        label: 'Tax Calculator',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/taxation'],
                    },
                    {
                        label: 'Median Rents',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/master-medianrents'],
                    },
                ],
            },

            {
                label: 'Ownership',
                items: [
                    {
                        label: 'Building Owners',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/admin/master-owners'],
                    },
                ],
            },
        ];
    }
}
