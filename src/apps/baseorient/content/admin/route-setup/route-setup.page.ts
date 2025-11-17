import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { latLng, marker, tileLayer } from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import { environment } from 'src/apps/baseorient/environments/environment';
import { HttpService } from 'src/_shared/services/http.service';
import { EventRoutesService } from 'src/apps/baseorient/_shared/providers/event-routes.service';
import { MapsService } from 'src/apps/baseorient/_shared/providers/maps.service';
import { EventCategoriesService } from 'src/apps/baseorient/_shared/providers/event-categories.service';
import { EventPcsService } from 'src/apps/baseorient/_shared/providers/event-pcs.service';
declare var L: any;

@Component({
  selector: 'app-route-setup',
  templateUrl: './route-setup.page.html',
  styleUrls: ['./route-setup.page.scss'],
})
export class RouteSetupPage implements OnInit {
  @Output() public clearEventCategories: EventEmitter<any> = new EventEmitter();
  @Output() public clearEventPCs: EventEmitter<any> = new EventEmitter();
  @ViewChild('RouteForm') RouteForm: any;

  _id: any;
  routeData: any;
  raceMap: any;
  sync_points: any;
  overlayMap: any;
  T: any;
  leafletMap: any;

  raw_categories: any = [];
  raw_pcs: any = [];

  constructor(
    public http: HttpService,
    public nav: NavController,
    public i18n: I18nService,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private alertsService: AlertsService,
    private mapsService: MapsService,
    private eventPCsService: EventPcsService,
    private eventCategoriesService: EventCategoriesService,
    private eventRoutesService: EventRoutesService,
    private loadingService: LoadingService,
  ) {
    this.route.params?.subscribe((params: any) => {
      this._id = params?.id || null;
      this.getRoute();
    })
  }

  async getRoute() {
    let data = await this.eventRoutesService.getEventRouteById({ _id: this._id }, `
      _event
      _race
      name
      dist
      climb
      n_pcs
      _categories
      categories{
        _id
        name
      }
      pcs{
        index
        num_base
      }
      map{
        center{
          lat
          lng
        }
        sync_points{
          latLng{
            lat
            lng
          }
          xy{
            x
            y
          }
        }
        file{
          url
        }
      }
    `);

    this.routeData = data || null;
    this.raceMap = data?.map || null;

    this.RouteForm.form.patchValue(data);

    this.sync_points = (this.raceMap?.sync_points || []).map(it => {
      if (!it.latLng) it.latLng = {};
      if (!it.xy) it.xy = {};
      return it;
    });

    this.setupPage();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  async setupPage() {
    this.getData();

    await this.renderMap();
    this.transformMap();

  }

  async getData() {
    this.getCategories();
    this.getEventPCs();
  }

  async getEventPCs() {
    let data = await this.eventPCsService.getEventPcsBy({ _event: this.routeData._event || null, _race: this.routeData._race || null }, `
      _event
      _race
      pcs{
        # index
        num_base
      }
    `);
    this.raw_pcs = data?.pcs || [];
  }
  async getCategories() {
    let data = await this.eventCategoriesService.getEventCategories({ _event: this.routeData._event || null, _race: this.routeData._race || null }, `
      name
    `);
    this.raw_categories = data || [];
  }

  async setPC(ev: any) {
    if (!ev) return;

    this.routeData.pcs = [...(this.routeData?.pcs || []), { index: (this.routeData?.pcs||[])?.length, num_base: ev.num_base }];
    this.clearEventPCs.next(true);
  }

  async rmPC(it: any) {
    
    this.routeData.pcs = (this.routeData?.pcs || []).filter(c => c.num_base != it.num_base);
  }

  async setCategory(ev: any) {
    if (!ev) return;

    this.routeData._categories = [...(this.routeData?._categories || []), ev._id];
    this.routeData.categories = [...(this.routeData?.categories || []), ev];

    this.clearEventCategories.next(true);
  }

  async rmCategory(it: any) {
    this.routeData._categories = (this.routeData?._categories || []).filter(c => c != it._id);
  }


  saveData() {
    this.loadingService.show();
    let obj = Object.assign({}, this.RouteForm.value);

    obj._categories = (this.routeData._categories || []);
    obj.pcs = (this.routeData.pcs || []);

    this.eventRoutesService.saveEventRoute(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.getRoute();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  // RENDERIZAÇÃO E CONFIGS NO MAPA
  async renderMap() {
    if (this.leafletMap) return;

    // MONTA CAMADAS DO MAPA
    this.leafletMap = L.map('map').setView(latLng(this.raceMap?.center?.lat || null, this.raceMap?.center?.lng || null), 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 14,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.leafletMap);

    this.leafletMap.on('click', (ev: any) => {
      let coords = Object.assign({}, ev?.latlng);
      coords.lat = +coords.lat.toFixed(6);
      coords.lng = +coords.lng.toFixed(6);
      // this.setPair('latLng', coords)
    })


    setTimeout(() => {
      this.leafletMap.invalidateSize();
    }, 400);

    return Promise.resolve(null);
  }
  /**
   * Renderiza o mapa com marcadores e sobreposição de mapa
   */
  async transformMap() {
    let ptsGeo = this.sync_points.map(it => it.latLng)
    let ptsImg = this.sync_points.map(it => it.xy)

    // 3) Calcula a transformação
    this.T = this.mapsService.computeImageToMapTransform(ptsGeo, ptsImg);

    let img: any = await this.utils.getImageSize(this.raceMap.file.url);
    if (!img) return;

    // 4) Converte cantos da imagem (por ex. 1024x768)
    const width = img.width;
    const height = img.height;

    const corners = this.mapsService.getImageCornersLatLng(this.T, width, height);

    // 5) Se estiver usando Leaflet com overlay rotacionado, por exemplo:
    this.overlayMap?.remove();
    var bounds = new L.LatLngBounds(corners.topLeft, corners.topRight).extend(corners.bottomRight);
    this.leafletMap.fitBounds(bounds);

    this.overlayMap = L.imageOverlay.rotated(this.raceMap.file.url, corners.topLeft, corners.topRight, corners.bottomLeft, {
      interactive: true,
    }).addTo(this.leafletMap);
  }

}
