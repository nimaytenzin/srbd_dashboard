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
import { GeomEditType } from 'src/app/api/constants';

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

  constructor(
    public ref: DynamicDialogRef,
    public secondRef: DynamicDialogRef,
    public messageService: MessageService,
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
    this.secondRef= this.dialogService.open(
      AdminMasterBuildingComponent,
      {
        header: 'Add building to PlotId: ' + this.plotId,
        data: {
          type:GeomEditType.ADD,
          plotId: this.plotId,
        },
        width: '90%',
        height: '90%'
      }
    );
    this.secondRef.onClose.subscribe((res)=>{
      console.log(res)

      this.buildingPoint.lat = res.lat
      this.buildingPoint.lng = res.lng
      this.buildingPoint.plotId = `New Building Added on ${this.plotId}`


      res.data['features'][0]['geometry']['type'] = "MultiPolygon"
      res.data['features'][0]['geometry']['coordinates'] = [res.data['features'][0]['geometry']['coordinates']]
      var jsonData = JSON.stringify(res.data['features'][0]['geometry'])
      this.buildingGeom.geometry = jsonData

      this.insertBuildingPoint(this.buildingPoint).then((res: any) => {
        console.log("building id new ", res.id)

        this.buildingGeom.buildingid = res.id

        //building plot data
        this.buildingPlot.buildingId = res.id
        this.buildingPlot.plotId = this.plotId
        this.buildingPlot.overlapPercentage = 100.0

        this.insertBuildingGeom(this.buildingGeom).then((result) => {
          if (result[1]) {
            this.messageService.add({ severity: 'success', summary: 'Message', detail: 'Building added Successfully!!!' })
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Building could not be added!!!' })
          }
        });
        this.insertBuildingPlots(this.buildingPlot).then((result) => {
          if (result) {
            this.messageService.add({ severity: 'success', summary: 'Message', detail: 'Building Plot added Successfully!!!' })
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Building could not be added!!!' })
          }
        })
      });

    })

  }

  async insertBuildingPoint(data) {
    return await this.geometryService.postBuildingPoint(data).toPromise()
  }

  async insertBuildingGeom(data) {
    return await this.geometryService.postBuildingGeom(data).toPromise()
  }

  async insertBuildingPlots(data) {
    return await this.geometryService.postBuildingPlot(data).toPromise()
  }

}