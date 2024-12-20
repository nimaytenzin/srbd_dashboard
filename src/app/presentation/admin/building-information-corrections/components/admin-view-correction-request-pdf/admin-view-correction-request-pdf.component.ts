import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { API_URL } from 'src/app/core/constants/constants';
import { BuildingCorrectionRequestDTO } from 'src/app/core/models/bulding-correction.dto';
import { PdfViewerModule } from 'ng2-pdf-viewer';
@Component({
    selector: 'app-admin-view-correction-request-pdf',
    templateUrl: './admin-view-correction-request-pdf.component.html',
    styleUrls: ['./admin-view-correction-request-pdf.component.css'],
    imports: [PdfViewerModule],
    standalone: true,
})
export class AdminViewCorrectionRequestPdfComponent implements OnInit {
    ApiUrl = API_URL;
    request: BuildingCorrectionRequestDTO;
    pdfUrl: string;

    constructor(private config: DynamicDialogConfig) {
        this.request = this.config.data;
        this.pdfUrl = this.ApiUrl + '/' + this.request.fileUri;
    }

    ngOnInit() {}
}
