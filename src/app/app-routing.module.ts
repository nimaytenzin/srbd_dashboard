import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'admin',
                    component: AdminLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import(
                                    './admin/admin-advancedsearch/admin-advancedsearch.module'
                                ).then((m) => m.AdminAdvancedsearchModule),
                        },
                        {
                            path: 'building-inventory',
                            loadChildren: () =>
                                import(
                                    './admin/admin-building-inventory/admin-building-inventory.module'
                                ).then((m) => m.AdminBuildingInventoryModule),
                        },
                        {
                            path: 'master-medianrents',
                            loadChildren: () =>
                                import(
                                    './admin/admin-master-medianrent/admin-master-medianrent-routing.module'
                                ).then(
                                    (m) => m.AdminMasterMedianrentRoutingModule
                                ),
                        },
                        {
                            path: 'master-dzongkhags',
                            loadChildren: () =>
                                import(
                                    './admin/admin-master-dzongkhags/admin-master-dzongkhags.module'
                                ).then((m) => m.AdminMasterDzongkhagsModule),
                        },
                        {
                            path: 'master-admzones',
                            loadChildren: () =>
                                import(
                                    './admin/admin-master-administrativezones/admin-master-administrativezones.module'
                                ).then(
                                    (m) =>
                                        m.AdminMasterAdministrativezonesModule
                                ),
                        },
                        {
                            path: 'master-building',
                            loadChildren: () =>
                                import(
                                    './admin/admin-master-building/admin-master-building.module'
                                ).then(
                                    (m) =>
                                        m.AdminMasterBuildingModule
                                ),
                        },
                        {
                            path: 'building-detailed/:buildingId',
                            loadChildren: () =>
                                import(
                                    './admin/admin-building-detailed-view/admin-building-detailed-view.module'
                                ).then(
                                    (m) => m.AdminBuildingDetailedViewModule
                                ),
                        },
                    ],
                },

                // { path: '**', redirectTo: '/notfound' },
                {
                    path: '',
                    redirectTo: '/admin',
                    pathMatch: 'full',
                },
            ],

            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
