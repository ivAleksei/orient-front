import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class EventGpxsService {
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

  async getEventGpxs(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventGpxs{
        EventGpxs{
          _id
          ${fields}
        }
      }`,
      name: "EventGpxs",
      variables: args || {}
    });
  }
  async getEventGpxById(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventGpxById($_id: String){
        EventGpxById(_id: $_id){
          _id
          ${fields}
        }
      }`,
      name: "EventGpxById",
      variables: args || {}
    });
  }

  newEventGpx(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateEventGpx($input: EventGpxInput){
        CreateEventGpx(input: $input){
          status
          msg
        }
      }`,
      name: "CreateEventGpx",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editEventGpx(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateEventGpx($input: EventGpxInput){
        UpdateEventGpx(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateEventGpx",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delEventGpx(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteEventGpx($_id: ID){
          deleteEventGpx(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteEventGpx",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveEventGpx(data) {
    return this[data._id ? 'editEventGpx' : "newEventGpx"]({ input: data });
  }

}