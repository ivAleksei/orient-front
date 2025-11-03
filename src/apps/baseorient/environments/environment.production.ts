export const environment = {
  production: true,
  version: "1.0.0",
  browser: true,
  menu_type: 'side',
  portal: {
    sisbom: "https://sisbom.cbm.rn.gov.br",
    url: "https://sisbom.cbm.rn.gov.br",
    valida: "https://sistemas.cbm.rn.gov.br"
  },
  API: {
    url: "https://us-central1-cfap-app.cloudfunctions.net/api_sisbom",
    storage: "https://storage.cbm.rn.gov.br",
    bg: "https://us-central1-cfap-app.cloudfunctions.net/api_bg",
    cfap: "https://us-central1-cfap-app.cloudfunctions.net/api_cfap",
    cblab: "https://sistemas.cbm.rn.gov.br/cblab",
    frotas: "https://sistemas.cbm.rn.gov.br/api",
    mirim: "https://us-central1-cfap-app.cloudfunctions.net/api_mirim",
    sisbom: "https://us-central1-cfap-app.cloudfunctions.net/api_sisbom",
    wp: "https://api.sisbom.cbm.rn.gov.br"
  },
  GLPI: {
    url: "https://sistemas.cbm.rn.gov.br/glpi/apirest.php",
    app_token: "rgtuedgxwfschg7rlopezrq3h7gy90u7zt69ko1d"
  },
  Socket: {
    platform: "sisbom",
    url: "https://ialk-socket-4a3a27ccedad.herokuapp.com"
  },
  oneSignal: {
    appId: "e84cc2ee-5c42-490f-a976-58f9349c42d2",
  },
  google: {
    captchaKey: "6Lf6EKspAAAAAH0ZvlvpKV7Yi96FrP8rDwWXaAD9",
  }
};