import Socket from "./Socket";

/**
 * SocketsTable is used to manage sockets in a network stack.
 */
export default class SocketsTable {
  /**
   * Constructor for SocketsTable.
   * @param {Object} stack - The network stack this table belongs to.
   */
  constructor(stack) {
    // Port mapped
    this.stack = stack;
    // Map of sockets.
    this.sockets = new Map();
  }

  /**
   * Get all sockets in this table.
   * @returns {Array} An array of sockets.
   */
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

  /**
   * Get a socket by its port.
   * @param {Number} port - The port of the socket.
   * @returns {Socket} The socket if found, otherwise null.
   */
  get(port) {
    return this.sockets.get(port);
  }

  /**
   * Sets a new socket in this table mapping its srcPort.
   * @param {Socket} socket - The socket to be set.
   */
  set(socket) {
    if (!(socket instanceof Socket)) {
      throw new Error("Invalid Socket!");
    }

    this.sockets.set(socket.srcPort, socket);
  }

  /**
   * Remove a socket from this table.
   * @param {Socket} socket - The socket to be removed.
   */
  remove(socket) {
    if (!(socket instanceof Socket)) {
      throw new Error("Invalid Socket!");
    }

    this.sockets.delete(socket.srcPort);
  }

  /**
   * Find a socket by its remote address.
   * @param {SocketAddress} remoteAddress - The remote address of the socket.
   * @returns {Socket} The socket if found, otherwise null.
   */
  findByRemote(remoteAddress) {
    return this.sockets.find((s) => s.remoteAddress.compare(remoteAddress));
  }

  /**
   * Import sockets from exported data.
   * @param {Array} data - The exported data.
   */
  importData(data) {
    try {
      if (!data) return;
      this.sockets.clear();
      data.forEach((s) => {
        // Import socket from exported data.
        const socket = Socket.fromExport(s, this.stack);

        // Bind with a device's network stack.
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

  /**
   * Export sockets in this table.
   * @returns {Array} An array of exported data of sockets.
   */
  exportData() {
    const sockets = [];
    this.sockets.forEach((s) => {
      // Export only if a socket is bound (has made some communication before), or it's a listening server socket
      if ((s.type === "server" && !s.parent) || s.otherId)
        sockets.push(s.exportData(s));
    });
    return sockets;
  }
}
