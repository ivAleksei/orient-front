import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class EventRoutesService {
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

  async getEventRoutes(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventRoutes{
        EventRoutes{
          _id
          ${fields}
        }
      }`,
      name: "EventRoutes",
      variables: args || {}
    });
  }
  async getEventRouteById(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventRouteById($_id: String){
        EventRouteById(_id: $_id){
          _id
          ${fields}
        }
      }`,
      name: "EventRouteById",
      variables: args || {}
    });
  }

  newEventRoute(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateEventRoute($input: EventRouteInput){
        CreateEventRoute(input: $input){
          status
          msg
        }
      }`,
      name: "CreateEventRoute",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editEventRoute(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateEventRoute($input: EventRouteInput){
        UpdateEventRoute(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateEventRoute",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delEventRoute(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteEventRoute($_id: ID){
          deleteEventRoute(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteEventRoute",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveEventRoute(data) {
    return this[data._id ? 'editEventRoute' : "newEventRoute"]({ input: data });
  }

}