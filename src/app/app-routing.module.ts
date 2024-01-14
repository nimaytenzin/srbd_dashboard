import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AdminLayoutComponent } from './layout/admin/admin-layout.component';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import(
                                    './demo/components/dashboard/dashboard.module'
                                ).then((m) => m.DashboardModule),
                        },
                        {
                            path: 'uikit',
                            loadChildren: () =>
                                import(
                                    './demo/components/uikit/uikit.module'
                                ).then((m) => m.UIkitModule),
                        },
                        {
                            path: 'utilities',
                            loadChildren: () =>
                                import(
                                    './demo/components/utilities/utilities.module'
                                ).then((m) => m.UtilitiesModule),
                        },
                        {
                            path: 'documentation',
                            loadChildren: () =>
                                import(
                                    './demo/components/documentation/documentation.module'
                                ).then((m) => m.DocumentationModule),
                        },
                        {
                            path: 'blocks',
                            loadChildren: () =>
                                import(
                                    './demo/components/primeblocks/primeblocks.module'
                                ).then((m) => m.PrimeBlocksModule),
                        },
                        {
                            path: 'pages',
                            loadChildren: () =>
                                import(
                                    './demo/components/pages/pages.module'
                                ).then((m) => m.PagesModule),
                        },
                    ],
                },
                {
                    path: 'auth',
                    loadChildren: () =>
                        import('./demo/components/auth/auth.module').then(
                            (m) => m.AuthModule
                        ),
                },
                {
                    path: 'landing',
                    loadChildren: () =>
                        import('./demo/components/landing/landing.module').then(
                            (m) => m.LandingModule
                        ),
                },
                { path: 'notfound', component: NotfoundComponent },
                {
                    path: 'admin',
                    component: AdminLayoutComponent,
                    children: [
                        {
                            path: '',
                            loadChildren: () =>
                                import(
                                    './admin/admin-dashboard/admin-dashboard.module'
                                ).then((m) => m.AdminDashboardModule),
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
                            path: 'master-subadmzones',
                            loadChildren: () =>
                                import(
                                    './admin/admin-master-sub-administrativezones/admin-master-sub-administrativezones.module'
                                ).then(
                                    (m) =>
                                        m.AdminMasterSubAdministrativezonesModule
                                ),
                        },
                    ],
                },

                { path: '**', redirectTo: '/notfound' },
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
