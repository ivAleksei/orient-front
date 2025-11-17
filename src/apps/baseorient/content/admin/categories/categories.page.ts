import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { EventCategoriesService } from 'src/apps/baseorient/_shared/providers/event-categories.service';
import { EventRacesService } from 'src/apps/baseorient/_shared/providers/event-races.service';
import { EventRoutesService } from 'src/apps/baseorient/_shared/providers/event-routes.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalCategory") modalCategory: any;
  @ViewChild('CategoryForm') CategoryForm: any;
  list_races: any[] = [];
  list_categories: any[] = [];

  tableInfo: any = {
    id: "table-categories",
    columns: [
      { title: 'Name', data: "name" },
      { title: 'Event', data: "event.name" },
      { title: 'Date', data: "event.dt_start", datatype: 'pipe', pipe: "DatePipe", options: 'DD/MM/YYYY HH:mm' },
      {
        title: 'Route', data: "routes", render: (a, b, c) => {
          return (c.routes || []).map(r => r.name).join(', ')
          // return (c.routes || []).map(r => `<a href="javascript:void(0)" target="_blank">${r.name}</a>`).join(', ')
        }
      },
    ],
    data: [],
    actions: {
      buttons: [
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" },
        { action: "newroute", tooltip: "Criar Rota", class: "btn-danger", icon: "mdi mdi-routes", conditional: args => !args.routes?.length },
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private eventRoutesService: EventRoutesService,
    private eventRacesService: EventRacesService,
    private categoriesService: EventCategoriesService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.getRaces();
    this.getCategories();
  }

  async getRaces() {
    let data = await this.eventRacesService.getEventRaces({}, `
      _event
      dt_start
      name
    `);
    this.list_races = data || [];
  }

  async getCategories() {
    let data = await this.categoriesService.getEventCategories({}, `
      _event
      _race
      name
      event{
        _id
        dt_start
        name
      }
      routes{
        _id
        name
      }
    `);
    this.tableInfo.data = data || [];
    this.reloadTable.next(true)
  }

  setRace() {
    let obj = Object.assign({}, this.CategoryForm.value);
    let race = this.list_races.find(it => it._id == obj._race);
    this.CategoryForm.form.patchValue({ _event: race?._event || null });
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalCategory.present();
        setTimeout(() => {
          this.CategoryForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalCategory.present();
      },
      newroute: async () => {
        let confirm = await this.alertsService.askConfirmation(this.i18n.lang.NEW_EVENT_ROUTE, '...');
        if (confirm == 'false') return;

        console.log('cria rota');
        await this.eventRoutesService.saveEventRoute({ _event: ev.data._event, _race: ev.data._race, _categories: [ev.data._id], name: ev.data.name })
          .then(data => {
            this.loadingService.hide();
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

            this.clearCategoryForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
          });
      },
      del: () => {
        this.categoriesService.delEventCategory(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearCategoryForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    if (map[ev.action])
      return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.CategoryForm.value);
    this.categoriesService.saveEventCategory(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearCategoryForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearCategoryForm() {
    this.CategoryForm?.form.reset();
    this.closeModal();
    this.getCategories();
  }

  closeModal() {
    this.modalCategory.dismiss();
  }

}
