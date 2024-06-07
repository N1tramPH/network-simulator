import { ref, reactive, computed, markRaw } from "vue";
import { defineStore, storeToRefs } from "pinia";
import { capitalize } from "lodash-es";

import { nanoid } from "nanoid";
import { addLog } from "../utils/utils";
import { Layer, TcpState as s } from "../utils/constants";
import { useSimulationStore } from "./SimulationStore";

import ICMP from "../components/transmission/transmitSection/ICMP.vue";
import TCP from "../components/transmission/transmitSection/TCP.vue";
import Computer from "../network/devices/Computer";
import Socket from "../network/stack/socket/Socket";
import IpAddress from "../network/stack/ipLayer/IpAddress";
import Device from "../network/devices/Device";

/**
 * A pairs indicating currently used protocol for transmission
 * consisting of a label e.g 'ICMP' and the component content that
 * is to be rendered within the transmission control panel.
 */
const modes = [
  {
    label: "ICMP",
    content: markRaw(ICMP),
  },

  {
    label: "TCP",
    content: markRaw(TCP),
  },
];

/**
 * @param {Device} device
 * @returns Pairs of IP { label: ip.toString, value: ip } for IP selection in the control panel
 */
const addressOptions = (device) => {
  return device.networkAdapters.map((adapter) => {
    return {
      label: adapter.ipAddress.toString(false), // Print without CIDR mask
      value: adapter.ipAddress,
    };
  });
};

/**
 * Checks if the device is selectable for a transmission based on a given protocol.
 * @param {Device} device Tested device
 * @param {String} protocol A protocol to be tested if the device is capable of
 * @returns Whether is the device of a given protocol or not
 */
const isSelectable = (device, protocol) => {
  if (!device) return true;

  const isL4 = ["UDP", "TCP"].includes(protocol);
  return isL4 ? device.layerType > Layer.L3 : true;
};

/**
 * Stores the state of communicating devices including:
 *  - communicating sockets (if the TCP/UDP mode is selected)
 *  - selected client, server device
 */
