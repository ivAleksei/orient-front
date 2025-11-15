import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';
import { HttpService } from 'src/_shared/services/http.service';

@Injectable({
  providedIn: 'root'
})
export class MapsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private http: HttpService,
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

  async getMaps(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Maps{
        Maps{
          _id
          ${fields}
        }
      }`,
      name: "Maps",
      variables: args || {}
    });
  }
  async getMapById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query MapById($_id: String){
        MapById(_id: $_id){
          _id
        }
      }`,
      name: "MapById",
      variables: args || {}
    });
  }

  newMap(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateMap($input: MapInput){
        CreateMap(input: $input){
          status
          msg
        }
      }`,
      name: "CreateMap",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editMap(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateMap($input: MapInput){
        UpdateMap(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateMap",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delMap(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteMap($_id: ID){
          deleteMap(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteMap",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveMap(data) {
    return this[data._id ? 'editMap' : "newMap"]({ input: data });
  }

}