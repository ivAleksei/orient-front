import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { SeasonsService } from 'src/apps/baseorient/_shared/providers/seasons.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-seasons',
  templateUrl: './seasons.page.html',
  styleUrls: ['./seasons.page.scss'],
})
export class SeasonsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalSeason") modalSeason: any;
  @ViewChild('SeasonForm') SeasonForm: any;
  list_seasons: any[] = [];

  tableInfo: any = {
    id: "table-seasons",
    columns: [
      { title: 'Name', data: "name" },
    ],
    ajax: {
      url: `${environment.API.orient}/server_side/seasons`,
    },
    actions: {
      buttons: [
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private seasonsService: SeasonsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadSeason();
  }

  /**
   * loadSeason: Método que busca as viaturas para o autocomplete.
   */
  async loadSeason() {
    this.loadingService.show();
    let data = await this.seasonsService.getSeasons();
    this.loadingService.hide();
    this.list_seasons = (data || []).map(it => {
      it.label = [it.prefixo, it.placa].join(' - ');
      return it;
    });
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalSeason.present();
        setTimeout(() => {
          this.SeasonForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalSeason.present();
      },
      del: () => {
        this.seasonsService.delSeason(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearSeasonForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.SeasonForm.value);
    this.seasonsService.saveSeason(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearSeasonForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearSeasonForm() {
    this.SeasonForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalSeason.dismiss();
  }

}
