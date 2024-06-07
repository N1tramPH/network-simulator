export const MAX_ADAPTER_COUNT = 4;

// Socket constants
// For simplicity of project, only IPv4 is considered
export const IPV_4 = 0;

// Transport layer constants
export const PORT_COUNT = (1 << 16) - 1;

export const IpVersion = Object.freeze({
  IPV4: "IPV4",
});

export const TransportProtocol = Object.freeze({
  TCP: "TCP",
  UDP: "UDP",
});

export const PacketType = Object.freeze({
  ARP: "ARP",
  ICMP: "ICMP",
  TCP: "TCP",
  UDP: "UDP",
});

export const TcpFlags = {
  URG: 1,
  ACK: 2,
  PSH: 4,
  RST: 8,
  SYN: 16,
  FIN: 32,
};

// Corresponding to OSI architecture, little confusing
export const Layer = {
  L1: 0,
  L2: 1,
  L3: 2,
  L4: 4,
  L5: 8,
  L6: 16,
  L7: 32,
};

export const IcmpType = Object.freeze({
  echoReply: 0,
  dstUnreachable: 3,
  echoRequest: 8,
  timeExceeded: 11,
});

// Only consider types, codes will always be 0
export const IpProtocol = Object.freeze({
  ICMP: 1,
  IGMP: 2,
  TCP: 6,
  UDP: 17,
});

export const FrameType = Object.freeze({
  IPV4: 0x0800,
  ARP: 0x0806,
  VLAN: 0x8100,
});

export const PacketEvent = Object.freeze({
  tcpStateChange: "tcpStateChange",
});

export const DataUnitType = {
  linkFrame: "linkFrame",
  arpMessage: "arpMessage",
  ipPacket: "ipPacket",
  icmpMessage: "icmpMessage",
  udpDatagram: "udpDatagram",
  tcpSegment: "tcpSegment",
  data: "data",
};

export const TcpState = Object.freeze({
  CLOSED: "CLOSED", // Fictional state
  LISTEN: "LISTEN",
  SYN_SENT: "SYN-SENT",
  SYN_RCVD: "SYN-RCVD",
  ESTABLISHED: "ESTABLISHED",
  FIN_WAIT_1: "FIN-WAIT-1",
  FIN_WAIT_2: "FIN-WAIT-2",
  CLOSE_WAIT: "CLOSE-WAIT",
  LAST_ACK: "LAST-ACK",
  TIME_WAIT: "TIME-WAIT",
});
