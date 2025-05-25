import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdminLayoutComponent } from './presentation/layout/admin/admin-layout.component';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'admin',
                    component: AdminLayoutComponent,
                    children: [
                        {
                            path: 'building-inventory',
                            loadChildren: () =>
                                import(
                                    './presentation/admin/admin-building-inventory/admin-building-inventory.module'
                                ).then((m) => m.AdminBuildingInventoryModule),
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