export const useTransmitStore = defineStore("transmitStore", () => {
  const controlOpen = ref(false);
  const currentMode = ref(modes[0]);

  // Keeping track of all sockets within the app
  const sockets = new Map();
  const state = reactive(_initSettings());

  const client = computed({
    get() {
      return state.client;
    },
    set(client) {
      state.client = client;
    },
  });

  const server = computed({
    get() {
      return state.server;
    },
    set(server) {
      state.server = server;
    },
  });

  const selectType = computed(() => state.selectType);

  const protocol = computed({
    get() {
      return state.protocol;
    },
    set(protocol) {
      state.protocol = protocol;
    },
  });

  const clientSocket = computed({
    get() {
      return client.value.activeSocket;
    },
    set(socket) {
      socket.otherId
        ? setActiveSocket(socket.otherId)
        : (client.value.activeSocket = socket);
    },
  });

  const serverSocket = computed({
    get() {
      return server.value.activeSocket;
    },
    set(socket) {
      socket.otherId
        ? setActiveSocket(socket.otherId)
        : (server.value.activeSocket = socket);
    },
  });

  const clientDevice = computed(() => client.value.device);
  const serverDevice = computed(() => server.value.device);

  const clientData = computed(() => client.value.data);
  const serverData = computed(() => server.value.device);

  /**
   * Returns a history of all transmissions (objects)
   */
  const history = computed(() => state.history);

  /**
   * Indicates whether two sockets have been TCP connected
   */
  const isEstablished = computed(() => {
    if (state.protocol !== "TCP") return false;
    if (!clientSocket.value || !serverSocket.value) return false;

    try {
      const validStates = [s.ESTABLISHED, s.FIN_WAIT_1, s.FIN_WAIT_2];
      return (
        validStates.includes(clientSocket.value.state) &&
        serverSocket.value.state === s.ESTABLISHED
      );
    } catch (e) {
      console.log(
        "An error ocurred computing whether are sockets established",
        e
      );
      return false;
    }
  });

  /**
   * Returns all the IP addresses of a current client device
   */
  const clientAddresses = computed(() => {
    const device = state.client ? state.client.device : null;
    return device ? addressOptions(device) : null;
  });

  /**
   * Returns all the IP addresses of a current server device
   */
  const serverAddresses = computed(() => {
    const device = state.server ? state.server.device : null;
    return device ? addressOptions(device) : null;
  });

  /**
   * Registers a socket within a store.
   * Keeping track of all sockets enables simple
   * selection of sockets in the transmission control, export/import etc.
   * @param {Socket} socket
   */
  function registerSocket(socket) {
    sockets.set(socket.id, socket);
  }

  /**
   * Registers a socket within a store.
   * Keeping track of all sockets enables simple
   * selection of sockets in the transmission control, export/import etc.
   * @param {Socket} socket
   */
  function unregisterSocket(socket) {
    sockets.delete(socket.id, socket);
  }

  /**
   * Sets a registered socket either as a server or client accordingly
   * and also sets the other socket that is bound with.
   * @param {String} socketId An ID of a registered socket
   */
  function setActiveSocket(socketId) {
    const sock1 = sockets.get(socketId);
    if (!sock1) return;

    const sock2 = sockets.get(sock1.otherId);

    let clientSocket = sock1.type === "client" ? sock1 : sock2;
    let serverSocket = sock1.type === "server" ? sock1 : sock2;

    // If the listening server socket was selected, then there is no bound client
    if (!clientSocket) clientSocket = initClientSocket();

    // For example on exporting a client socket was bound but the server
    // client was trying to communicate to wasn't listening, thus wasn't initialized
    if (!serverSocket) {
      serverSocket = initServerSocket();
      serverSocket.localAddress = clientSocket.remoteAddress;
    }

    setProtocol(clientSocket.protocol);
    state.client.device = clientSocket.device;
    state.client.activeSocket = clientSocket;
    state.server.device = serverSocket.device;
    state.server.activeSocket = serverSocket;
  }

  /**
   * A function to be called whenever an active socket's port was changed.
   * If the it was changed to the port that is already used, set the existing one.
   * @param {Socket} socket A socket that had its port changed.
   */
  function onExistingSocket(socket) {
    if (!socket) return;
    const type = socket.type;
    const device = type === "client" ? clientDevice : serverDevice;

    if (type == "client") {
      const existing = device.value.findSocket(socket.srcPort);
      if (existing) clientSocket.value = existing;
    } else {
      // Also check if the server socket has already served the set clientSocket
      const clientAddress = clientSocket.value
        ? clientSocket.value.localAddress
        : null;

      // When the client address doesn't exist (socket is undefined) while the server socket does,
      // the listening server socket is set, in other case the serving server socket is set. (Confusing? Of course)
      const existing = device.value.findSocket(socket.srcPort, clientAddress);
      if (existing) serverSocket.value = existing;
    }
  }

  /******* Keeping a history of past transmissions *******/
  const addHistory = (label, packet, status) => {
    state.history.push({
      id: nanoid(4),
      label: label,
      client: state.client.device,
      server: state.server.device,
      packet: packet,
      status: status,
    });

    // Is simulation auto-play ON?
    const store = useSimulationStore();

    const { animateOnTransmit } = storeToRefs(store);
    if (animateOnTransmit.value) store.animatePacket(packet);
  };

  const removeHistory = (id) => {
    state.history = state.history.filter((h) => h.id === id);
  };

  /**
   * Ensures that the correct source IP address is set within the transmit store
   * after routing process is taking place (src IP might not be known first)
   * -> sets a socket srcIpAddress of just the sender's address accordingly
   * @param {IpAddress} ipAddress
   */
  function setSrcIpAddress(ipAddress) {
    const protocol = state.protocol;
    if (protocol === "TCP" || protocol === "UDP") {
      // if (clientSocket.value.isBound) return;

      clientSocket.value.srcIpAddress = ipAddress;
    } else {
      client.value.ipAddress = ipAddress;
    }
  }

  /**
   * Sets a communication protocol.
   * As for TCP/UDP communications, new sockets with given protocol are initialized.
   * Furthermore, changes the communication section in the tranmission control.
   * @param {String} protocol 'ICMP'/'UDP'/'TCP'
   */
  function setProtocol(protocol) {
    if (state.protocol !== protocol) {
      state.protocol = protocol;
      // When switching to TCP/UDP, always initialize
      // new unbound sockets, so they don't collide and also to prevent from < L4 device from being selected
      if (protocol === "TCP" || protocol === "UDP") {
        initSockets();

        if (!isSelectable(clientDevice.value, protocol))
          client.value.device = null;
        if (!isSelectable(serverDevice.value, protocol))
          server.value.device = null;
      }
    }

    // Update the transmission mode
    currentMode.value = modes.find((mode) => mode.label === protocol);
  }

  // Initialize a communication socket with a current protocol
  function initClientSocket() {
    const device = state.client.device;

    if (device) {
      const socket = device.initSocket("client", "IPV4", state.protocol);
      if (!socket) return; // A device is likely not a > L3 device

      // Initialized socket comes with no IP
      socket.srcIpAddress = clientAddresses.value[0].value;
      client.value.activeSocket = socket;
      registerSocket(socket);

      return socket;
    }
  }

  function initServerSocket() {
    const device = state.server.device;

    if (device) {
      const socket = device.initSocket("server", "IPV4", state.protocol);
      if (!socket) return; // A device is most likely not a > L3 device

      // Initialized socket comes with no IP
      socket.srcIpAddress = serverAddresses.value[0].value;
      server.value.activeSocket = socket;
      registerSocket(socket);

      return socket;
    }
  }

  // Tries to initialize sockets of both client and server
  function initSockets() {
    initServerSocket();
    initClientSocket();
  }

  /**
   * Sets a passed device as a client
   * A device must be capable of a current transmission mode
   */
  function setClient(device) {
    if (!isSelectable(device, protocol.value)) {
      throw new Error(
        `${device} cannot be selected for ${protocol.value} communication!`
      );
    }

    state.client.device = device;
    state.client.ipAddress = clientAddresses.value[0].value;
    if (device.layerType >= Layer.L4) refreshSocket("client");
  }

  /**
   * Sets a passed device as a server
   * A device must be capable of a current transmission mode
   */
  function setServer(device) {
    if (!isSelectable(device, protocol.value)) {
      throw new Error(
        `${device} cannot be selected for ${protocol.value} communication!`
      );
    }

    state.server.device = device;
    state.server.ipAddress = serverAddresses.value[0].value;
    if (device.layerType >= Layer.L4) refreshSocket("server");
  }

  /**
   * Resets both a server and client sockets
   */
  function refreshSockets() {
    initClientSocket();
    initServerSocket();
  }

  /**
   * Initializes a new active socket with a given type
   * Also deals with following situations resetting client:
   *  1) Client was bound with an active server socket --> set the server socket to its parent so a new client socket can connect
   *
   * Also deals with following situations resetting server:
   *  1) Client was bound --> must reset both client and server socket to prevent collisions
   * @param {String} type A type of a socket "client"/"server"
   */
  function refreshSocket(type) {
    if (type === "client") {
      // If there was a connection with a client, switch to a parent server socket
      // that can serve a new client
      const clientBound = clientSocket.value
        ? clientSocket.value.isBound
        : false;

      if (clientBound && serverSocket.value.parent) {
        serverSocket.value = serverSocket.value.parent;
      }

      initClientSocket();
    } else {
      // If the client socket is bound, meaning that it has some kind of connection, refresh both
      if (clientSocket.value) {
        clientSocket.value.isBound ? initSockets() : initServerSocket();
      }
    }
  }

  /******* Selection of transmitting devices *******/

  /**
   * Sets on of the endpoints client/server for a node selection
   * @param {*} endpoint client/server structures
   */
  function initSelection(type) {
    state.selectType = type;
    addLog(`${capitalize(type)} is being selected... (right click to cancel)`);
  }

  /**
   * Cancels a device selection process (likely with a right click)
   */
  function cancelSelection() {
    state.selectType = null;
  }

  /**
   * Takes a device that the selection is to be applied to
   * (sets a given device as client/server - based on selection)
   * @param {Device} device
   */
  function applySelection(device) {
    if (!state.selectType) return;

    if (device.layerType < Layer.L3) {
      return addLog("Only > L2 devices can be selected!", 5);
    }

    if (state.selectType) {
      state.selectType === "client" ? setClient(device) : setServer(device);

      addLog(`${device.name} set as ${state.selectType}.`, 4);
      state.selectType = null;
    }
  }

  /******* Transmission  *******/

  /*
   * Creates a connection between two selected devices (client, server sockets)
   */
  function connect() {
    if (!clientSocket.value || !serverSocket.value) {
      throw new Error("Both communication endpoints must be specified!");
    }

    if (!clientDevice.value.powerOn) {
      throw new Error(
        `Cannot communicate while the device ${clientDevice.value.name} is off!`
      );
    }

    const history = clientSocket.value.connect(serverSocket.value.localAddress);
    let status = "fail";

    // Set the real connecting server socket as serverSocket
    const childSocket = serverDevice.value.findSocket(
      serverSocket.value.srcPort,
      clientSocket.value.localAddress
    );

    // A server socket creates a connecting socket with a child --> replace a server socket with its child
    if (childSocket) {
      serverSocket.value = childSocket;
      if (childSocket.state === s.ESTABLISHED) status = "success";

      // Set the link between sockets for simplifying sockets selection
      clientSocket.value.setOther(childSocket);
      registerSocket(childSocket);
    }

    addHistory("TCP connection", history, status);
    return history;
  }

  /**
   * Cancels an established connection
   */
  function disconnect() {
    if (!isEstablished.value) throw new Error("No connection to abort!");

    if (!clientDevice.value.powerOn) {
      throw new Error(
        `Cannot communicate while the device ${clientDevice.value.name} is off!`
      );
    }

    const clientSocket = state.client.activeSocket;
    const history = clientSocket.close();

    // On successful closing, replace a child server with a parent
    if (serverSocket.value.state === s.CLOSED) {
      serverSocket.value = serverSocket.value.parent
        ? serverSocket.value.parent
        : serverSocket.value;
    }

    addHistory("TCP close", history);
    return history;
  }

  /**
   * TO BE IMPLEMENTED
   */
  function transmit() {
    if (!(client.value && server.value)) {
      throw new Error(
        "Both client and server must be specified before tranmission!"
      );
    }

    let history = null;
    let historyLabel;
    const payload = state.payload;
    const remoteAddress = serverSocket.value.localAddress;

    switch (state.protocol) {
      case "UDP":
        history = clientSocket.value.sendTo(payload, remoteAddress);
        historyLabel = "UDP transmission";
        break;
      case "TCP":
        history = clientSocket.value.send(payload);
        historyLabel = "TCP transmission";
        break;
    }

    if (history) addHistory(historyLabel, history);
  }

  /**
   * Facilitates a ping between a selected client and server.
   * Both server and client must be either a router or a client.
   * @returns A history object consisting of a root packet that initiated ping
   */
  function ping() {
    if (!clientDevice.value) throw new Error("A sender must be specified!");
    if (!serverDevice.value) throw new Error("A recipient must be specified!");

    if (!clientDevice.value.powerOn) {
      throw new Error(
        `Cannot ping while the device ${clientDevice.value.name} is off!`
      );
    }

    const history = clientDevice.value.ping(state.server.ipAddress);

    addHistory("ICMP ping", history, history.success);
    return history;
  }

  /**
   * Opens a control panel
   */
  function openControl() {
    controlOpen.value = true;
  }

  /**
   * Closes a control panel
   */
  function closeControl() {
    controlOpen.value = false;
  }

  /**
   * Opens and closes a control panel
   */
  function toggleControl() {
    controlOpen.value = !controlOpen.value;
  }

  /**
   * @returns Initializes the default settings for a TransmitStore
   */
  function _initSettings() {
    return {
      protocol: currentMode.value.label,
      payload: null,
      client: {
        type: "client",
        device: null,
        activeSocket: null, // For TCP, UDP transmission
        ipAddress: null, // For a ping
        data: null,
      },
      server: {
        type: "server",
        device: null,
        activeSocket: null,
        ipAddress: null,
        data: null,
      },
      history: [],
      selectType: null, // Defines a type of selected transmitting device (client/server)
    };
  }

  function clear() {
    // state.set(initSettings());
    state.protocol = "ICMP";
    state.payload = null;
    state.client = {
      type: "client",
      device: null,
      activeSocket: null, // For TCP, UDP tranmission
      ipAddress: null, // For a ping
      data: null,
    };
    state.server = {
      type: "server",
      device: null,
      activeSocket: null,
      ipAddress: null,
      data: null,
    };
    state.history = [];
    state.selectType = null;
  }

  return {
    protocol,
    client,
    server,
    sockets,

    clientSocket,
    serverSocket,
    clientDevice,
    serverDevice,
    clientData,
    serverData,
    clientAddresses,
    serverAddresses,
    selectType,
    isEstablished,
    currentMode,
    modes,

    history,
    removeHistory,
    clear,

    setProtocol,
    setServer,
    setClient,
    initSockets,
    initSelection,
    cancelSelection,
    applySelection,
    registerSocket,
    unregisterSocket,
    setActiveSocket,
    onExistingSocket,
    refreshSockets,
    refreshSocket,
    connect,
    disconnect,
    transmit,
    ping,

    controlOpen,
    closeControl,
    openControl,
    toggleControl,

    setSrcIpAddress,
  };
});
