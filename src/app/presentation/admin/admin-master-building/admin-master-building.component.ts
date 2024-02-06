import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import * as turf from '@turf/turf';
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
import { AdminBuildingInventoryViewBuildingComponent } from '../admin-building-inventory/admin-building-inventory-view-building/admin-building-inventory-view-building.component';
import { GeometryDataService } from 'src/app/core/services/geometry.dataservice';
import { BuildingPlotDataService } from 'src/app/core/services/buildingplot.dataservice';
import { GeomEditType } from 'src/app/core/constants';

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
  buildingId: number;
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

  buildingPlots: any;
  buildingIds: any[];
  buildingGeojson: any;

  editableLayers = L.featureGroup();

  constructor(
    public ref: DynamicDialogRef,
    public secondRef: DynamicDialogRef,
    private dialogService: DialogService,
    private geometryDataService: GeometryDataService,
    private buildingPlotDataService: BuildingPlotDataService,
    private messageService: MessageService
  ) {
    this.instance = this.dialogService.getInstance(this.ref)
    if (this.instance && this.instance.data) {
      this.initialize()
    }
  }

  async initialize() {
    if (this.instance.data.type == GeomEditType.ADD) {
      this.plotId = this.instance.data.plotId
    }
    if (this.instance.data.type == GeomEditType.EDIT) {
      this.buildingId = this.instance.data.buildingId
    }
  }

  ngOnDestroy(): void {
    this.map = null;
    this.ref.destroy();
    this.secondRef.destroy();
  }


  googleSatUrl = 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}';
  map!: L.Map;

  ngOnInit(): void {
    this.renderMap();
    if (this.instance.data.type == GeomEditType.ADD) {
      this.getPlotGeom(this.plotId)
    }

    if (this.instance.data.type == GeomEditType.EDIT) {
      console.log("Editing building id: ", this.buildingId)
      this.editBuildingGeom(this.buildingId)
    }
  }

  async getPlotGeom(plotId) {
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
      this.getBuildingsInPlot(this.plotId)
    })
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

    this.map.addLayer(this.editableLayers);

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
        featureGroup: this.editableLayers,
        remove: true
      }
    }

    var drawControl = new L.Control.Draw(drawPluginOptions)
    this.map.addControl(drawControl)


    this.map.on('draw:created', (e) => {
      var type = e.type
      var layer = e.layer
      this.editableLayers.clearLayers()
      this.editableLayers.addLayer(layer)
      var area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0])
      area = Number(area) * 10.7639

      console.log("area is ",area)
      this.buildingGeom.areaSqFt = area
    })

    this.map.on(L.Draw.Event.EDITSTOP, (e) => {
      var centroid = this.editableLayers.getBounds().getCenter()
      var geo = this.editableLayers.toGeoJSON();
      var polygon = turf.polygon(geo['features'][0]['geometry']['coordinates'])
      this.buildingGeom.areaSqFt = turf.area(polygon) * 10.764


      var data = {
        geom: this.editableLayers.toGeoJSON(),
        lat: centroid.lat,
        lng: centroid.lng,
        area:this.buildingGeom.areaSqFt
      }
      this.ref.close(data)
    })
  }


  async getBuildingsInPlot(plotId: string) {
    this.buildingPlotDataService
      .GetBuildingsOfPlot(plotId)
      .subscribe((res: any) => {
        this.buildingPlots = res;
        this.buildingIds = [];
        for (
          let index = 0;
          index < this.buildingPlots.length;
          index++
        ) {
          const element = this.buildingPlots[index];
          this.buildingIds.push(element.buildingId);
        }
        this.getBuildingsGeom(this.buildingIds);
      });
  }

  async editBuildingGeom(buildingId: any) {
    if (this.buildingGeojson) {
      this.editableLayers.clearLayers();
      this.map.removeLayer(this.buildingGeojson);
    }
    let geom :any = await this.geometryDataService.GetBuildingFootprintById(buildingId).toPromise();
    let gg: any[] = geom['features'][0]['geometry']['coordinates'][0][0]
    let geometry = gg.map((x)=>{
      return [x[1],x[0]]
    })
    let poly = L.polygon(geometry)
    this.editableLayers.addLayer(poly)
    this.map.fitBounds(poly.getBounds())
  }

  async getBuildingsGeom(buildingIds: any[]) {
    if (this.buildingGeojson) {
      this.map.removeLayer(this.buildingGeojson);
      this.editableLayers.removeLayer(this.buildingGeojson);
    }
    let buildingGeom = [];
    for (var i = 0; i < buildingIds.length; i++) {
      let geom = await this.geometryDataService
        .GetBuildingFootprintById(buildingIds[i])
        .toPromise();
      buildingGeom.push(geom);
    }
    let buildingFeature: any = {
      type: 'FeatureCollection',
      features: buildingGeom,
    };

    this.buildingGeojson = L.geoJSON(buildingFeature, {
      onEachFeature: (feature, layer) => {
        layer.on({
          click: (e: any) => {
            console.log("kjsldjf;lk")
            this.openDeleteInterface(feature.properties.buildingid,feature.properties.id_0);
          },
        });
      },
      style: function (feature) {
        return {
          fillColor: 'white',
          fillOpacity: 0.5,
          weight: 1,
          opacity: 6,
          color: 'black',
        };
      },
    }).addTo(this.map)
    this.map.fitBounds(this.buildingGeojson.getBounds());
    this.editableLayers.addLayer(this.buildingGeojson);
  }

  openDeleteInterface(buildingId: number,geomId:number) {
    this.secondRef = this.dialogService.open(
      AdminBuildingInventoryViewBuildingComponent,
      {
        header: 'Building ID: ' + buildingId,
        data: {
          buildingId: buildingId,
          geomId:geomId
        },
        width: 'max-content',
      }
    );
    this.secondRef.onClose.subscribe((res) => {
      if (res['delete']) {
        console.log("Reloading Building")
        this.reloadBUildings()
      }
    });
  }

  reloadBUildings() {
    this.map.removeLayer(this.buildingGeojson);
    this.getBuildingsInPlot(this.plotId)
  }
}
