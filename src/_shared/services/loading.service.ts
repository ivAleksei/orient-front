import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class LoadingService {

  private _watch: BehaviorSubject<any>;
  public watch: Observable<any>;

  constructor() {

    this._watch = <BehaviorSubject<any>>new BehaviorSubject(null);
    this.watch = this._watch.asObservable();
  }


  show() {
    $('#loading').addClass('in');
  }
  hide() {
    $('#loading').removeClass('in');
  }
}
