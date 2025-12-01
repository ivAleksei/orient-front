import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { GameRoutesService } from 'src/apps/baseorient/_shared/providers/game-routes.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { latLng, marker, tileLayer } from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import { LocationService } from 'src/_shared/services/location.service';
import { HttpService } from 'src/_shared/services/http.service';
import { MapsService } from 'src/apps/baseorient/_shared/providers/maps.service';
import { LocalStorageService } from 'src/_shared/services/local-storage.service';
declare var L: any;

@Component({
  selector: 'app-game-routes',
  templateUrl: './game-routes.page.html',
  styleUrls: ['./game-routes.page.scss'],
})
export class GameRoutesPage implements OnInit {
  @ViewChild('GameRouteForm') GameRouteForm: any;
  leafletMap: any;

  state: any; // def_polygon, 

  polygon: any = [
    // { lat: -5.863668, lng: -35.240793 },
    // { lat: -5.857328, lng: -35.247606 },
    // { lat: -5.853641, lng: -35.244108 },
    // { lat: -5.852376, lng: -35.243315 },
    // { lat: -5.853271, lng: -35.241952 },
    // { lat: -5.851371, lng: -35.240729 },
    // { lat: -5.856303, lng: -35.232596 },
    // { lat: -5.858139, lng: -35.233648 },
    // { lat: -5.857776, lng: -35.234292 },
    // { lat: -5.864607, lng: -35.239849 }
  ];

