import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private alertsService: AlertsService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }
  trigger() {
    this._watch.next(true);
  }

  async getUsers() {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query Users{
        Users{
          _id
          username
        }
      }`,
      name: "Users",
      variables: {}
    });
  }

  async getUserById(_id) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      query UserById($_id: ID){
        UserById(_id: $_id){
          _id
          _roles
        }
      }`,
      name: "UserById",
      variables: { _id }
    });
  }

  setRoles(data) {
    return this.graphql.query(environment.API.url, 'graphql', {
      query: `
      mutation setRoles($input: UserRolesInput){
        setRoles(input: $input){
          status
        }
      }`,
      name: "setRoles",
      variables: data
    });
  }
}