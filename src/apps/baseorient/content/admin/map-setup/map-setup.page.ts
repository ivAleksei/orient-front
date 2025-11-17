import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { latLng, marker, tileLayer } from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import { MapsService } from 'src/apps/baseorient/_shared/providers/maps.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { EventPcsService } from 'src/apps/baseorient/_shared/providers/event-pcs.service';
import { EventRoutesService } from 'src/apps/baseorient/_shared/providers/event-routes.service';
import { EventsService } from 'src/apps/baseorient/_shared/providers/events.service';
import { EventRacesService } from 'src/apps/baseorient/_shared/providers/event-races.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { HttpService } from 'src/_shared/services/http.service';
declare var L: any;

@Component({
  selector: 'app-map-setup',
  templateUrl: './map-setup.page.html',
  styleUrls: ['./map-setup.page.scss'],
})
export class MapSetupPage implements OnInit {

  _id: any;

  centerMap: any;

  configs: any = {
    show_route_pcs: false,
    show_marker_pcs: false,
    opacity: 1
  }

  T: any;
  arr_markers: any = [];
  sync_ok: boolean = false;
  sync_points: any[] = [];
  pair_i: any = 0;
  obj_sync_points: any = {
    0: {
      latLng: {},
      xy: {}
    },
    1: {
      latLng: {},
      xy: {}
    },
    2: {
      latLng: {},
      xy: {}
    }
  };

  render: boolean;
  raceMap: any;
  leafletMap: any;
  overlayMap: any;

