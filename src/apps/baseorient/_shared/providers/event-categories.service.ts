import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class EventCategoriesService {
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

  async getEventCategories(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventCategories{
        EventCategories{
          _id
          ${fields}
        }
      }`,
      name: "EventCategories",
      variables: args || {}
    });
  }
  async getEventCategoryById(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventCategoryById($_id: String){
        EventCategoryById(_id: $_id){
          _id
          ${fields}
        }
      }`,
      name: "EventCategoryById",
      variables: args || {}
    });
  }

  newEventCategory(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateEventCategory($input: EventCategoryInput){
        CreateEventCategory(input: $input){
          status
          msg
        }
      }`,
      name: "CreateEventCategory",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editEventCategory(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateEventCategory($input: EventCategoryInput){
        UpdateEventCategory(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateEventCategory",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delEventCategory(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteEventCategory($_id: ID){
          deleteEventCategory(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteEventCategory",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveEventCategory(data) {
    return this[data._id ? 'editEventCategory' : "newEventCategory"]({ input: data });
  }

}