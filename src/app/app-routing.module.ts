import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './presentation/layout/admin/admin-layout.component';
import { AdminBuildingDataEditorComponent } from './presentation/admin/admin-building-data-editor/admin-building-data-editor.component';
import { AdminGewogSelectorComponent } from './presentation/admin/admin-gewog-selector/admin-gewog-selector.component';
import { AdminDataStatisticsComponent } from './presentation/admin/admin-data-statistics/admin-data-statistics.component';

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
                            redirectTo: 'gewog-selector',
                            pathMatch: 'full',
                        },
                        {
                            path: 'gewog-selector',
                            loadComponent: () => AdminGewogSelectorComponent,
                        },
                        // {
                        //     path: '',
                        //     loadChildren: () =>
                        //         import(
                        //             './presentation/admin/admin-building-inventory/admin-building-inventory.module'
                        //         ).then((m) => m.AdminBuildingInventoryModule),
                        // },
                        {
                            path: 'building-edit/:buildingId',
                            loadComponent: () =>
                                AdminBuildingDataEditorComponent,
                        },

                        {
                            path: 'stats',
                            loadComponent: () => AdminDataStatisticsComponent,
                        },
                    ],
                },

                // { path: '**', redirectTo: '/notfound' },
                {
                    path: '',
                    redirectTo: 'login',
                    pathMatch: 'full',
                },

                {
                    path: 'login',
                    loadChildren: () =>
                        import('./presentation/auth/login/login.module').then(
                            (m) => m.LoginModule
                        ),
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
