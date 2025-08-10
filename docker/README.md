# The Lounge Fork - Docker Configuration

#### Docker configuration for The Lounge fork, a modern web IRC client designed for self-hosting

---

### Overview

- **Modern features brought to IRC.** Push notifications, link previews, new message markers, and more bring IRC to the 21st century.
- **Always connected.** Remains connected to IRC servers while you are offline.
- **Cross platform.** It doesn't matter what OS you use, it just works wherever Node.js runs.
- **Responsive interface.** The client works smoothly on every desktop, smartphone and tablet.
- **Synchronized experience.** Always resume where you left off no matter what device.

To learn more about configuration, usage and features of The Lounge, take a look at [the website](https://thelounge.chat).

### Building

This fork builds from source rather than using the published npm package. The Docker image includes all necessary build dependencies and compiles the application during the container build process.

### Running a container

Build and run using docker-compose:

```sh
$ docker compose up --build --detach
```

Or build and run manually from the project root:

```sh
$ docker build -f docker/Dockerfile -t thelounge-fork .
$ docker run --detach \
             --name thelounge-fork \
             --publish 9000:9000 \
             --volume thelounge:/var/opt/thelounge \
             --restart always \
             thelounge-fork
```

### Executing commands in the container

The container is setup to use an unprivileged user (node).  
You can directly issue thelounge commands as follows:

```
$ docker exec -it thelounge-fork node index.js help
```

### Configuring identd

Since root permissions are dropped in the container the default port 113 can not be used as it is within the
privileged port range. Instead, use a higher port in your The Lounge identd configuration and map it back to 113
on your host system, for example like so:

```
$ docker run --detach \
             --name thelounge-fork \
             --publish 113:9001 \
             --publish 9000:9000 \
             --volume thelounge:/var/opt/thelounge \
             --restart always \
             thelounge-fork
```

Refer to the [identd / oidentd docs](https://thelounge.chat/docs/guides/identd-and-oidentd) for more detailed information.

### Data directory

The Lounge reads and stores all of its configuration, logs and other data at `/var/opt/thelounge`.

By default, The Lounge will run using the `node (1000:1000)` system user in the container, meaning volume contents must be owned by said user.

_You will probably want to persist the data at this location by using [one of the means](https://docs.docker.com/storage/) to do so._

### Adding users

Users can be added as follows:

```sh
$ docker exec -it thelounge-fork node index.js add [username]
```

_Note: without [persisting data](#data-directory), added users will be lost when the container is removed._

### Changing the port that The Lounge will be available on

To change the port which The Lounge will be available on, one will have to
change the host port in the port mapping. To make The Lounge available on e.g. port 5000:

```sh
$ docker run --detach \
             --name thelounge-fork \
             --publish 5000:9000 \ # Change host port to listen on port 5000
             --volume thelounge:/var/opt/thelounge \
             --restart always \
             thelounge-fork
```

### Container user (advanced usage)

By default, The Lounge will run using the `node (1000:1000)` user. This is customizable by running the container as a different, non-root, user.
Beware that this may cause permission issues when a container process tries reading from the data disk unless you have manually set the permissions correctly.

Also keep in mind that whenever executing one-off commands in the container you need to explicitly set the correct user.
