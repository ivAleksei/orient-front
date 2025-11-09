var fs = require("fs");
var path = require("path");
var FtpDeploy = require("ftp-deploy");
var ftpDeploy = new FtpDeploy();

let revision = require('child_process')
    .execSync('git rev-parse HEAD')
    .toString().trim();

fs.writeFileSync(path.join(__dirname, '../www', 'revision'), JSON.stringify({ revision: revision }), 'utf8');
var argv = require("minimist")(process.argv.slice(2));
let system = 'baseorient';

let config_base = {
    port: 21,
    include: ["*", "**/*"], // this would upload everything except dot files
    exclude: ["assets/**/*", "svg/**/*"], //[],// e.g. exclude sourcemaps - ** exclude: [] if nothing to exclude **
    forcePasv: true // Passive mode is forced (EPSV command is not sent)
};

let cfgs = {
    baseorient: {
        user: "ialk-com-br", // NOTE that this was username in 1.x
        password: "E5ch_IS=!Uq(wQ(", // optional, prompted if none given
        host: "alderaan07.umbler.host",
        localRoot: path.join(__dirname, "../www"),
        remoteRoot: "/public/baseorient",
    },
}

let config = {};
console.log(system);
let system_config = cfgs[system];
config = Object.assign(config, config_base, system_config);





// DEPLOY ASSETS

ftpDeploy.on("uploading", function (data) {
    data.totalFilesCount; // total file count being transferred
    data.transferredFileCount; // number of files transferred
    data.filename; // partial path with filename being uploaded
});
ftpDeploy.on("uploaded", function (data) {
    console.log(data); // same data as uploading event
});
ftpDeploy.on("log", function (data) {
    // console.clear();
    data.transferredFileCount = 0;
    console.log(data); // same data as uploading event
});

// ASSETS
return Promise.resolve(true)
    .then(async start => {
        if (argv.assets){
            console.log(Object.assign({}, config, {
                include: ["assets/**/*"],
                exclude: [],
                remoteRoot: "/var/www/html"
            }));
            
            await ftpDeploy.deploy(Object.assign({}, config, {
                include: ["assets/**/*"],
                exclude: [],
                remoteRoot: "/var/www/html"
            }))
        }

        // use with promises
        console.log(config);
        return ftpDeploy.deploy(config);
    })
    .then(res => console.log("finished"))
    .catch(err => console.log(err));
