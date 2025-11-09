import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphqlService } from 'src/_shared/services/graphql.service';
import { UtilsService } from 'src/_shared/services/utils.service';
import estado_cidade from 'src/assets/baseorient/json/estado_cidade.json';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor(
    private utils: UtilsService,
    private graphql: GraphqlService
  ) {
    this._watch = <BehaviorSubject<any>>new BehaviorSubject(false);
    this.watch = this._watch.asObservable();
  }

  trigger() {
    this._watch.next(true);
  }

  getCityState() {
    return estado_cidade;
  }
}
