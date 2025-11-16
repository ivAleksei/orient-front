import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class EventPcsService {
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

  async getEventPcs(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventPcs{
        EventPcs{
          _id
          ${fields}
        }
      }`,
      name: "EventPcs",
      variables: args || {}
    });
  }
  async getEventPcsBy(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventPcsBy($_event: ID, $_race: ID){
        EventPcsBy(_event: $_event, _race: $_race){
          _id
          ${fields}
        }
      }`,
      name: "EventPcsBy",
      variables: args || {}
    });
  }
  async getEventPcById(args?, fields?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query EventPcById($_id: String){
        EventPcById(_id: $_id){
          _id
          ${fields}
        }
      }`,
      name: "EventPcById",
      variables: args || {}
    });
  }

  newEventPc(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateEventPc($input: EventPcInput){
        CreateEventPc(input: $input){
          status
          msg
        }
      }`,
      name: "CreateEventPc",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editEventPc(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateEventPc($input: EventPcInput){
        UpdateEventPc(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateEventPc",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delEventPc(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteEventPc($_id: ID){
          deleteEventPc(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteEventPc",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveEventPc(data) {
    return this[data._id ? 'editEventPc' : "newEventPc"]({ input: data });
  }

}