  userMarker: any;
  userIcon = L.icon({
    iconUrl: '/assets/baseorient/svg/user-marker.svg',
    className: 'user-marker no-print',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

  polygonMap: any;
  polygonIcon = L.icon({
    iconUrl: '/assets/baseorient/svg/polygon-marker.svg',
    className: 'user-marker no-print',
    iconSize: [17, 17],
    iconAnchor: [8, 8],
  });

  center: any;

  markers: any = [];
  route: any = [];

  constructor(
    public i18n: I18nService,
    private http: HttpService,
    private utils: UtilsService,
    private locationService: LocationService,
    private storage: LocalStorageService,
    private loadingService: LoadingService,
    private mapsService: MapsService,
    private gameRoutesService: GameRoutesService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
    // this.setCenterMap();
  }

  ionViewWillEnter() {
    this.setupPage();
  }

  async setupPage() {
    await this.setCenterMap();
    this.renderMap();
  }

  async setCenterMap() {
    this.center = await this.locationService.getCurrentLocation();
  }

  setState(state) {
    this.state = state;
    this.renderMap();
  }

  addPcPolygon(pc: any) {
    this.polygon = this.sortRadial([...this.polygon, pc]);
    this.renderMap();
  }

  rmPcPolygon(obj) {
    this.polygon = this.sortRadial((this.polygon || []).filter(it => {
      it.marker.remove();
      return !(it.lat == obj.lat && it.lng == obj.lng)
    }));
    this.renderMap();
  }

  polyline: any;

  // RENDERIZAÇÃO E CONFIGS NO MAPA
  async renderMap() {
    if (!this.leafletMap) {
      // MONTA CAMADAS DO MAPA
      this.leafletMap = L.map('map', {
        doubleClickZoom: false
      }).setView(latLng(this.center?.lat || null, this.center?.lng || null), 16);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        minZoom: 14,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.leafletMap);

      this.leafletMap.on('dblclick', e => {
        let { lat, lng } = e.latlng;
        this.addPcPolygon({ lat, lng })
        return;
      })

      setTimeout(() => {
        this.leafletMap.invalidateSize();
      }, 400);
    }

    // ADICIONA MARCADOR DO USUARIO
    this.userMarker = L.marker([this.center.lat, this.center.lng], {
      icon: this.userIcon
    }).addTo(this.leafletMap);

    // POLYGON MARKERS
    if (this.polygonMap) {
      this.polygonMap?.remove();
      this.polygonMap = null;
    }

    if (this.polyline) {
      this.polyline?.remove();
      this.polyline = null;
    }


    this.polygonMap = L.polygon(this.polygon, { color: 'red' }).addTo(this.leafletMap);
    for (let it of this.polygon) {
      if (it.marker) it.marker.remove();
      it.marker = L.marker([it.lat, it.lng], {
        icon: this.polygonIcon
      }).addTo(this.leafletMap);

      it.marker.on('dblclick', (e) => {
        let { lat, lng } = it.marker.getLatLng();
        it.lat = +lat.toFixed(6);
        it.lng = +lng.toFixed(6);
        console.log(it);

        this.rmPcPolygon(it);
      });
    }



    // zoom the map to the polygon
    for (let it of (this.route || [])) {
      if (it.marker) it.marker.remove();
      it.marker = L.marker([it.lat, it.lng], {
        draggable: true,
        icon: L.divIcon({
          className: "custom-text-marker",
          html: it.index,
          iconSize: [30, 30],    // tamanho do container
          iconAnchor: [15, 15]   // centraliza o texto
        })
      }).addTo(this.leafletMap);


      it.marker.on('dragend', (e) => {
        let { lat, lng } = it.marker.getLatLng();
        it.lat = +lat.toFixed(6);
        it.lng = +lng.toFixed(6);

        this.renderRoute(this.route);
      });
      this.markers.push(it.marker)
    }

    this.polyline = L.polyline((this.route || []).map(it => [it.lat, it.lng]), { color: "#BE3F9D" }).addTo(this.leafletMap);

    return Promise.resolve(null);
  }

  async generateRoute() {
    let obj = Object.assign({}, this.GameRouteForm.value);
    obj.center = this.center;
    obj.polygon = (this.polygon || []).map(it => Object.assign({}, { lat: it.lat, lng: it.lng }));

    let url = [environment.API.orient, 'tmp', 'game_route'].join('/');

    this.loadingService.show();
    let data = await this.http.post(url, obj);
    this.loadingService.hide();
    if (data) {
      let route = [data.inicio, ...data.pontosIntermediarios, data.fim].filter(it => it);
      this.renderRoute(route);
    }
  }

  async renderRoute(route: any) {
    for (let it of (this.route || []))
      it.marker.remove();

    let sum = 0;
    this.route = (route || []).map((it, i) => {
      it.index = i;
      if (i == 0) it.index = 'P1';
      if (i == route?.length - 1) it.index = 'C1';


      it.dist_leg = i == 0 ? 0 : this.mapsService.havDistance(route[i - 1].lat, route[i - 1].lng, it.lat, it.lng);
      sum += it.dist_leg;
      it.dist_acum = +sum;

      return it;
    });

    this.renderMap();

  }

  async saveData() {
    let _user = await this.storage.get('user_id');
    let obj = Object.assign({}, this.GameRouteForm.value);
    let payload = {
      _person: _user,
      dist: obj.dist,
      n_pcs: obj.n_pcs,
      center: this.center,
      polygon: this.polygon.map(it => { return { lat: it.lat, lng: it.lng } }),
      pcs: this.route.map(it => {
        return { index: String(it.index), latLng: { lat: it.lat, lng: it.lng } }
      }),
    }

    this.loadingService.show();
    this.gameRoutesService.saveGameRoute(payload)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });

  }

  print() {
    window.print();
  }

  sortRadial(points) {
    // 1. calcular o centro (média dos lat e lng)
    let clat = 0, clng = 0;
    points.forEach(p => {
      clat += p.lat;
      clng += p.lng;
    });
    clat /= points.length;
    clng /= points.length;

    // 2. ordenar pelo ângulo
    return points.slice().sort((a, b) => {
      const angA = Math.atan2(a.lng - clng, a.lat - clat);
      const angB = Math.atan2(b.lng - clng, b.lat - clat);
      return angA - angB;
    });
  }
}
