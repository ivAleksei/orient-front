import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { I18nService } from 'src/_shared/services/i18n.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { RolesService } from 'src/_shared/providers/roles.service';
import { PermissionsService } from 'src/_shared/providers/permissions.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
})
export class RolesPage implements OnInit {
  @Output() public clearEvent: EventEmitter<any> = new EventEmitter();
  @Output() public reloadTable: EventEmitter<any> = new EventEmitter();
  @ViewChild("modalRole") modalRole: any;
  @ViewChild('RoleForm') RoleForm: any;
  list_roles: any[] = [];
  _permissions: any = [];
  obj_permissions: any = {};
  arr_permissions: any[] = [];

  tableInfo: any = {
    id: "table-roles",
    columns: [
      { title: 'Slug', data: "slug" },
    ],
    ajax: {
      url: `${environment.API.admin}/server_side/roles`,
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
    private permissionsService: PermissionsService,
    private rolesService: RolesService,
    private alertsService: AlertsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getData();
  }

  getData() {
    this.getPermissions();
  }

  async getPermissions() {
    let data = await this.permissionsService.getPermissions();
    this.arr_permissions = data || [];

    this.obj_permissions = {};
    for (let it of (data || []))
      this.obj_permissions[it.slug] = it;

  }

  setPermission(ev: any) {
    if (!ev) return;

    this._permissions.push(ev);
    let obj = Object.assign({}, this.RoleForm.value);
    let payload = {
      _id: obj._id,
      _permissions: (this._permissions || []).map(it => it.slug || it)
    }
    this.rolesService.saveRole(payload)
      .then(data => {
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this._permissions = (this._permissions || []).map(k => this.obj_permissions[k.slug || k]);
        this.clear();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  rmPermission(ev: any) {
    let _permissions = (this._permissions || []).filter(it => it != ev).map(it => it.slug || it)
    let obj = Object.assign({}, this.RoleForm.value);
    let payload = {
      _id: obj._id,
      _permissions: _permissions
    }
    this.rolesService.saveRole(payload)
      .then(data => {
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this._permissions = (_permissions || []).map(k => this.obj_permissions[k.slug || k]);
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
        this.modalRole.present();
        setTimeout(() => {
          this.RoleForm.form.patchValue(ev.data);
          this._permissions = (ev.data?._permissions || []).map(k => this.obj_permissions[k]);
        }, 400);
      },
      new: () => {
        this.modalRole.present();
      },
      del: () => {
        this.rolesService.delRole(ev.data)
          .then(data => {
            if (data?.status != 'success')
              return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_REMOVE_ERR });

            this.clearRoleForm();
            return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_REMOVE_SUCCESS });
          });
      },
    }

    return map[ev.action](ev.data);
  }

  saveForm() {
    let obj = Object.assign({}, this.RoleForm.value);
    obj._permissions = this._permissions || [];

    this.rolesService.saveRole(obj)
      .then(data => {
        if (data?.status != 'success')
          return this.alertsService.notify({ type: "error", subtitle: this.i18n.lang.CRUD_UPDATE_ERR });

        this.clearRoleForm();
        return this.alertsService.notify({ type: "success", subtitle: this.i18n.lang.CRUD_UPDATE_SUCCESS });
      });
  }

  clearRoleForm() {
    this._permissions = [];
    this.RoleForm?.form.reset();
    this.closeModal();
    this.reloadTable.next(true);
  }

  closeModal() {
    this.modalRole.dismiss();
  }

}
