import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class FederationsService {
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

  async getFederations(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Federations{
        Federations{
          _id
          _confederation
          slug
          name
        }
      }`,
      name: "Federations",
      variables: args || {}
    });
  }
  async getFederationById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query FederationById($_id: ID){
        FederationById(_id: $_id){
          _id
          _confederation
          slug
          name
          state
          city
        }
      }`,
      name: "FederationById",
      variables: args || {}
    });
  }

  newFederation(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateFederation($input: FederationInput){
        CreateFederation(input: $input){
          status
          msg
        }
      }`,
      name: "CreateFederation",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editFederation(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateFederation($input: FederationInput){
        UpdateFederation(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateFederation",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delFederation(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteFederation($_id: ID){
          deleteFederation(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteFederation",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveFederation(data) {
    return this[data._id ? 'editFederation' : "newFederation"]({ input: data });
  }

}