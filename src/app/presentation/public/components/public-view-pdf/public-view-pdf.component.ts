import { Component, OnInit } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { API_URL } from 'src/app/core/constants/constants';
import { BuildingCorrectionRequestDTO } from 'src/app/core/models/bulding-correction.dto';

@Component({
    selector: 'app-public-view-pdf',
    templateUrl: './public-view-pdf.component.html',
    styleUrls: ['./public-view-pdf.component.css'],
    standalone: true,
    imports: [PdfViewerModule],
})
export class PublicViewPdfComponent implements OnInit {
    ApiUrl = API_URL;
    request: BuildingCorrectionRequestDTO;
    pdfUrl: string;

    constructor(private config: DynamicDialogConfig) {
        this.request = this.config.data;
        this.pdfUrl = this.ApiUrl + '/' + this.request.fileUri;
    }

    ngOnInit() {}
}
