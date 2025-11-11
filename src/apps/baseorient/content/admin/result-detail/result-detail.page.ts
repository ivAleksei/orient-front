import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TimePipe } from 'src/_shared/pipes/time.pipe';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { EventSubscriptionsService } from 'src/apps/baseorient/_shared/providers/event-subscriptions.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-result-detail',
  templateUrl: './result-detail.page.html',
  styleUrls: ['./result-detail.page.scss'],
})
export class ResultDetailPage implements OnInit {
  _id: any = null;
  result: any;

  data_graph_splits: any[] = [];
  data_graph_pace: any[] = [];

  best_split: any;
  poor_split: any;
  public_url: any;

  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    public timePipe: TimePipe,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private eventSubscriptionsService: EventSubscriptionsService,
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params: any) => {
      this._id = params?.id || null;
      this.public_url = [environment.portal.url, '#', 'result', this._id].join('/');
      this.loadResultDetail();
    })
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
  }

  getData() {
  }

  async loadResultDetail() {
    this.loadingService.show();
    let data = await this.eventSubscriptionsService.getEventSubscriptionById({ _id: this._id });
    this.result = data || [];
    this.setupData();
    this.loadingService.hide();
  }

  setupData() {
    let spent = 0;
    this.result.splits = (this.result?.splits || []).map((it, i) => {
      it.index = i + 1;
      it.time_partial = i == 0 ? it.time_spent : it.time_spent - spent;
      spent = it.time_spent;

      it.pace = it.dist_partial > 0 ? it.time_partial / it.dist_partial : 0;

      if (!this.best_split || it.pace < this.best_split?.pace || it.time_partial < this.best_split?.time_partial)
        this.best_split = it;
      if (!this.poor_split || it.pace > this.poor_split?.pace || it.time_partial > this.poor_split?.time_partial)
        this.poor_split = it;

      return it;
    });

    this.data_graph_splits = (this.result?.splits || []).map(it => {
      return {
        name: this.i18n.lang.TIME_PARTIAL, series: [
          { name: it.index, value: it.time_partial },
        ]
      }
    })
    this.data_graph_pace = (this.result?.splits || []).map(it => {
      return {
        name: this.i18n.lang.PACE, series: [
          { name: it.index, value: it.pace || 0 },
        ]
      }
    })

    console.log(this.result);


  }

}
