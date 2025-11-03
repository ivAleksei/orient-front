import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private loadingService: LoadingService,
    private alertsService: AlertsService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }
  trigger() {
    this._watch.next(true);
  }

  async getPermissions(args?) {
    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      query Permissions{
        Permissions{
          _id
        }
      }`,
      name: "Permissions",
      variables: args || {}
    });
  }
  async getPermissionById(args?) {
    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      query PermissionById($_id: String){
        PermissionById(_id: $_id){
          _id
        }
      }`,
      name: "PermissionById",
      variables: args || {}
    });
  }

  newPermission(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      mutation CreatePermission($input: PermissionInput){
        CreatePermission(input: $input){
          status
          msg
        }
      }`,
      name: "CreatePermission",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editPermission(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      mutation UpdatePermission($input: PermissionInput){
        UpdatePermission(input: $input){
          status
          msg
        }
      }`,

      name: "UpdatePermission",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delPermission(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.admin, 'graphql', {
          query: `
        mutation deletePermission($_id: String){
          deletePermission(_id: $_id){
            status
            msg
          }
        }`,
          name: "deletePermission",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  savePermission(data) {
    return this[data._id ? 'editPermission' : "newPermission"]({ input: data });
  }

}