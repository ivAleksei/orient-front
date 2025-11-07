import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { HttpService } from 'src/_shared/services/http.service';
import { LoadingService } from 'src/_shared/services/loading.service';
import { environment } from 'src/apps/baseorient/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private alertsService: AlertsService,
    private loadingService: LoadingService,
    private http: HttpService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }

  trigger() {
    this._watch.next(true);
  }

  getUserInfo(args, fields) {
    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      query UserById($_id: ID){
        UserById(_id: $_id){
          _id
          ${fields}
        }
      }`,
      name: "UserById",
      variables: args
    });
  }

  getUsers(args?) {
    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      query Users{
        Users{
          _id
        }
      }`,
      name: "Users",
      variables: args || {}
    });
  }

  newUser(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      mutation CreateUser(
        $input: UserInput!
      ){
        CreateUser(
          input: $input
        ){
          msg
          status
        }
      }`,
      name: "CreateUser",
      variables: data
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  editUser(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.admin, 'graphql', {
      query: `
      mutation UpdateUser(
        $input: UserInput!
      ){
        UpdateUser(
          input: $input
        ){
          msg
          status
        }
      }`,
      name: "UpdateUser",
      variables: data
    }).then(data => {
      this.loadingService.hide();
      return data;
    })
  }

  delUser(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.admin, 'graphql', {
          query: `
          mutation deleteUser($_id: ID){
            deleteUser(_id: $_id){
            status
            msg
          }
          }`,
          name: "deleteUser",
          variables: data
        }).then(data => {
          this.loadingService.hide();
          return data;
        })
      })
  }

  saveUser(data) {
    return this[data._id ? 'editUser' : "newUser"]({input: data});
  }
}
