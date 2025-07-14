import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        ProgressSpinnerModule,
        RippleModule,
        TooltipModule,
        BadgeModule,
        DropdownModule,
        TableModule,
        TagModule,
        MessageModule,
    ],
    exports: [],
})
export class AdminGewogSelectorModule {}
