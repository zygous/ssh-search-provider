#!/usr/bin/gjs

const Gio  = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;

const shellSearchProvider2 = (function () {
    var file,
        xml;

    file = Gio.file_new_for_path(
        '/usr/share/dbus-1/interfaces/org.gnome.ShellSearchProvider2.xml'
    );
    xml  = file.load_contents(null)[1];
    file = null;

    return xml.toString();
}());

let knownHosts,
    results,
    sshSearcher,

    // Functions
    findKnownHosts,
    makeRegexes,
    parseKnownHosts,
    searchHosts;

findKnownHosts = function findKnownHosts() {
    var home = GLib.getenv('HOME'),
        file,
        contents;

    if (knownHosts) {
        return;
    }

    file     = home + '/.ssh/known_hosts';
    file     = Gio.file_new_for_path(file);
    contents = file.load_contents(null);

    if (! contents[0]) {
        return;
    }

    knownHosts = parseKnownHosts(contents[1].toString());
};

makeRegexes = function makeRegexes(terms) {
    var regexes = [];

    terms.forEach(function (term) {
        regexes.push(
            new GLib.Regex(term, GLib.RegexCompileFlags.JAVASCRIPT_COMPAT, 0)
        );
    });

    return regexes;
};

parseKnownHosts = function parseKnownHosts(string) {
    var hosts = {};

    // Split the string into lines
    string.split("\n").forEach(function (line) {
        /* Each line contains three tokens: host, algorithm, key. We're only
         interested in the host. The host may be a comma-separated list, in
         which case we'll want all the hosts in the list. It may also be
         hashed, in which case we'll ignore it. */
        var tokens = line.split(' ');

        /* Hashed hosts begin with a pipe character followed by a magic number,
         which indicates the hashing algorithm used. So, we can ignore any hosts
         that begin with a pipe character. */
        if ('|' !== tokens[0][0]) {
            tokens[0].split(',').forEach(function (host) {
                hosts[host] = true;
            });
        }
    });

    // We used an object so that we can return a distinct set of hosts thus:
    return Object.keys(hosts);
};

searchHosts = function searchHosts(hosts, terms) {
    var regexes = makeRegexes(terms),
        results = [];

    hosts.forEach(function (host) {
        var matched = true;

        regexes.forEach(function (regex) {
            matched = matched && regex.match(host, 0)[0];
        });

        if (matched) {
            results.push(host);
        }
    });

    return results;
};

sshSearcher = Gio.DBusExportedObject.wrapJSObject(
    shellSearchProvider2,
    {
        LaunchSearch: function LaunchSearch(terms, timestamp) {
        },

        GetInitialResultSet: function GetInitialResultSet(terms) {
            var toReturn;

            findKnownHosts();
            toReturn = searchHosts(knownHosts, terms);

            return toReturn;
        },

        GetSubsearchResultSet: function GetSubsearchResultSet(previousResults, terms) {
            return searchHosts(previousResults, terms);
        },

        GetResultMetas: function GetResultMetas(ids) {
            var metas = [];

            ids.forEach(function (id) {
                var variant = new GLib.Variant('s', id);
                metas.push({id: variant, name: variant});
            });

            return metas;
        },

        ActivateResult: function ActivateResult(id, terms, timestamp) {
            var appInfo = Gio.app_info_create_from_commandline(
                'gnome-terminal -e "ssh ' + id + '"',
                null,
                Gio.AppInfoCreateFlags.SUPPORTS_STARTUP_NOTIFICATION & Gio.AppInfoCreateFlags.SUPPORTS_URIS
            );
            appInfo.launch_uris([''], new Gio.AppLaunchContext({}));
        }
    }
);

const App = new Lang.Class({
    Name: 'SshSearcher',
    Extends: Gio.Application,

    _init: function init() {
        this.parent({
            application_id: 'uk.co.zygous.sshsearcher',
            flags: Gio.ApplicationFlags.IS_SERVICE
        });
    },

    startup: function startup() {},
    activate: function activate() {},

    vfunc_dbus_register: function vfunc_dbus_register(connection, path) {
        this.parent(connection, path);
        sshSearcher.export(connection, '/uk/co/zygous/sshsearcher');
        return true;
    }
});


(new App()).run(ARGV);
