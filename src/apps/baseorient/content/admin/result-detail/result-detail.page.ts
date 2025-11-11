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
    this.result?.splits.push({ num_base: this.i18n.lang.FINISH, time_spent: data.time });

    this.getRouteResults();
    this.setupData();
    this.loadingService.hide();
  }

  same_route: boolean;
  data_results: any = [];

  async getRouteResults() {
    let query: any = { _category: this.result?.category?._id };
    if (this.same_route)
      query = { _route: this.result?.category?._route }

    this.loadingService.show();
    let data = await this.eventSubscriptionsService.getResultCategory(query);
    this.loadingService.hide();

    this.data_results = (data || []).map(it => {
      it.show = it._person == this.result?._person;
      it.obj_splits = {}
      it.splits.push({ num_base: this.i18n.lang.FINISH, time_spent: it.time });
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
    }).sort((a, b) => {
      // CLASSIFICA POR POSICAO
      if (a.pos && b.pos)
        return a.pos - b.pos;

      return a.status > b.status ? -1 : 1;
    })
    this.setupChartRoute();
  }

  type_graph: any = 'position_race';
  data_splits_graph: any = [];
  data_race_graph: any = [];
  data_position_race_graph: any = [];
  data_position_split_graph: any = [];
  data_time_spent_graph: any = [];
  data_time_split_graph: any = [];

  setShowAll(status: boolean) {
    for (let r of this.data_results || [])
      r.show = status;

    this.setupChartRoute();
  }

  setupChartRoute() {
    let group_by_split = {};
    for (let sp of (this.result?.splits || [])) {
      group_by_split[sp.num_base] = { num_base: sp.num_base, athletes: {} };
    }

    for (let r of (this.data_results || [])) {
      for (let s of Object.keys(r.obj_splits || {})) {
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
        group_by_split[sp].athletes[k].race_pos = arr_race_position.map((it: any) => it._id).indexOf(k);
        group_by_split[sp].athletes[k].split_pos = arr_split_position.indexOf(k);
      }
    }


    // POSIÇÃO NA PROVA
    this.data_position_race_graph = (this.data_results || []).filter(it => it.show).map(r => {
      return {
        name: r.name, series: [{ name: '0', value: 0 }, ...(this.result?.splits || []).map(it => {
          return { name: it.num_base, value: group_by_split[it.num_base].athletes[r._id].race_pos + 1 };
        })]
      }
    })
    // POSIÇÃO NO SPLIT - OK
    this.data_position_split_graph = (this.data_results || []).filter(it => it.show).map(r => {
      return {
        name: r.name, series: [{ name: '0', value: 0 }, ...(this.result?.splits || []).map(it => {
          return { name: it.num_base, value: group_by_split[it.num_base].athletes[r._id].split_pos + 1 };
        })]
      }
    })
    // TEMPO DE PROVA - OK
    this.data_time_spent_graph = (this.data_results || []).filter(it => it.show).map((r, i) => {
      return {
        name: r.name, series: [{ name: '0', value: 0 }, ...(this.result?.splits || []).map(it => {
          return { name: it.num_base, value: r.obj_splits[it.num_base]?.time_spent || 0 };
        })]
      }
    })
    // TEMPO NO SPLIT - OK
    this.data_time_split_graph = (this.data_results || []).filter(it => it.show).map((r, i) => {
      return {
        name: r.name, series: [{ name: '0', value: 0 }, ...(this.result?.splits || []).map(it => {
          return { name: it.num_base, value: r.obj_splits[it.num_base]?.time_split || 0 };
        })]
      }
    })

  }

  setupData() {
    let spent = 0;
    this.result.splits = (this.result?.splits || []).map((it, i) => {
      it.index = i + 1;
      it.time_partial = i == 0 ? it.time_spent : it.time_spent - spent;
      spent = it.time_spent;

      it.pace = it.dist_partial > 0 ? it.time_partial / it.dist_partial : 0;

      if (!this.best_split || (it.num_base != this.i18n.lang.FINISH && (it.pace < this.best_split?.pace || it.time_partial < this.best_split?.time_partial)))
        this.best_split = it;
      if (!this.poor_split || (it.pace > this.poor_split?.pace || it.time_partial > this.poor_split?.time_partial))
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



  }

}
