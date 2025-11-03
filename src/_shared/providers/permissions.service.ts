import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }

  trigger() {
    this._watch.next(true);
  }

  async getPermissions(environment) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query Permissions{
        Permissions{
          _id
        }
      }`,
      name: "Permissions",
      variables: {}
    });
  }

  async getPermissionById(environment, _id) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query PermissionById($_id: String){
        PermissionById(_id: $_id){
          _id
        }
      }`,
      name: "PermissionById",
      variables: { _id: _id }
    });
  }

  editPermission(environment, data) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation UpdatePermission(
        $input: PermissionInput
      ){
        UpdatePermission(
          input: $input,
        ){
          status
        }
      }`,
      name: "UpdatePermission",
      variables: data
    });
  }

  delPermission(environment, data) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation deletePermission($_id: String){
        deletePermission(_id: $_id){
          status
        }
      }`,
      name: "deletePermission",
      variables: data
    });
  }

  savePermission(environment, data) {
    return this.editPermission(environment, { input: data });
  }
}