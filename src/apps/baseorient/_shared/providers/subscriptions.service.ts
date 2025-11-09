import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { AlertsService } from 'src/_shared/services/alerts.service';
import { environment } from 'src/apps/baseorient/environments/environment';
import { LoadingService } from 'src/_shared/services/loading.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
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

  async getSubscriptions(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query Subscriptions{
        Subscriptions{
          _id
        }
      }`,
      name: "Subscriptions",
      variables: args || {}
    });
  }
  async getSubscriptionById(args?) {
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      query SubscriptionById($_id: String){
        SubscriptionById(_id: $_id){
          _id
        }
      }`,
      name: "SubscriptionById",
      variables: args || {}
    });
  }

  newSubscription(data) {
    this.loadingService.show();
    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation CreateSubscription($input: SubscriptionInput){
        CreateSubscription(input: $input){
          status
          msg
        }
      }`,
      name: "CreateSubscription",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  editSubscription(data) {
    this.loadingService.show();

    return this.graphql.query(environment.API.orient, 'graphql', {
      query: `
      mutation UpdateSubscription($input: SubscriptionInput){
        UpdateSubscription(input: $input){
          status
          msg
        }
      }`,

      name: "UpdateSubscription",
      variables: data
    })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  delSubscription(data) {
    return this.alertsService.confirmDel()
      .then(confirm => {
        if (!confirm) return;
        this.loadingService.show();
        return this.graphql.query(environment.API.orient, 'graphql', {
          query: `
        mutation deleteSubscription($_id: ID){
          deleteSubscription(_id: $_id){
            status
            msg
          }
        }`,
          name: "deleteSubscription",
          variables: data
        });
      })
      .then(done => {
        this.loadingService.hide();
        return done;
      });
  }

  saveSubscription(data) {
    return this[data._id ? 'editSubscription' : "newSubscription"]({ input: data });
  }

}