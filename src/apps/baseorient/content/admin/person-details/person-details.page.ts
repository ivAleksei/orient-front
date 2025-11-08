import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { PersonsService } from 'src/apps/baseorient/_shared/providers/persons.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.page.html',
  styleUrls: ['./person-details.page.scss'],
})
export class PersonDetailsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild('PersonDetailForm') PersonDetailForm: any;

  tab: any;
  _id: any;

  constructor(
    public i18n: I18nService,
    private route: ActivatedRoute,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private personsService: PersonsService,
    private alertsService: AlertsService
  ) {
    this.route.params.subscribe((params: any) => {
      this._id = params?.id || null;
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
