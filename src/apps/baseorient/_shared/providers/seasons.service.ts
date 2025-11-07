import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonsService {
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

  async getSeasons(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Seasons{
        Seasons{
          _id
        }
      }`,
      name: "Seasons",
      variables: args || {}
    });
  }
  async getSeasonById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query SeasonById($_id: String){
        SeasonById(_id: $_id){
          _id
        }
      }`,
      name: "SeasonById",
      variables: args || {}
    });
  }

  newSeason(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateSeason($input: SeasonInput){
        CreateSeason(input: $input){
          status
          msg
        }
      }`,
      name: "CreateSeason",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editSeason(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateSeason($input: SeasonInput){
        UpdateSeason(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateSeason",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delSeason(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteSeason($_id: ID){
          deleteSeason(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteSeason",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveSeason(data) {
    return this[data._id ? 'editSeason' : "newSeason"]({ input: data });
  }

}