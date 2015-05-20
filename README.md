# ssh-search-provider
GNOME Shell search provider to easily launch an SSH session for known hosts.

This application searches `~/.ssh/known_hosts` to find matching hosts to connect
to.

*Note that hostnames must therefore not be hashed*. If your distro hashes
`known_hosts` files by default you’ll need to add a `HashKnownHosts no` line to
`~/.ssh/config`. Naturally you’ll then need to ensure that a host is included in
`known_hosts` before this app will find it, e.g. by connecting to it manually.
