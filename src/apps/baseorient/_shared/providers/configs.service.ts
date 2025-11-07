import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigsService {
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

  async getConfigs(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Configs{
        Configs{
          _id
        }
      }`,
      name: "Configs",
      variables: args || {}
    });
  }
  async getConfigById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query ConfigById($_id: String){
        ConfigById(_id: $_id){
          _id
        }
      }`,
      name: "ConfigById",
      variables: args || {}
    });
  }

  newConfig(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateConfig($input: ConfigInput){
        CreateConfig(input: $input){
          status
          msg
        }
      }`,
      name: "CreateConfig",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editConfig(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateConfig($input: ConfigInput){
        UpdateConfig(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateConfig",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delConfig(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteConfig($_id: ID){
          deleteConfig(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteConfig",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveConfig(data) {
    return this[data._id ? 'editConfig' : "newConfig"]({ input: data });
  }

}