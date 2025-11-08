import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { UsersService } from 'src/apps/baseorient/_shared/providers/users.service';
import { PersonsService } from 'src/apps/baseorient/_shared/providers/persons.service';
import { RolesService } from 'src/_shared/providers/roles.service';
import md5 from 'md5';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  @Output() public clearEvent: EventEmitter<any> = new EventEmitter();
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalUser") modalUser: any;
  @ViewChild('UserForm') UserForm: any;
  list_users: any[] = [];
  arr_persons: any[] = [];
  _roles: any[] = [];
  arr_roles: any[] = [];
  obj_roles: any = {};

  tableInfo: any = {
    id: "table-users",
    columns: [
      { title: 'Username', data: "username" },
      { title: 'Person', data: "person.name" },
    ],
    ajax: {
      url: `${environment.API.admin}/server_side/users`,
    },
    actions: {
      buttons: [
        { action: "reset", tooltip: "Resetar Senha", class: "btn-warning", icon: "mdi mdi-account-key", },
        { action: "edit", tooltip: "Editar", class: "btn-info", icon: "mdi mdi-pencil" },
        { action: "del", tooltip: "Remove", class: "btn-danger", icon: "mdi mdi-close" }
      ]
    }
  }

  constructor(
    public i18n: I18nService,
    private utils: UtilsService,
    private loadingService: LoadingService,
    private personsService: PersonsService,
    private rolesService: RolesService,
    private usersService: UsersService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.getPersons();
    this.getRoles();
  }

  async getRoles() {
    let data = await this.rolesService.getRoles();
    this.arr_roles = data || [];

    this.obj_roles = {};
    for (let it of (data || []))
      this.obj_roles[it.slug] = it;
  }

  async getPersons() {
    let data = await this.personsService.getPersons();
    this.arr_persons = data || [];
  }


  setRole(ev: any) {
    if (!ev) return;

    this._roles.push(ev);
    let obj = Object.assign({}, this.UserForm.value);
    let payload = {
      _id: obj._id,
      _profiles: (this._roles || []).map(it => it.slug || it)
    }
    this.usersService.saveUser(payload)
      .then(data => {
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this._roles = (this._roles || []).map(k => this.obj_roles[k.slug || k]);
        this.clear();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  rmRole(ev: any) {
    let _roles = (this._roles || []).filter(it => it != ev).map(it => it.slug || it)
    let obj = Object.assign({}, this.UserForm.value);
    let payload = {
      _id: obj._id,
      _profiles: _roles
    }
    this.usersService.saveUser(payload)
      .then(data => {
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this._roles = (_roles || []).map(k => this.obj_roles[k.slug || k]);
        this.clear();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clear() {
    this.reloadTable.next(true);
    this.clearEvent.next(true);
  }

  handleTable(ev) {
    let map = {
      edit: () => {
        this.modalUser.present();
        setTimeout(() => {
          this.UserForm.form.patchValue(ev.data);
          this._roles = (ev.data?._profiles || []).map(k => this.obj_roles[k]);
        }, 400);
      },
      new: () => {
        this.modalUser.present();
      },
      reset: () => this.resetPassword(ev.data),
      del: () => {
        this.usersService.delUser(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearUserForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  async resetPassword(obj) {
    console.log(obj);
    
    let confirm = await this.alertsService.askConfirmation(this.i18n.lang.RESET_PASSWORD, this.i18n.lang.RESET_PASSWORD_TEXT)
    if (!confirm) return;

    let payload = { _id: obj._id, password: md5("mudar123") };

    return this.usersService.saveUser(payload)
      .then(data => {
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clear();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  saveForm() {
    this.loadingService.show();
    let obj = Object.assign({}, this.UserForm.value);
    this.usersService.saveUser(obj)
      .then(data => {
        this.loadingService.hide();
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearUserForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearUserForm() {
    this.UserForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalUser.dismiss();
  }

}
