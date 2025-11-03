var fs = require("fs");
var path = require("path");
var FtpDeploy = require("ftp-deploy");
var ftpDeploy = new FtpDeploy();
let child_process = require('child_process');

var argv = require("minimist")(process.argv.slice(2));

ftpDeploy.on("uploading", function (data) {
    data.totalFilesCount; // total file count being transferred
    data.transferredFileCount; // number of files transferred
    data.filename; // partial path with filename being uploaded
});
ftpDeploy.on("uploaded", function (data) {
    console.log(data); // same data as uploading event
});
ftpDeploy.on("log", function (data) {
    console.clear();
    data.transferredFileCount = 0;
    console.log(data); // same data as uploading event
});

async function exec(cmd) {
    console.log(cmd);
    return child_process.execSync(cmd);
}
async function setRevision() {
    let revision = child_process.execSync('git rev-parse HEAD').toString().trim();
    fs.writeFileSync(path.join(__dirname, '../www', 'revision'), JSON.stringify({ revision: revision }), 'utf8');
    return;
}

let cfg_base = {
    sftp: true,
    port: 22,
    include: ["*", "**/*"], // this would upload everything except dot files
    exclude: ["assets/**/*", "svg/**/*"], //[],// e.g. exclude sourcemaps - ** exclude: [] if nothing to exclude **
    forcePasv: true, // Passive mode is forced (EPSV command is not sent)
    localRoot: path.join(__dirname, "../www"),
};

let cfgs = {
    'hom': {
        default: { user: "ctic", password: "CbmRN#2024*", host: "10.9.213.141" },
        cbfrotas: {
            remoteRoot: "/var/www/html/cbfrotas",
            build: `ng build --configuration production --project=cbfrotas --base-href /cbfrotas/`
        },
        'mapa-forca': {
            remoteRoot: "/var/www/html/mapa-forca",
            build: `ng build --configuration production --project=mapa-forca --base-href /mapa-forca/`
        },
        'valida': {
            remoteRoot: "/var/www/html/valida",
            build: `ng build --configuration production --project=valida --base-href /valida/`
        },
        cbmirim: {
            remoteRoot: "/var/www/html/cbmirim",
            build: `ng build --configuration production --project=cbmirim --base-href /cbmirim/`
        },
        'inscricao-mirim': {
            remoteRoot: "/var/www/html/inscricao",
            build: `ng build --configuration production --project=inscricao --base-href /inscricao/`
        },
        sisbom: {
            remoteRoot: "/var/www/html/sisbom",
            build: `ng build --configuration production --project=sisbom --base-href /sisbom/`
        },
        cfap: {
            remoteRoot: "/var/www/html/cfap",
            build: `ng build --configuration production --project=cfap --base-href /cfap/`
        },
    },
    'prod': {
        default: {},
        cbfrotas: {
            user: "cbm", password: "CbmRN#16", host: "10.9.100.160", remoteRoot: "/var/www/html/cbfrotas_app",
            build: `ng build --configuration production --project=cbfrotas --base-href /cbfrotas/`
        },
        'mapa-forca': {
            user: "cbm", password: "CbmRN#16", host: "10.9.100.160", remoteRoot: "/var/www/html/mapa-forca",
            build: `ng build --configuration production --project=mapa-forca --base-href /mapa-forca/`
        },
        'valida': {
            user: "cbm", password: "CbmRN#16", host: "10.9.100.160", remoteRoot: "/var/www/html/valida",
            build: `ng build --configuration production --project=valida --base-href /valida/`
        },
        cbmirim: {
            user: "ctic", password: "CbmRN#2024*", host: "10.9.213.163", remoteRoot: "/var/www/html",
            build: `ng build --configuration production --project=cbmirim`
        },
        'inscricao-mirim': {
            user: "ctic", password: "CbmRN#2024*", host: "10.9.213.163", remoteRoot: "/var/www/html/inscricao",
            build: `ng build --configuration production --project=inscricao-mirim --base-href /inscricao/`
        },
        'inscricao': {
            user: "ctic", password: "#CbmRN2024*", host: "10.9.213.105", remoteRoot: "/var/www/html/inscricao",
            build: `ng build --configuration production --project=inscricao --base-href /inscricao/`
        },
        sisbom: {
            user: "ctic", password: "#CbmRN2024*", host: "10.9.213.105", remoteRoot: "/var/www/html",
            build: `ng build --configuration production --project=sisbom`
        },
        cfap: {
            user: "ctic", password: "CbmRN#2024*", host: "10.9.213.185", remoteRoot: "/var/www/html",
            build: `ng build --configuration production --project=cfap`
        },
    }
};

(async () => {
    if (!argv) throw new Error('Nenhum argumento passado para deploy');
    if (!argv.app) throw new Error('Nenhum app definido para deploy');
    if (!argv.env) throw new Error('Ambiente não definido para o deploy');

    let cfg_deploy = Object.assign({}, cfg_base, cfgs[argv.env].default, cfgs[argv.env][argv.app]);
    console.clear();
    console.log(cfg_deploy);
    if (cfg_deploy.build)
        await exec(cfg_deploy.build);

    await setRevision();

    // ASSETS
    if (argv.assets)
        await ftpDeploy.deploy(Object.assign({}, cfg_deploy, {
            include: ["assets/**/*"],
            exclude: [],
            remoteRoot: "/var/www/html"
        }))

    // CODIGO APLICAÇÃO
    return Promise.resolve(true)
        .then(async start => {
            return ftpDeploy.deploy(cfg_deploy);
        })
        .then(res => console.log("finished"))
        .catch(err => console.log(err));
})();







// let system = 'cfap';
// if (argv.cbmirim) system = 'cbmirim';
// if (argv.sisbom) system = 'sisbom';
// if (argv.cbfrotas) system = 'cbfrotas';
// if (argv['inscricao-mirim']) system = 'inscricao-mirim';
// if (argv['inscricao-gv']) system = 'inscricao-gv';
// if (argv['mapa-forca']) system = 'mapa-forca';
// if (argv['valida']) system = 'valida';


// let cfgs = {
// }

// let config = {};
// console.log(system);
// let system_config = cfgs[system];
// config = Object.assign(config, cfg_base, system_config);





// // DEPLOY ASSETS

// // ASSETS

