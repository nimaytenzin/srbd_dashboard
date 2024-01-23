import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import * as L from 'leaflet';
import { encodeBase32, decodeBase32 } from 'geohashing';

import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { BuildingDetailService } from 'src/app/dataservice/building-detail.dataservice';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { UnitDataService } from 'src/app/dataservice/unit.dataservice';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BuildingDataService } from 'src/app/dataservice/building.dataservice';
import { InputTextModule } from 'primeng/inputtext';
import { BuildingPlotDataService } from 'src/app/dataservice/buildingplot.dataservice';
import { Router } from '@angular/router';
import { ViewIndividualBuildingModalComponent } from '../../shared/admin-view-plot-buildings/view-individual-building-modal/view-individual-building-modal.component';
import { AdminMasterBuildingComponent } from '../../admin-master-building/admin-master-building.component';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';

@Component({
  selector: 'app-admin-building-menu',
  standalone: true,
  imports: [
    ButtonModule,
  ],
  templateUrl: './admin-building-menu.component.html',
  styleUrl: './admin-building-menu.component.scss'
})
export class AdminBuildingMenuComponent implements OnInit, OnDestroy {
  instance: DynamicDialogComponent | undefined;
  plotId: string;

  buildingDetails: any;
  building: any;
  buildingPlots: any[];

  units: any[];
  plotGeom: L.GeoJSON;
  buildingPointsGeom: any;

  constructor(
    public ref: DynamicDialogRef,
    public secondref: DynamicDialogRef,
    private dialogService: DialogService,
    private geometryService: GeometryDataService,
  ) {
    this.instance = this.dialogService.getInstance(this.ref);
    if (this.instance && this.instance.data) {
      this.plotId = this.instance.data.plotId;
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ref.destroy();
  }

  async showBuildingsNearBy(){
    let hash = await this.generateGoeHashFromPlotId()
    this.buildingPointsGeom = await this.geometryService.GetBuildingPointNearHash(hash).toPromise()
    this.ref.close(this.buildingPointsGeom);

  }

  async generateGoeHashFromPlotId(){
    let response = await this.geometryService.GetPlotGeom(this.plotId).toPromise()
    this.plotGeom = L.geoJSON(response[0])
    const center = this.plotGeom.getBounds().getCenter();
    const hash = encodeBase32(center.lat,center.lng,7)
    return hash
  }

  showAddBuilding() {
    this.secondref = this.dialogService.open(
      AdminMasterBuildingComponent,
      {
        header: 'Add building to PlotId: ' + this.plotId,
        data: {
          plotId: this.plotId,
        },
        width: '90%',
        height: '90%'
      }
    )
  }

}