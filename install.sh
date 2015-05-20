#!/bin/bash

install ./uk.co.zygous.sshsearcher.desktop /usr/share/applications/
install ./uk.co.zygous.sshsearcher.search-provider.ini /usr/share/gnome-shell/search-providers/
install ./ssh-search-provider.js /usr/local/bin/
install ./uk.co.zygous.sshsearcher.service /usr/share/dbus-1/services/

echo "You may need to restart GNOME Shell to load the search provider."
echo "Enable the provider via Control Centre under Search."
echo
