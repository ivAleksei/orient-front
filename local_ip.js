var path = require('path');
var fs = require('fs');
var ip = require('ip');
let apps = fs.readdirSync(path.join('./src/apps'));
for (let it of apps) {
    let environment_local = path.join('./src/apps', it, 'environments', 'environment.ts');
    let env = fs.readFileSync(environment_local, 'utf8');

    env = env.split('\n').map(r => {
        let pattern_local_url = "http:\/\/(localhost|[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}):[0-9]{1,4}";
        if (r.match(pattern_local_url)) {
            let port = r.match(":[0-9]{1,4}");
            let new_url = ['http://', ip.address(), port].join('');
            r = r.replace(/http:\/\/(localhost|[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}):[0-9]{1,4}/, new_url)
        }
        return r;
    })

    fs.writeFileSync(environment_local, env.join('\n'), 'utf8');
}
