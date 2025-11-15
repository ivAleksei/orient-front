import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { EventSubscriptionsService } from '../../_shared/providers/event-subscriptions.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-run-viewer',
  templateUrl: './run-viewer.page.html',
  styleUrls: ['./run-viewer.page.scss'],
})
export class RunViewerPage implements OnInit {

  @Input() live: boolean;

  @Input() _subscription: any;
  @Input() same_route: any;

  @Input() _event: any;
  @Input() _category: any;
  @Input() _route: any;

  route_ref: any = null;

  isEnd: any = false;
  isPlaying: any = false;
  duration: any = 0;
  step: any = 1;
  speed: any = 50;
  intervalTime: any = 0;
  currentTime: any = 0;
  percent: any = 0;
  intervalId: any = null;
  ranking: any = [];
  data: any;

  constructor(
    public i18n: I18nService,
    private utils: UtilsService,
    private router: Router,
    private loadingService: LoadingService,
    private eventSubscriptionsService: EventSubscriptionsService,
    private alertsService: AlertsService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this._subscription = this.router.getCurrentNavigation().extras.state._subscription || null;
      this.setupPage();
    }
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  setupPage() {
    this.getData();
  }

  async getData() {
    this.loadSubscription();
  }

  async loadSubscription() {
    let data = await this.eventSubscriptionsService.getEventSubscriptionById({ _id: this._subscription });
    if (!data) return;

    this._event = data._event;
    this._category = data._category;
    this.route_ref = data.route_ref;
    this.loadRoute();
    await this.loadResults();
  }

  async loadRoute() {
    let data = await this.eventSubscriptionsService.getEventRouteBy({ _event: this._event, route_ref: this.route_ref });
    console.log(data);
  }

  async loadResults() {
    let query: any = {};
    if (this._subscription)
      query._subscription = this._subscription;

    if (this.same_route)
      query.same_route = true;

    this.data = await this.eventSubscriptionsService.getResultCategory(query);

    this._event = this.data?._event || null;
    this._category = this.data?._category || null;
    this.route_ref = this.data?.route_ref || null;

    await this.setupResults();
    this.updateProgress();
    return;
  }

  async setupResults() {
    this.duration = Math.max(...(this.data || []).map(it => it.time).filter(it => it));
  }

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

  setupRanking() {
    let ranking = (this.data || []);
    this.ranking = (ranking || [])
      .map(it => {

        let lastSplit = this.getLastSplit(it.splits, this.currentTime);
        if (lastSplit) {
          it.ult_time = lastSplit.time_spent;
          it.ult_base = lastSplit.num_base;
          it.pos;
        }

        return it;
      })
      .sort((a, b) => {

        if (!a.pos) return 1;
        if (!b.pos) return -1;

        return a.pos - b.pos;
      });

  }

}
