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
export class EventSubscriptionsService {
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

  async getEventSubscriptions(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventSubscriptions{
        EventSubscriptions{
          _id
        }
      }`,
      name: "EventSubscriptions",
      variables: args || {}
    });
  }

  async getResultCategory(args) {
    let query = args || {};
    // http://localhost:3003/api_orient/ws/table-result?_category=bee8fa30-bd78-11f0-b9e2-7d82012a6326
    let url = [environment.API.orient, 'ws', 'table-result'].join('/') + '?' + Object.keys(query).map(k => `${k}=${query[k]}`);
    return this.http.get(url);
  }

  async getEventSubscriptionById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventSubscriptionById($_id: ID){
        EventSubscriptionById(_id: $_id){
          _id
          status
          name
          num_start
          controlcard
          country
          club{
            slug
            name
          }

          time
          str_time
          start_at
          end_at 
          _person

        category{
          _id
          name
          dist
          climb
          _route
          num_pcs
        }
          splits{
            num_base
            time_spent
          }
          event{
            _id
            _helga
            dt_start
            name
            location
            organizer
          }
        }
      }`,
      name: "EventSubscriptionById",
      variables: args || {}
    });
  }

  newEventSubscription(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateEventSubscription($input: EventSubscriptionInput){
        CreateEventSubscription(input: $input){
          status
          msg
        }
      }`,
      name: "CreateEventSubscription",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editEventSubscription(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateEventSubscription($input: EventSubscriptionInput){
        UpdateEventSubscription(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateEventSubscription",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delEventSubscription(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteEventSubscription($_id: ID){
          deleteEventSubscription(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteEventSubscription",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveEventSubscription(data) {
    return this[data._id ? 'editEventSubscription' : "newEventSubscription"]({ input: data });
  }

}