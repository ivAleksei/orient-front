import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { PersonsService } from 'src/apps/baseorient/_shared/providers/persons.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-persons',
  templateUrl: './persons.page.html',
  styleUrls: ['./persons.page.scss'],
})
export class PersonsPage implements OnInit {
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalPerson") modalPerson: any;
  @ViewChild('PersonForm') PersonForm: any;
  list_persons: any[] = [];

  tableInfo: any = {
    id: "table-persons",
    columns: [
      { title: 'CBO', data: "num_cbo" },
      { title: 'Helga', data: "_helga" },
      { title: 'Name', data: "name" },
      { title: 'Club', data: "clube.slug" },
      { title: 'Federation', data: "federation.slug" },
      { title: 'Confederation', data: "confederation.slug" },
    ],
    ajax: {
      url: `${environment.API.admin}/server_side/persons`,
    },
    actions: {
      buttons: [
        { action: "detail", tooltip: "Detalhe", class: "btn-light", icon: "mdi mdi-newspaper" },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private nav: NavController,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private personsService: PersonsService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.loadPerson();
  }

  /**
   * loadPerson: Método que busca as viaturas para o autocomplete.
   */
  async loadPerson() {
    this.loadingService.show();
    let data = await this.personsService.getPersons();
    this.loadingService.hide();
    this.list_persons = (data || []).map(it => {
      it.label = [it.prefixo, it.placa].join(' - ');
      return it;
    });
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalPerson.present();
        setTimeout(() => {
          this.PersonForm.form.patchValue(ev.data);
        }, 400);
      },
      new: () => {
        this.modalPerson.present();
      },
      detail: () => {
        this.nav.navigateForward(['/internal/admin/person/', ev.data._id]);
      },
      del: () => {
        this.personsService.delPerson(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearPersonForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.PersonForm.value);
    this.personsService.savePerson(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearPersonForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearPersonForm() {
    this.PersonForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalPerson.dismiss();
  }

}
