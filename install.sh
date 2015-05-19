#!/bin/bash

install ./uk.co.zygous.sshsearcher.desktop /usr/share/applications/
install ./uk.co.zygous.sshsearcher.search-provider.ini /usr/share/gnome-shell/search-providers/
install ./ssh-search-provider.js /usr/local/bin/

echo "You may need to restart GNOME Shell to load the search provider."
echo "Enable the provider via Control Centre under Search."
echo
