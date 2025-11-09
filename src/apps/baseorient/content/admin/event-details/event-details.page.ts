import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { NavController } from '@ionic/angular';
import { StatusPipe } from 'src/_shared/pipes/status.pipe';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from 'src/apps/baseorient/_shared/providers/events.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.page.html',
  styleUrls: ['./event-details.page.scss'],
})
export class EventDetailsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
    @ViewChild('EventDetailForm') EventDetailForm: any;
  
    tab: any = 'info';
    _id: any = '';
    event: any;
  
    tableInfoAthletes: any = {
      id: `table-event-athletes-${this._id}`,
      columns: [
        { title: 'CBO', data: "num_cbo" },
        { title: 'Helga', data: "_helga" },
        { title: 'Name', data: "name" },
        { title: 'Club', data: "clube.slug" },
      ],
      data: [],
      actions: {
        buttons: [
          { action: "detail-athlete", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
        ]
      }
    }
  
    tableInfoAudits: any = {
      id: `table-event-audit-${this._id}`,
      columns: [
        { title: 'Event', data: "" },
      ],
      data: [],
      actions: {
        buttons: [
          { action: "detail-athlete", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
        ]
      }
    }
  
    constructor(
      public i18n: I18nService,
      private nav: NavController,
      private StatusPipe: StatusPipe,
      private route: ActivatedRoute,
      private utils: UtilsService,
      private loadingService: LoadingService,
      private eventsService: EventsService,
      private alertsService: AlertsService
    ) {
      this.route.params.subscribe((params: any) => {
        this._id = params?.id || null;
  
        this.tableInfoAthletes.ajax = {
          url: `${environment.API.orient}/server_side/athletes?conf=` + this._id,
        }

        this.reloadTable.next(true);
        this.loadEventDetail();
      })
    }
    ngOnInit() {
    }
  
    ionViewWillEnter() {
      this.getData();
    }
  
    setTab(ev) {
      let new_val = ev?.detail?.value || ev;
      if (new_val != this.tab) this.tab = new_val;
    }
  
    getData() {
    }
  
    /**
     * loadEventDetail: Método que busca as viaturas para o autocomplete.
     */
    async loadEventDetail() {
      this.loadingService.show();
      let data = await this.eventsService.getEventById({ _id: this._id });
      this.event = data || null;
      this.loadingService.hide();
    }
  
    handleTable(ev) {
      let map = {
        "detail-athlete": () => {
          this.nav.navigateForward(['/internal/admin/person/', ev.data._id]);
        },
      }
  
      return map[ev.action](ev.data);
    }
  
    saveForm() {
      this.loadingService.show();
      let obj = Object.assign({}, this.EventDetailForm.value);
      this.eventsService.saveEvent(obj)
        .then(data => {
          this.loadingService.hide();
          if (data?.status != 'success')
            return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });
  
          return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
        });
    }
  
  }
  