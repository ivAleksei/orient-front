import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

export class AppLoadingStrategy implements PreloadingStrategy {
  routes: { [name: string]: { route: Route; load: Function } } = {};

  preload(route: Route, load: Function): Observable<any> {
    if (route.data && route.data['name']) {
      this.routes[route.data['name']] = {
        route,
        load
      };
    }
    return of(null);
  }

  preLoadRoute(name: string) {
    const route = this.routes[name];

    if (route) {
      route.load();
    }
  }
}
