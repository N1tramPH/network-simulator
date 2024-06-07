/*
  This js file contains the definitions of DataUnit structures.
  Class definitions of DataUnits are dynamically created based these structures.
  Furthermore, this structure information is used for rendering of PacketView.

  Having these structure definitions at one place has its some advantages such as:
  - Changing the structure of any DataUnit from one file.
  - Class definitions of specific DataUnits is leaner -> simpler maintenance 
    -> contains only very specific definition for a DataUnit etc.
*/

const structItem = (
  title,
  propName,
  bitStart,
  bitCount,
  special = null,
  reprFun = null
) => {
  const struct = {
    title: title,
    propName: propName,
    bitStart: bitStart,
    bitCount: bitCount,
    reprFun: reprFun, // Function converting a prop value to a specific format
  };
  if (special) {
    struct.special = special;
  }

  return struct;
};

export const STRUCT_DATA = "data";
export const STRUCT_OPTIONS = "options";

/*

name: Title of the data structure
headerByteLength: Byte size if the data structure header
  - used for ByteArray memory allocation
bitWidth: Limits the width of data structure in DataUnit view
items: objects representing items of the data structure defined by:
  - title
  - getter, setter name
  - starting bit index
  - bit offset
*/

export const rawDataStruct = {
  name: "Raw data",
  headerByteLength: 0,
  bitWidth: 32,
  items: [structItem("Data", "data", 0, 32, STRUCT_DATA)],
};

export const udpSegmentStruct = {
  name: "UDP datagram",
  headerByteLength: 8,
  bitWidth: 32,
  items: [
    structItem("Source port", "srcPort", 0, 16),
    structItem("Destination port", "dstPort", 16, 16),
    structItem("Datagram length", "datagramLength", 32, 16),
    structItem("Checksum", "checksum", 48, 16),
    structItem("Data", "data", 0, 32, STRUCT_DATA),
  ],
};

export const tcpSegmentStruct = {
  name: "TCP segment",
  headerByteLength: 20,
  bitWidth: 32,
  items: [
    structItem("Source port", "srcPort", 0, 16),
    structItem("Destination port", "dstPort", 16, 16),
    structItem("Sequence number", "seqNum", 32, 32),
    structItem("Acknowledgement number", "ackNum", 64, 32),
    structItem("Header length", "headerLength", 96, 4),
    structItem("Reserved", "reserved", 100, 6),
    structItem("URG", "urg", 106, 1),
    structItem("ACK", "ack", 107, 1),
    structItem("PSH", "psh", 108, 1),
    structItem("RST", "rst", 109, 1),
    structItem("SYN", "syn", 110, 1),
    structItem("FIN", "fin", 111, 1),
    structItem("Window size", "windowSize", 112, 16),
    structItem("Checksum", "checksum", 128, 16),
    structItem("Urgent pointer", "urgPointer", 144, 16),
    structItem("Options", "options", 0, 32, STRUCT_OPTIONS),
    structItem("Data", "data", 0, 32, STRUCT_DATA),
  ],
};

export const icmpMessageStruct = {
  name: "ICMP message",
  headerByteLength: 4,
  bitWidth: 32,
  items: [
    structItem("Type", "type", 0, 8),
    structItem("Code", "code", 8, 8),
    structItem("Checksum", "checksum", 16, 16),
    structItem("Content", "content", 32, 32),
  ],
};

export const ipPacketStruct = {
  name: "IP packet",
  headerByteLength: 20,
  bitWidth: 32,
  items: [
    structItem("IP version", "ipVersion", 0, 4),
    structItem("Header length", "headerLength", 4, 4),
    structItem("Type of service", "typeOfService", 8, 8),
    structItem("Total length", "totalLength", 16, 16),
    structItem("Identification", "identification", 32, 16),
    structItem("Flags", "flags", 48, 3),
    structItem("Fragment offset", "fragmentOffset", 51, 13),
    structItem("Time to live", "timeToLive", 64, 8),
    structItem("Protocol", "protocol", 72, 8),
    structItem("Header checksum", "headerChecksum", 80, 16),
    structItem("Source IP", "srcIpAddress", 96, 32, null, (val) =>
      val.toString(10, " ", 0)
    ),
    structItem("Destination IP", "dstIpAddress", 128, 32, null, (val) =>
      val.toString(10, " ", 0)
    ),
    structItem("Options", "options", 0, 32, STRUCT_OPTIONS),
    structItem("Data", "data", 0, 32, STRUCT_DATA),
  ],
};

export const arpMessageStruct = {
  name: "ARP message",
  headerByteLength: 28,
  bitWidth: 48,
  items: [
    structItem("MAC length", "macLength", 0, 8),
    structItem("IP length", "ipLength", 8, 8),
    structItem("Operation", "operation", 16, 16),
    structItem("Source MAC", "srcMacAddress", 32, 48, null, (value) =>
      value.toString(16, " ", 2, "0")
    ),
    structItem("Source IP", "srcIpAddress", 80, 32, null, (value) =>
      value.toString(10, " ", 0)
    ),
    structItem("MAC type", "macType", 112, 16),
    structItem("Destination MAC", "dstMacAddress", 128, 48, null, (value) =>
      value.toString(16, " ", 2, "0")
    ),
    structItem("Destination IP", "dstIpAddress", 176, 32, null, (value) =>
      value.toString(10, " ", 0)
    ),
    structItem("IP type", "ipType", 208, 16),
  ],
};

export const linkFrameStruct = {
  name: "Link frame (Ethernet II)",
  headerByteLength: 18,
  bitWidth: 200,
  items: [
    structItem("Destination MAC", "dstMacAddress", 0, 48, null, (value) =>
      value.toString(16, " ", 2, "0")
    ),
    structItem("Source MAC", "srcMacAddress", 48, 48, null, (value) =>
      value.toString(16, " ", 2, "0")
    ),
    structItem("Type", "type", 96, 16),
    structItem("Data", "data", 0, 56, STRUCT_DATA),
    structItem("FCS", "checksum", 112, 32),
  ],
};