  layers: any = {
    map: {
      z: 0,
      elems: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
          attribution: 'OpenStreet Map'
        })
      ]
    }
  }
  rng_opacity: any = 100;

  state: any = 'sync_pending';
  obj_event_pcs: any;

  route_pcs: any[] = [];
  arr_route_pcs: any[] = [];
  arr_pcs: any[] = [];

  constructor(
    public http: HttpService,
    public nav: NavController,
    public i18n: I18nService,
    private utils: UtilsService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private mapsService: MapsService,
    private eventsService: EventsService,
    private racesService: EventRacesService,
    private eventRoutesService: EventRoutesService,
    private eventPcsService: EventPcsService,
    private alertsService: AlertsService
  ) {
    this.route.params?.subscribe((params: any) => {
      this._id = params?.id || null;
      this.getMap();
    })
  }

  // BUSCA DE DADOS
  /**
   * Busca registro do mapa e dispara busca de dados necessários para a pagina
   */
  async getMap() {
    let data = await this.mapsService.getMapById({ _id: this._id }, `
      _event
      _race
      _route
      file{
        url
      }  
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
    `);
    this.raceMap = data || null;
    // SE NÃO HOUVER ARQUIVO VOLTA A PAGINA, NÃO TEM SENTIDO CHEGAR AQUI
    if (!this.raceMap?.file?.url)
      return this.nav.back();

    this.sync_points = (data?.sync_points || []).map(it => {
      if (!it.latLng) it.latLng = {};
      if (!it.xy) it.xy = {};
      return it;
    });

    await this.getData()

    this.sync_ok = this.setSyncOk(this.sync_points);
    if (this.sync_ok) {
      this.setState('sync_ok');
      this.transformMap();
    }
  }

  async getData() {
    await this.getCenterMap();
    this.setupMap();
    this.getRoutePCs();
    this.getAllPCs();
  }

  ngOnInit() {
    this.setupPage();
    this.setupZoomMap();
  }

  setupPage() {
  }


  async getCenterMap() {
    if (this.raceMap?.center?.lat && this.raceMap?.center?.lng) {
      this.centerMap = this.raceMap.center;
      return;
    }

    let location = null;
    if (!location && this.raceMap._race) {
      let race = await this.racesService.getEventRaceById({ _id: this.raceMap._race }, `
        _id
        location  
      `);
      location = race?.location || null;
    }
    if (!location && this.raceMap._event) {
      let event = await this.eventsService.getEventById({ _id: this.raceMap._event }, `
        _id
        location  
      `)
      location = event?.location || null;
    }

    let query = { location }
    let url = [environment.API.orient, 'ws', 'coords'].join('/') + '?' + Object.keys(query).map(k => `${k}=${query[k]}`);
    let data = await this.http.get(url);

    this.centerMap = {
      lat: +data?.lat || null,
      lng: +data?.lon || null,
    }
    return;
  }

  async getRoutePCs() {
    let args = this.raceMap;
    if (!args) return;
    let data = await this.eventRoutesService.getEventRouteById({ _id: args._route }, `
      pcs{
        index
        num_base
      }
    `);

    this.route_pcs = data?.pcs || [];
    this.setupRoutePCs();
  }

  setupRoutePCs() {
    if (!this.route_pcs?.length || !this.arr_pcs?.length) return;
    let obj_pcs = {};
    for (let it of (this.arr_pcs || []))
      obj_pcs[it.num_base] = it;

    this.arr_route_pcs = [{ num_base: "P1" }, ...(this.route_pcs || []), { num_base: "C1" }].map(pc => {
      return Object.assign({}, obj_pcs[pc.num_base], pc);
    });
  }


  async getAllPCs() {
    let args = this.raceMap;
    if (!args) return;

    let data = await this.eventPcsService.getEventPcsBy({ _event: args._event, _race: args._race }, `
      _event
      _race
      pcs{
        num_base
        latLng{
          lat
          lng
        }  
        xy{
          x
          y
        }
      }
    `);
    this.obj_event_pcs = data || null;
    this.arr_pcs = data?.pcs || [];

    this.setupRoutePCs();
  }

  setSyncOk(data) {
    if (data?.length < 3 || data.some(it => !it.latLng?.lat || !it.latLng?.lng || !it.xy?.x || !it.xy?.y)) {
      this.sync_ok = false;
      this.state = 'sync_pending';
      return false;
    }

    this.pair_i = 3;
    this.sync_ok = true;
    this.state = 'sync_ok';
    return true;
  }

  /**
   * Seta estado da pagina
   * sync_pending - Criando sincronização de mapas
   * sync_ok - Sincronização concluida
   * add_pc - Adicionando PCs
   */
  setState(state) {
    this.state = state;
  }

  /**
   * 
   * @param src Tipo de par a ser registrado (latLng, xy )
   * @param coords Par ordenado
   * @returns 
   */
  setPair(src, coords) {

    if (this.state == 'add_pc') {
      this.addNewPC(coords);
      this.setSyncOk(this.sync_points || []);
    }

    if (this.sync_ok) return;


    if (this.pair_i != 3) {
      if (
        src == 'latLng' && this.obj_sync_points[this.pair_i][src]?.lat ||
        src == 'xy' && this.obj_sync_points[this.pair_i][src]?.x
      )
        return this.alertsService.notify({ type: "warning", subtitle: `Valor ${src} já preenchido` });


      let obj = this.obj_sync_points[this.pair_i];
      obj[src] = coords;

      if (obj.latLng?.lat && obj.xy?.x)
        this.pair_i++;
    }

    if (this.pair_i == 3) {
      this.alertsService.notify({ type: "success", subtitle: "Pontos para sincronização definidos" });
      this.saveSyncPoints();
      this.transformMap();
    }

    this.sync_points = Object.values(this.obj_sync_points || {});
    this.setSyncOk(this.sync_points);
  }

  /**
   * Adiciona novo PC a lista de PCS da Prova
   * @param coords 
   */
  addNewPC(coords: any) {
    let xy = this.mapsService.latLngToImagePoint(this.T, coords.lat, coords.lng);
    let obj = {
      num_base: "",
      latLng: coords,
      xy: xy
    }
    this.arr_pcs.push(obj);
    this.transformMap();
  }


  // SINCRONIA
  /**
   * Limpa sincronização de mapas para reiniciar o processo
   */
  resetSync() {
    for (let p of Object.keys(this.obj_sync_points || {})) {
      for (let prop of Object.keys(this.obj_sync_points[p] || {})) {
        this.obj_sync_points[p][prop] = {};
      }
    }
    this.sync_points = Object.values(this.obj_sync_points || {});
    this.sync_ok = this.setSyncOk(this.sync_points);
    this.pair_i = 0;
    this.overlayMap?.remove();

    this.saveSyncPoints();
  }

  /**
   * Salva pontos de sincronia do mapa
   */
  async saveSyncPoints() {
    let payload = {
      _id: this._id,
      center: this.centerMap,
      sync_points: Array.from(this.sync_points)
    }
    await this.mapsService.saveMap(payload)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }


  // PCs DE PROVA
  /**
   * Remove PC
   * @param pc 
   */
  rmPC(pc: any) {
    this.arr_pcs = this.arr_pcs.filter(it => it.num_base != pc.num_base);
    this.transformMap();
  }

  /**
   * Salva PCs
   */
  async savePoints() {
    // ORDENA PONTOS PELO NUMERO DA BASE
    this.arr_pcs = (this.arr_pcs || []).sort((a, b) => {
      if (a.num_base.includes('P')) return -1;
      if (a.num_base.includes('C')) return 1;
      if (b.num_base.includes('P')) return 1;
      if (b.num_base.includes('C')) return -1;

      return +a.num_base - +b.num_base;
    });

    let payload = {
      _id: this.obj_event_pcs?._id || null,
      _event: this.raceMap._event,
      _race: this.raceMap._race,
      pcs: this.arr_pcs || []
    }

    await this.eventPcsService.saveEventPc(payload)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }


  // RENDERIZAÇÃO E CONFIGS NO MAPA
  async setupMap() {
    // MONTA CAMADAS DO MAPA
    this.leafletMap = L.map('map').setView(latLng(this.centerMap?.lat || null, this.centerMap?.lng || null), 16);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 14,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.leafletMap);

    this.leafletMap.on('click', (ev: any) => {
      let coords = Object.assign({}, ev?.latlng);
      coords.lat = +coords.lat.toFixed(6);
      coords.lng = +coords.lng.toFixed(6);
      this.setPair('latLng', coords)
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
    if (!this.setSyncOk(this.sync_points))
      return;

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

    for (let pc of (this.arr_markers || []))
      pc.remove();

    if (this.configs.show_route_pcs) {
      for (let pc of (this.arr_route_pcs || [])) {
        let marker = L.marker([pc.latLng?.lat, pc.latLng?.lng]).addTo(this.leafletMap);
        this.arr_markers.push(marker)
      }
    }
    if (this.configs.show_sync_pcs) {
      for (let pc of (this.sync_points || [])) {
        let marker = L.marker([pc.latLng?.lat, pc.latLng?.lng]).addTo(this.leafletMap);
        this.arr_markers.push(marker)
      }
    }
    if (this.configs.show_marker_pc) {
      for (let pc of (this.arr_pcs || [])) {
        let marker = L.marker([pc.latLng?.lat, pc.latLng?.lng]).addTo(this.leafletMap);
        this.arr_markers.push(marker)
      }
    }

    // 5) Se estiver usando Leaflet com overlay rotacionado, por exemplo:
    this.overlayMap?.remove();
    var bounds = new L.LatLngBounds(corners.topLeft, corners.topRight).extend(corners.bottomRight);
    this.leafletMap.fitBounds(bounds);

    this.overlayMap = L.imageOverlay.rotated(this.raceMap.file.url, corners.topLeft, corners.topRight, corners.bottomLeft, {
      opacity: this.configs.opacity,
      interactive: true,
    }).addTo(this.leafletMap);
  }

  setOpacityMap() {
    this.configs.opacity = this.rng_opacity / 100;
    this.transformMap();
  }

  /**
   * Configura o zoom da div com mapa de prova
   */
  setupZoomMap() {
    const zoomContent = document.getElementById('zoomContent');
    const container: any = document.querySelector('.zoom-container');
    const img: any = document.getElementById('mapImg');

    let scale = 1;           // 1 = 100%
    const minScale = 0.3;
    const maxScale = 4;
    const step = 0.1;

    function applyZoom() {
      zoomContent.style.transform = `scale(${scale})`;
    }

    // Zoom com scroll ( rodinha) 
    container.addEventListener('wheel', (e) => {
      e.preventDefault();

      if (e.deltaY < 0) {
        scale = Math.min(maxScale, scale + step);
      } else {
        scale = Math.max(minScale, scale - step);
      }
      applyZoom();
    }, { passive: false });

    // ====== DRAG / PAN ======
    let isDragging = false;
    let hasDragged = false;         // para diferenciar drag de clique
    let startX, startY;
    let scrollLeftStart, scrollTopStart;

    container.addEventListener('mousedown', (e: any) => {
      isDragging = true;
      hasDragged = false;
      container.classList.add('dragging');

      startX = e.pageX - container.offsetLeft;
      startY = e.pageY - container.offsetTop;

      scrollLeftStart = container.scrollLeft;
      scrollTopStart = container.scrollTop;
    });

    window.addEventListener('mousemove', (e: any) => {
      if (!isDragging) return;
      e.preventDefault();

      const x = e.pageX - container.offsetLeft;
      const y = e.pageY - container.offsetTop;

      const walkX = x - startX;
      const walkY = y - startY;

      if (Math.abs(walkX) > 3 || Math.abs(walkY) > 3) {
        hasDragged = true;   // já consideramos drag, não é clique
      }

      container.scrollLeft = scrollLeftStart - walkX;
      container.scrollTop = scrollTopStart - walkY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      container.classList.remove('dragging');
    });

    container.removeEventListener('click', (e: any) => { });
    container.addEventListener('click', (e: MouseEvent) => {

      if (hasDragged) {
        hasDragged = false;
        return;
      }

      if (!img) return;

      // pega o retângulo VISÍVEL da imagem (já transformada / posicionada)
      const rect = img.getBoundingClientRect();

      // posição do clique em relação à imagem renderizada
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // proporção dentro da imagem renderizada (0..1)
      const relX = clickX / rect.width;
      const relY = clickY / rect.height;

      // agora converte para pixels reais da imagem (naturalWidth/naturalHeight)
      const imgX = relX * img.naturalWidth;   // aqui deve ir até ~1183
      const imgY = relY * img.naturalHeight;  // aqui deve ir até ~854


      this.setPair('xy', {
        x: Math.round(imgX),
        y: Math.round(imgY)
      });
    });
    applyZoom();
  }


}
