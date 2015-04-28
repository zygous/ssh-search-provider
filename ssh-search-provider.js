#!/usr/bin/gjs

const GLib = imports.gi.GLib;
const Gio  = imports.gi.Gio;

let sshSearcher,
    app,
    dbusObject;

sshSearcher = {
    results: [{id: "1"}, {id: "2"}],

    GetInitialResultSet: function GetInitialResultSet(terms) {
        return this.results.map(function (result) {
            return result.id;
        });
    },
    GetSubsearchResultSet: function (previousResults, terms) {
        return ['bar'];
    }
};

dbusObject = Gio.DBusExportedObject.wrapJSObject(
    (function () { //
        var file,
            xml;

        file = Gio.file_new_for_path(
            '/usr/share/dbus-1/interfaces/org.gnome.ShellSearchProvider2.xml'
        );
        xml  = file.load_contents(null)[1];
        file = null;

        return xml.toString();
    }()),
    sshSearcher
);

app = (function () {
    var dBusConnection,
        gioBusId,
        mainLoop = new GLib.MainLoop(null, true),

        activate = function activate() {
            gioBusId = Gio.bus_own_name(
                Gio.BusType.SESSION,
                "uk.co.zygous.ssh-searcher",
                Gio.BusNameOwnerFlags.NONE,
                function (connection) {
                    dBusConnection = connection;
                    dbusObject.export(connection, '/');
                },
                null,
                function () {
                    mainLoop.quit();
                }
            );

            mainLoop.run();
        };

    return {
        activate: activate
    };
}());

app.activate();
