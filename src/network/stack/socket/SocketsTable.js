import Socket from "./Socket";

export default class SocketsTable {
  constructor(stack) {
    // Port mapped
    this.stack = stack;
    this.sockets = new Map();
  }

  get data() {
    const sockets = [];

    this.sockets.forEach((socket) => {
      sockets.push(socket);
      socket.children.forEach((childSocket) => {
        sockets.push(childSocket);
      });
    });
    return sockets;
  }

  get(port) {
    return this.sockets.get(port);
  }

  set(socket) {
    if (!(socket instanceof Socket)) {
      throw new Error("Invalid Socket!");
    }

    this.sockets.set(socket.srcPort, socket);
  }

  remove(socket) {
    if (!(socket instanceof Socket)) {
      throw new Error("Invalid Socket!");
    }

    this.sockets.delete(socket.srcPort);
  }

  findByRemote(remoteAddress) {
    return this.sockets.find((s) => s.remoteAddress.compare(remoteAddress));
  }

  importData(data) {
    try {
      if (!data) return;
      this.sockets.clear();
      data.forEach((s) => {
        const socket = Socket.fromExport(s, this.stack);

        // Bind with a device's network stack
        socket.networkStack = this.stack;
        socket.open();
        this.sockets.set(socket.srcPort, socket);
      });
    } catch (e) {
      throw Error(
        "Unexpected error on importing sockets. Likely due to corrupted data."
      );
    }
  }

  exportData() {
    const sockets = [];
    this.sockets.forEach((s) => {
      // Export only if a socket is bound (made some communication), or it's a listening server socket
      if ((s.type === "server" && !s.parent) || s.otherId)
        sockets.push(s.exportData(s));
    });
    return sockets;
  }
}
