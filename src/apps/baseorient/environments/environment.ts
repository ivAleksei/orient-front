// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  version: "1.0.0",
  browser: true,
  menu_type: 'side',
  portal: {
    url: "http://192.168.1.76:8100"
  },
  API: {
    auth: "http://192.168.1.76:3003/api_auth",
    admin: "http://192.168.1.76:3003/api_admin",
    orient: "http://192.168.1.76:3003/api_orient",
  },
  Socket: {
    platform: "baseorient",
    url: "https://ialk-socket-4a3a27ccedad.herokuapp.com",
  },
  oneSignal: {
    appId: "e84cc2ee-5c42-490f-a976-58f9349c42d2",
  },
  google: {
    captchaKey: "6Lf6EKspAAAAAH0ZvlvpKV7Yi96FrP8rDwWXaAD9",
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
