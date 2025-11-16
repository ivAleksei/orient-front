import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { EventSubscriptionsService } from '../../_shared/providers/event-subscriptions.service';
import { Router } from '@angular/router';
import { EventRoutesService } from '../../_shared/providers/event-routes.service';
import { EventCategoriesService } from '../../_shared/providers/event-categories.service';
import { latLng, marker, tileLayer } from 'leaflet';
import 'leaflet-imageoverlay-rotated';
import { MapsService } from '../../_shared/providers/maps.service';
declare var L: any;

@Component({
  selector: 'app-run-viewer',
  templateUrl: './run-viewer.page.html',
  styleUrls: ['./run-viewer.page.scss'],
})
export class RunViewerPage implements OnInit {

  @Input() _event: any;
  @Input() _race: any;
  @Input() _subscription: any;
  @Input() _category: any;
  @Input() _route: any;
  @Input() _person: any;

  obj_categories: any = {};
  categories: any = [];
  raw_ranking: any = [];
  ranking: any = [];

  route: any;
  raceMap: any;
  leafletMap: any;
  overlayMap: any;
  sync_points: any;


  constructor(
    public i18n: I18nService,
    private utils: UtilsService,
    private router: Router,
    private loadingService: LoadingService,
    private mapsService: MapsService,
    private eventCategoriesService: EventCategoriesService,
    private eventRoutesService: EventRoutesService,
    private eventSubscriptionsService: EventSubscriptionsService,
    private alertsService: AlertsService
  ) {
    let extras = this.router.getCurrentNavigation().extras.state
    this._category = extras?._category || null;
    this._route = extras?._route || null;
    this._subscription = extras?._subscription || null;

    this.setupPage();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  setupPage() {
    this.getData();
  }

  async getData() {
    if (this._subscription) this.loadSubscription();
    if (this._category) this.loadCategory();
    if (this._route) this.loadRoute();

    this.loadCategories();
  }

  async loadCategories() {
    let data = await this.eventCategoriesService.getEventCategories({ _event: this._event, _race: this._race }, `
      _id
      _event
      _race  
      name
    `);
    this.categories = data || [];
    this.obj_categories = this.utils.mapObj(this.categories, '_id');
  }

  async loadSubscription() {
    let data = await this.eventSubscriptionsService.getEventSubscriptionById({ _id: this._subscription }, `
      _event
      _race
      _route  
    `);
    if (!data) return;

    this._event = data?._event || null;
    this._category = data?._category || null;
    this._route = data?._route || null;

    this.loadRoute();
  }

  async loadCategory() {
    let data = await this.eventCategoriesService.getEventCategoryById({ _id: this._subscription }, `
      _event
      _race
      routes{
        _id
      }
    `);

    if (data?.routes?.length == 1) {
      this._route = data.routes[0]._id;
      this.loadRoute();
    }
  }

  async loadRoute() {
    let data = await this.eventRoutesService.getEventRouteById({ _id: this._route }, `
      _event
      _race

      name
      dist
      climb
      n_pcs
      n_subs
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
    this.route = data || null;
    this.raceMap = data?.map;

    if (data?.categories?.length == 1)
      this._category = data.categories[0]._id;

    this.loadResults();
    setTimeout(() => {
      this.setupMap();
    }, 400);
  }

  // RENDERIZAÇÃO E CONFIGS NO MAPA
  async setupMap() {
    if (!this.raceMap) return;

    this.sync_points = (this.raceMap?.sync_points || []).map(it => {
      if (!it.latLng) it.latLng = {};
      if (!it.xy) it.xy = {};
      return it;
    });

    // MONTA MAPA GLOBAL
    this.leafletMap = L.map('mapViewer').setView(latLng(this.raceMap?.center?.lat || null, this.raceMap?.center?.lng || null), 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.leafletMap);


    let ptsGeo = this.sync_points.map(it => it.latLng)
    let ptsImg = this.sync_points.map(it => it.xy)

    // 3) Calcula a transformação
    let T = this.mapsService.computeImageToMapTransform(ptsGeo, ptsImg);

    let img: any = await this.utils.getImageSize(this.raceMap.file.url);
    if (!img) return;

    // 4) Converte cantos da imagem (por ex. 1024x768)
    const width = img.width;
    const height = img.height;

    const corners = this.mapsService.getImageCornersLatLng(T, width, height);

    this.overlayMap?.remove();
    var bounds = new L.LatLngBounds(corners.topLeft, corners.topRight).extend(corners.bottomRight);
    this.leafletMap.fitBounds(bounds);

    this.overlayMap = L.imageOverlay.rotated(this.raceMap.file.url, corners.topLeft, corners.topRight, corners.bottomLeft).addTo(this.leafletMap);

    setTimeout(() => {
      this.leafletMap.invalidateSize();
    }, 400);

    return Promise.resolve(null);
  }




  async loadResults() {
    let query: any = {};
    if (this._route) query._route = this._route;
    if (this._category) query._category = this._category;
    if (this._subscription) query._subscription = this._subscription;

    let data = await this.eventSubscriptionsService.getResultCategory(query);

    this.raw_ranking = (data || []).map(it => {
      it.obj_splits = {}
      it.splits = [
        { num_base: 'P1', time_spent: 0 },
        ...it.splits,
        { num_base: 'C1', time_spent: it.time },
      ]
      let spent = 0, i = 0;
      for (let sp of (it.splits || [])) {
        if (sp.time_spent) {
          sp.time_split = i == 0 ? sp.time_spent : sp.time_spent - spent;
          spent = sp.time_spent;
        }
        i++;
        it.obj_splits[sp.num_base] = sp;
      }

      return it;
    })

    this.duration = Math.max(...(data || []).map(it => it.time).filter(it => it));

    this.renderGraphFinal();
    this.updateProgress();
    return;
  }

  data_position_race_graph: any = [];

  isEnd: any = false;
  isPlaying: any = false;
  duration: any = 0;
  step: any = 1;
  speed: any = 50;
  intervalTime: any = 0;
  currentTime: any = 0;
  percent: any = 0;
  intervalId: any = null;


  updateProgress() {
    this.percent = (this.intervalTime / this.duration) * 100;
    this.setupRanking();
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.intervalId = setInterval(() => {
      this.intervalTime += this.speed * .1;
      this.currentTime = Math.round(this.intervalTime);
      if (this.intervalTime >= this.duration) {
        this.intervalTime = this.duration;
        this.stop();
      }
      this.updateProgress();
    }, 100);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.intervalId);
    this.setupRanking();
  }

  stop() {
    this.isEnd = true;
    this.pause();
  }

  handleClickProgress(ev: any) {
    if (!this.isPlaying) return;

    let bar = $('.progress-bar');
    const rect = bar[0].getBoundingClientRect();
    const clickX = ev.clientX - rect.left;   // posição do clique dentro da barra
    const percent = clickX / rect.width;        // percentual do clique
    this.intervalTime = Math.round(percent * this.duration);           // atualiza o tempo proporcional
  }

  handleClick() {
    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.isEnd)
        this.intervalTime = 0;

      this.start();
    }
  }

  getLastSplit(splits, X) {
    if (!Array.isArray(splits) || splits.length === 0) return null;
    // Filtra apenas os splits com time_spent <= X
    const validSplits = splits.filter(s => s.time_spent && s.time_spent <= X);
    // Se nenhum split foi alcançado ainda
    if (validSplits.length === 0) return null;
    // Pega o último split alcançado
    return validSplits[validSplits.length - 1];
  }

  filterCategory() {
    for (let it of this.raw_ranking)
        it.hide = this._category && it._category != this._category;

    this.setupRanking();
  }

  setupRanking() {
    let arr_pcs = ['P1', (this.route?.pcs || []).map(it => it.num_base), 'C1'];
    let obj_graph = {};

    // ATUALIZA ULTIMA POSIÇÃO DO ATLETA
    this.ranking = JSON.parse(JSON.stringify((this.raw_ranking || []))).filter(it => !it.hide).map(it => {
      // this.ranking = (this.ranking || []).filter(it => !it.hide).map(it => {
      let lastSplit = this.getLastSplit(it.splits, this.currentTime);
      if (lastSplit) {
        it.ult_time = lastSplit.time_spent;
        it.ult_base = lastSplit.num_base;
        it.base_index = arr_pcs.indexOf(it.ult_base);
      }
      return it;
    }).sort((a, b) => {
      // ORDENA O RANKING PELA POSIÇÃO DE PROVA
      if (a.base_index != b.base_index)
        return b.base_index - a.base_index;

      if (!a.race_pos) return 1;
      if (!b.race_pos) return -1;

      return a.race_pos - b.race_pos;
    }).map((it, i) => {


      if (!obj_graph[it._id]) obj_graph[it._id] = {
        splits: it.splits.filter(s => s.time_spent && s.time_spent <= this.currentTime),
      };


      it.race_pos = i + 1;
      return it;
    });

    // // ATUALIZA GRAFICO JUNTO COM O PROGRESSO
    if (this.isPlaying) {
      // console.log('mostra grafico decorrente');

      let graph = (this.ranking || []).map(r => {
        let obj = {
          name: r.name,
          race_pos: r.race_pos,
          splits: (r.splits || []).filter(s => s.num_base == 'P1' || (s.time_spent && s.time_spent <= this.currentTime))
        };

        return obj
      })
        .map(it => {

          return {
            name: it.name,
            series: it.splits.map(it => {
              return { name: it.num_base, value: it.num_base == 'P1' ? 0 : (it.race_pos || 0) + 1 }
            })
          }
        })
      this.data_position_race_graph = graph || [];
    } else {
      // console.log('mostra grafico final');
      this.renderGraphFinal();
    }

    return;

  }

  renderGraphFinal() {
    let group_by_split = {
      'C1': { num_base: 'C1', athletes: {} },
      'P1': { num_base: 'P1', athletes: {} }
    };
    for (let sp of (this.route?.pcs || [])) {
      group_by_split[sp.num_base] = { num_base: sp.num_base, athletes: {} };
    }

    for (let r of (this.raw_ranking || []).filter(it => !it.hide)) {
      for (let s of Object.keys(r.obj_splits || {})) {
        if (!group_by_split[s]) continue;

        group_by_split[s].athletes[r._id] = r.obj_splits[s];
        group_by_split[s].athletes[r._id]._id = r._id;
        group_by_split[s].athletes[r._id].status = r.status;
      }
    }

    for (let sp of Object.keys(group_by_split || {})) {
      let arr_race_position = Object.values(group_by_split[sp].athletes || {}).sort((a: any, b: any) => {
        if (a.status == b.status)
          return a.time_spent - b.time_spent;
        return a.status > b.status ? -1 : 1;
      });
      let arr_split_position = Object.values(group_by_split[sp].athletes || {}).sort((a: any, b: any) => a.time_split - b.time_split).map((it: any) => it._id);


      for (let k of Object.keys(group_by_split[sp].athletes || {})) {
        if (!group_by_split[sp].athletes[k]) continue;


        group_by_split[sp].athletes[k].race_pos = sp == 'P1' ? -1 : arr_race_position.map((it: any) => it._id).indexOf(k);
        group_by_split[sp].athletes[k].split_pos = sp == 'P1' ? -1 : arr_split_position.indexOf(k);
      }
    }

    // POSIÇÃO NA PROVA
    let graph = (this.raw_ranking || []).filter(it => !it.hide).map(r => {
      return {
        name: r.name, series: (r.splits || []).map(it => {
          let race_pos = group_by_split[it.num_base]?.athletes[r._id]?.race_pos;
          if (!group_by_split[it.num_base]?.athletes[r._id])
            race_pos = Object.keys(group_by_split[it.num_base]?.athletes || {})?.length;

          return { name: it.num_base, value: race_pos + 1 };
        })
      }
    })
    this.data_position_race_graph = graph;
  }

}
