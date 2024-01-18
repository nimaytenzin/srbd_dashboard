import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { DropdownModule } from 'primeng/dropdown';
import { LocationDataService } from 'src/app/dataservice/location.dataservice';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { GeometryDataService } from 'src/app/dataservice/geometry.dataservice';
import {
  DialogService,
  DynamicDialogComponent,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import 'leaflet-draw';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GeometryCollection } from 'geojson';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

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
  selector: 'app-admin-master-building',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    CardModule,
    ButtonModule,
    DividerModule,
    DynamicDialogModule,
    ToastModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    InputNumberModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-master-building.component.html',
  styleUrl: './admin-master-building.component.scss'
})
export class AdminMasterBuildingComponent implements OnInit, OnDestroy {

  instance: DynamicDialogComponent | undefined;
  plotId: string;
  plotGeoJson: L.GeoJSON;
  
  existingBuildingGeoJson: L.GeoJSON;

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
    private dialogService: DialogService,
    private locationDataService: LocationDataService,
    private geometryDataService: GeometryDataService,
    private messageService: MessageService
  ) {
    this.instance = this.dialogService.getInstance(this.ref)
    if (this.instance && this.instance.data) {
      this.initialize()
    }
  }

  async initialize() {
    this.plotId = this.instance.data.plotId
  }

  ngOnDestroy(): void {
    this.map = null;
    this.ref.destroy();
  }


  googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
  map!: L.Map;

  ngOnInit(): void {
    this.renderMap();
  }

  async renderMap() {
    var satelliteMap = L.tileLayer(this.googleSatUrl, {
      maxNativeZoom: 21,
      maxZoom: 21,
    });
    this.map = L.map('mapview', {
      layers: [satelliteMap],
      zoomControl: false,
      attributionControl: false,
      maxZoom: 25,
      renderer: L.canvas({ tolerance: 3 }),
    }).setView([27.4712, 89.64191], 12);

    this.geometryDataService.GetPlotGeom(this.plotId).subscribe((res: any) => {
      //adding for building points 
      this.buildingPoint.dzongkhagId = res[0].features[0]['properties']['dzongkhagi']

      //adding for building geom
      this.buildingGeom.admid = res[0].features[0]['properties']['admid']
      this.buildingGeom.dzoid = res[0].features[0]['properties']['dzongkhagi']
      this.buildingGeom.subadmid = res[0].features[0]['properties']['subadmid']

      this.plotGeoJson = L.geoJSON(res[0], {
        style: function (feature) {
          return {
            fillColor: 'transparent',
            weight: 1,
            opacity: 1,
            color: 'red',
          };
        },
      }).addTo(this.map);
      this.map.fitBounds(this.plotGeoJson.getBounds())
    })

    var editableLayers = L.featureGroup();
    this.map.addLayer(editableLayers);

    var drawPluginOptions: L.Control.DrawConstructorOptions = {
      position: 'bottomright',
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: "#e1e100",
            message: "Nope you can't do that!"
          },
          shapeOptions: {
            color: '#97009c'
          }
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
      },
      edit: {
        featureGroup: editableLayers,
        remove: true
      }
    }

    var drawControl = new L.Control.Draw(drawPluginOptions)
    this.map.addControl(drawControl)


    this.map.on('draw:created', (e) => {
      var type = e.type
      var layer = e.layer
      editableLayers.clearLayers()
      editableLayers.addLayer(layer)
      var area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0])
      area = Number(area) * 10.7639

      this.buildingGeom.areaSqFt = area
    })

    this.map.on(L.Draw.Event.EDITSTOP, (e) => {
      var data = editableLayers.toGeoJSON()

      var centroid = editableLayers.getBounds().getCenter()
      this.buildingPoint.lat = centroid.lat
      this.buildingPoint.lng = centroid.lng
      this.buildingPoint.plotId = `New Building Added on ${this.plotId}`


      data['features'][0]['geometry']['type'] = "MultiPolygon"
      data['features'][0]['geometry']['coordinates'] = [data['features'][0]['geometry']['coordinates']]
      var jsonData = JSON.stringify(data['features'][0]['geometry'])
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
            editableLayers.clearLayers()
            this.messageService.add({ severity: 'success', summary: 'Message', detail: 'Building added Successfully!!!' })
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Building could not be added!!!' })
          }
        });
        this.insertBuildingPlots(this.buildingPlot).then((result)=>{
          if(result){
            editableLayers.clearLayers()
            this.messageService.add({ severity: 'success', summary: 'Message', detail: 'Building Plot added Successfully!!!' })
          }else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Building could not be added!!!' })
          }
        })


      })

    })
  }

  async insertBuildingPoint(data) {
    return await this.geometryDataService.postBuildingPoint(data).toPromise()
  }

  async insertBuildingGeom(data) {
    return await this.geometryDataService.postBuildingGeom(data).toPromise()
  }

  async insertBuildingPlots(data) {
    return await this.geometryDataService.postBuildingPlot(data).toPromise()
  }
}
