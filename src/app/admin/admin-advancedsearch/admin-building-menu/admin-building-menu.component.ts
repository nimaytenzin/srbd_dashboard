import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import * as L from 'leaflet';

import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BuildingDataService } from 'src/app/core/services/building.dataservice';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { ViewIndividualBuildingModalComponent } from 'src/app/presentation/admin/shared/admin-view-plot-buildings/view-individual-building-modal/view-individual-building-modal.component';

interface BuildingPoint {
  lat: number,
  lng: number,
  plotId: string,
  dzongkhagId: number,
}

interface BuildingGeom {
  geometry: string,
  dzoid: number,
  admid: number,
  subadmid: number,
  buildingid: number
  areaSqFt: number
}

interface BuildingPlot {
  buildingId: number;
  plotId: string;
  overlapPercentage: number;
}


@Component({
  selector: 'app-admin-building-menu',
  standalone: true,
  imports: [
    ToastModule,
    DividerModule,
    ConfirmDialogModule,
    ButtonModule,
  ],
  templateUrl: './admin-building-menu.component.html',
  styleUrl: './admin-building-menu.component.scss'
})

export class AdminBuildingMenuComponent implements OnInit, OnDestroy {
  instance: DynamicDialogComponent | undefined;
  buildingId: number;

  buildingDetails: any;
  building: any;
  buildingPlots: any[];

  units: any[];
  plotGeom: L.GeoJSON;
  buildingPointsGeom: any;

  buildingPoint: BuildingPoint = {
    lat: 0,
    lng: 0,
    plotId: '',
    dzongkhagId: 0
  };
  buildingGeom: BuildingGeom = {
    geometry: '',
    dzoid: 0,
    admid: 0,
    subadmid: 0,
    buildingid: 0,
    areaSqFt: 0
  };

  buildingPlot: BuildingPlot = {
    buildingId: 0,
    plotId: '',
    overlapPercentage: 0
  }

  selectedBuildingId: number = 0;
  plotId: string;

  constructor(
    public ref: DynamicDialogRef,
    public secondRef: DynamicDialogRef,
    public messageService: MessageService,
    private dialogService: DialogService,
    private confirmationService: ConfirmationService,
    private buildingService: BuildingDataService,
    private geometryService: GeometryDataService,
  ) {
    this.instance = this.dialogService.getInstance(this.ref);
    if (this.instance && this.instance.data) {
      this.buildingId = this.instance.data.buildingId;
      this.selectedBuildingId = this.instance.data.selectedBuildingId;
      this.plotId = this.instance.data.plotId;
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ref.destroy();
  }

  goToBuildingDetailedView(buildingId) {
    this.ref = this.dialogService.open(
      ViewIndividualBuildingModalComponent,
      {
        header: 'Building ID: ' + buildingId,
        data: {
          buildingId: buildingId,
        },
        width: '80vw',
      }
    );
  }

  async updateBuildingGeom() {
    const result = await this.geometryService.updateBuildingGeomBuildingId(this.buildingId, this.selectedBuildingId).toPromise()
    if (result[1]['rowCount']) {
      this.messageService.add({
        severity: 'success',
        summary: 'Building Geom Transferred',
        detail: 'Building Geom Transferred',
      })
    }
    return result
  }

  async updateBuildingPlotTable() {
    //update buildingid from zhichar point to the plotId
    const result = await this.buildingService.UpdateBuildingPlotByPlot(this.plotId, this.buildingId, this.selectedBuildingId).toPromise()
    if (result['id'] !== null) {
      this.messageService.add({
        severity: 'success',
        summary: 'Building Plot Transferred',
        detail: 'Building Plot Transferred',
      })
    }
    return result
  }

  assignToBuilding() {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to assign this point?',
      header: 'Assignment Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',


      accept: () => {
        this.updateBuildingPlotTable().then((res) => {
          this.updateBuildingGeom().then((res) => {
            this.ref.close({
              type: "CHANGED"
            })
          })
        })
      },
      reject: () => {
        this.ref.close({
          type: "NOT_CHANGED"
        })
      },
    });

  }

  cancel() {

  }

}