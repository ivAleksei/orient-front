import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { PersonsService } from 'src/apps/baseorient/_shared/providers/persons.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.page.html',
  styleUrls: ['./person-details.page.scss'],
})
export class PersonDetailsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild('PersonDetailForm') PersonDetailForm: any;

  tab: any = 'personal';
  _id: any = null;


  tableInfoSubscriptions: any = {
    id: `table-event-subscription-${this._id}`,
    columns: [
      { title: 'Date', data: "start_at", datatype: 'pipe', pipe: "DatePipe", options: "DD/MM/YYYY HH:mm" },
      { title: 'Num Start', data: "startnumber" },
      { title: 'Category', data: "category" },
      { title: 'Race', data: "race" },
      { title: 'Club', data: "club" },
      { title: 'Control', data: "controlcard" },
      {
        title: 'Pos', data: "pos", render: (a, b, c) => {
          return c.pos || c.status;
        }
      },
      { title: 'Time', data: "time", datatype: 'pipe', pipe: "TimePipe" },
    ],
    data: [],
    actions: {
      buttons: [
        // { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" }, // TODO
        { action: "result", tooltip: "Extrato", class: "btn-warning", icon: "mdi mdi-file-document" }, // TODO
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private route: ActivatedRoute,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private personsService: PersonsService,
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params: any) => {
      this._id = params?.id || null;

      this.tableInfoSubscriptions.ajax = {
        url: `${environment.API.orient}/server_side/event-subscriptions?pers=` + this._id,
      }

      this.reloadTable.next(true);
      this.loadPersonDetail();
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
    this.loadPersonDetail();
  }

  /**
   * loadPersonDetail: Método que busca as viaturas para o autocomplete.
   */
  async loadPersonDetail() {
    this.loadingService.show();
    let data = await this.personsService.getPersonInfo(this._id, ``);
    this.loadingService.hide();
  }

  handleTable(ev) {
    let map = {
      result: args => this.nav.navigateForward(['/internal/admin/result', ev.data._id])
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.PersonDetailForm.value);
    this.personsService.savePerson(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

}
