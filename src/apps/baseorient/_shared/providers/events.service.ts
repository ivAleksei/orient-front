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
export class EventsService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private loadingService: LoadingService,
    private alertsService: AlertsService,
    private http: HttpService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }
  trigger() {
    this._watch.next(true);
  }

  async syncHelga(_helga) {
    if (!_helga) return null;

    let query = { _lauf: _helga }
    let url = [environment.API.orient, 'tmp', 'helga'].join('/') + '?' + Object.keys(query).map(k => `${k}=${query[k]}`);
    return this.http.get(url);
  }

  async getEvents(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Events{
        Events{
          _id
          ${fields}
        }
      }`,
      name: "Events",
      variables: args || {}
    });
  }
  async getEventById(args: any, fields?: any) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventById($_id: ID){
        EventById(_id: $_id){
          _id
          ${fields}
        }
      }`,
      name: "EventById",
      variables: args || {}
    });
  }

  newEvent(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateEvent($input: EventInput){
        CreateEvent(input: $input){
          status
          msg
        }
      }`,
      name: "CreateEvent",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editEvent(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateEvent($input: EventInput){
        UpdateEvent(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateEvent",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delEvent(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteEvent($_id: ID){
          deleteEvent(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteEvent",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveEvent(data) {
    return this[data._id ? 'editEvent' : "newEvent"]({ input: data });
  }

}