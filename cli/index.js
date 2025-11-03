var fs = require("fs");
var path = require("path");
var args = require("minimist")(process.argv.slice(2));

function loopArrayPromise(array, promise) {
    if (!array) array = [];
    console.log("loopArrayPromise", array.length, "items");
    let handleIndex = (index) => {
        return Promise.resolve(array[index]).then((obj) => {
            if (!obj) return array;
            console.log("handleIndex", index + 1, "/", array.length);

            return promise(obj).then((done) => handleIndex(index + 1));
        });
    };

    return handleIndex(0).then((done) => {
        console.log("loopArrayPromise Done");
        return done;
    });
}

let handleError = args => {
    // console.clear();
    console.log(...args);
    return true;
}

(async () => {
    if (!args.pg) return handleError("Argumento 'pg' (pagina) não informado.");
    if (!args.pj) {
        args.pj = 'baseorient';
        // return handleError("Argumento 'pj' (projeto) não informado.");
    }

    let _project = args.pj;
    let _page = args.pg;
    let split = _page.split('.');
    let new_page = split.slice(-1)[0];
    console.log(split);
    const CONTENT_FOLDER = path.join('src', 'apps', _project, 'content', split.join('/'))+'s';
    console.log(CONTENT_FOLDER);

    try {
        let stat = fs.statSync(CONTENT_FOLDER);
        if (stat.isDirectory()) return handleError('Diretório já existe');
    } catch {
        // CHECA DIRETORIO EXISTE
        let path_tmp = './';
        await loopArrayPromise(CONTENT_FOLDER.split('\\'), async it => {
            path_tmp = path.join(path_tmp, it);
            console.log(path_tmp);
            try {
                let files = fs.readdirSync(path_tmp);
            } catch (error) {
                fs.mkdirSync(path_tmp);
                console.log('pasta criada: ', path_tmp);
            }
        });

        // COPIA ARQUIVOS
        let files = [];
        let BLANK_DIR = path.join(__dirname, 'blanks');
        files = fs.readdirSync(BLANK_DIR)
        await loopArrayPromise(files, async it => fs.copyFileSync(path.join(BLANK_DIR, it), path.join(CONTENT_FOLDER, it.replace('blank', new_page))));
        // RENOMEIA ARQUIVOS
        files = fs.readdirSync(CONTENT_FOLDER);
        await loopArrayPromise(files, async it => {
            let data = fs.readFileSync(path.join(CONTENT_FOLDER, it), 'utf8');
            data = data.replace(new RegExp(/blank/, 'g'), new_page);

            let capitalize = new_page[0].toLocaleUpperCase() + new_page.substring(1);
            if (new_page.includes('-')) {
                capitalize = new_page.split('-').map(s => s[0].toLocaleUpperCase() + s.substring(1)).join('');
            }

            data = data.replace(new RegExp(/Blank/, 'g'), capitalize);
            data = data.replace(new RegExp(/BLANK/, 'g'), new_page.toLocaleUpperCase());

            fs.writeFileSync(path.join(CONTENT_FOLDER, it), data, 'utf8')
        });
    }



})();