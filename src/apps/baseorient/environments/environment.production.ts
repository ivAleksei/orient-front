export const environment = {
  production: true,
  version: "1.0.0",
  browser: true,
  menu_type: 'side',
  portal: {
    url: "http://192.168.1.76:8100"
  },
  API: {
    auth: "http://192.168.1.76/api_auth",
    admin: "http://192.168.1.76/api_admin",
    orient: "http://192.168.1.76/api_orient",
  },
  Socket: {
    platform: "sisbom",
    url: "https://ialk-socket-4a3a27ccedad.herokuapp.com",
  },
  oneSignal: {
    appId: "e84cc2ee-5c42-490f-a976-58f9349c42d2",
  },
  google: {
    captchaKey: "6Lf6EKspAAAAAH0ZvlvpKV7Yi96FrP8rDwWXaAD9",
  }
};