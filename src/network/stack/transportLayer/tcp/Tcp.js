import { useSimulationStore } from "../../../../stores/SimulationStore";
import {
  TcpState as s,
  TcpFlags as f,
  IpProtocol,
  PacketType,
} from "../../../../utils/constants";
import { hasFlags } from "../../../../utils/utils";
import TcpSegment from "./TcpSegment";
import Socket from "../../socket/Socket";
import Packet from "../../../Packet";

function getTcpTitle(segment) {
  const flags = segment.getFlags();
  const flagKeys = [];

  Object.keys(f).forEach((flagKey) => {
    if (hasFlags(flags, f[flagKey])) flagKeys.push(flagKey);
  });

  return flagKeys.join("+");
}

function getTcpSubtitle(segment) {
  const subtitle = [];
  const seqNum = segment.seqNum.decimal;
  const ackNum = segment.ackNum.decimal;
  const data = segment.data;

  data
    ? subtitle.push(`seq: ${seqNum}-${seqNum + data - 1}`)
    : subtitle.push(`seq: ${seqNum}`);

  if (ackNum) subtitle.push(`ack: ${ackNum}`);

  return subtitle.join(" ");
}

export default class Tcp {
  constructor() {}

  _process_ack(packet, socket) {
    const segment = packet.getUnit(TcpSegment);
    let ackNum = segment.ackNum.decimal - 1;

    // Acknowledgment is lower than one already acknowledged
    if (ackNum <= socket.seqNum) return false;
    socket.seqNum = ackNum;

    // Mechanism for handling unacknowledged multiple chunks TO BE IMPLEMENTED

    return true;
  }

  /**
   * Delivers received segment data to a given socket
   * while taking care of:
   * - setting ACK number
   * - setting unordered data to temp buffer
   * @param {Socket} socket
   * @param {TcpSegment} rcvSegment
   */
  _deliverData(packet, socket, rcvSegment) {
    const data = rcvSegment.data;

    // Received seqNum to be compared with kept expected seqNum (socket.ackNum)
    const seqNum = rcvSegment.seqNum.decimal;

    // Obtaining other side's ISN
    if (!socket.ackNum && seqNum) {
      // Increment ISN to indicate first following expected byte
      socket.ackNum = seqNum + 1;
      return packet.report(
        `${socket.type === "client" ? "Server" : "Client"}'s ISN = ${seqNum}`
      );
    }

    // Received seqNum matches expected first byte
    // - new data/FIN arrived at right order
    if (seqNum == socket.ackNum) {
      socket.ackNum = data ? seqNum + data : seqNum + 1;
      return socket.receive(data, seqNum); // Pass up to socket
    }

    // Out of order data, keep it in the buffer
    if (seqNum > socket.ackNum) {
      return socket.receiveMap.set(seqNum, data);
    }
  }

  /**
   * Updates the state of the of a server  socket
   * based on received flags
   * @param {Packet} packet
   * @param {Socket} socket
   * @param {tcpFlags} flags
   */
  _handleClientFlags(packet, socket, flags) {
    if (hasFlags(flags, f.SYN)) {
      packet.report("Connection request\nreceived");
      socket.setState(s.SYN_RCVD, packet);
      return { respond: [f.SYN, f.ACK] };
    }

    if (hasFlags(flags, f.ACK)) {
      this._process_ack(packet, socket);

      if (socket.state === s.SYN_RCVD) {
        packet.report("TCP connection\nestablished!");
        socket.setState(s.ESTABLISHED, packet);

        return { respond: null }; // Stop
      }

      if (socket.state === s.CLOSE_WAIT && !socket.hasData()) {
        packet.report("No more data to be sent\nclosing...");
        socket.setState(s.LAST_ACK, packet);
        socket.seqNum++; // Increment seqNum on sending FIN
        return { respond: [f.FIN] };
      }

      if (socket.state === s.LAST_ACK) {
        packet.report("TCP connection\n closed!");
        socket.setState(s.CLOSED, packet);
        socket.destroy();

        return { respond: null }; // Send FIN to finish closing
      }
    }

    // Server will keep a connection as long as there's data left
    if (hasFlags(flags, f.FIN)) {
      if (socket.state !== s.ESTABLISHED) return {}; // Should never occur

      const closeOnFin = useSimulationStore().immediateTcpClose;
      socket.setState(s.CLOSE_WAIT, packet);
      if (!closeOnFin && socket.hasData()) {
        packet.report("More data\nto be sent");
      } else {
        socket.setState(s.LAST_ACK);
        return { respond: [f.FIN] };
      }
    }

    const data = socket.getData();
    return { respond: [f.ACK], ...data };
  }

  /**
   * Updates the state of the of a client Socket
   * based on received flags
   * @param {Packet} packet
   * @param {Socket} socket
   * @param {tcpFlags} flags
   */
  _handleServerFlags(packet, socket, flags) {
    // Acknowledge server's SYN to finish a 3-phase handshake
    if (hasFlags(flags, f.SYN) && socket.state === s.SYN_SENT) {
      packet.report("Finishing\n3-phase handshake...");
      socket.setState(s.ESTABLISHED, packet);
    }

    if (hasFlags(flags, f.ACK) && socket.state !== s.CLOSED) {
      this._process_ack(packet, socket);

      // Server acknowledges FIN, connection is closed for client
      if (socket.state === s.FIN_WAIT_1) {
        packet.report("Keeping one-sided\n connection...");
        socket.setState(s.FIN_WAIT_2, packet);
      }
    }

    // Server sends its last segment, aborts the half-connection, acknowledge with ACK
    if (hasFlags(flags, f.FIN)) {
      packet.report("Connection closed");
      socket.setState(s.TIME_WAIT); // Wait some time to ensure ACK arrived to a server
      // socket.destroy();
      setTimeout(() => {
        socket.destroy();
      }, 1500);
    }

    return { respond: [f.ACK] }; // respond with ACK in all cases
  }

  /**
   * Processes a received Packet updating and
   * does a necessary actions (updating socket state, create a response etc.)
   * @param {Packet} packet A received Packet containing a TCP segment
   * @param {Socket} socket A server socket that deals with an sender of TCP segment
   * @returns
   */
  handle(packet, socket) {
    let response = packet.createChild(null, "TCP segment"); // Create an uncommitted response
    const rcvSegment = packet.getUnit(TcpSegment);
    const flags = rcvSegment.getFlags();

    // Pass received data to the socket, update ackNum
    this._deliverData(packet, socket, rcvSegment);

    // Process flags, decide whether to respond, what data and seqNum
    const { respond, data, seqNum } =
      socket.type === "client"
        ? this._handleServerFlags(packet, socket, flags)
        : this._handleClientFlags(packet, socket, flags);

    // Packet handled without response
    if (!respond) return null;

    // If not specified, socket's seqNum is used
    if (seqNum) {
      // Increment seqNum on sending data
      response.seqNum = data ? seqNum + 1 : seqNum;
    }

    // Set required data for encapsulate method
    response.data = data;
    response.flags = respond;
    response.socket = socket;

    this.encapsulate(response);
    return response;
  }

  encapsulate(packet) {
    let segment = new TcpSegment(packet.data);
    let seqNum = packet.seqNum;
    const socket = packet.socket;
    packet.ipProtocol = IpProtocol.TCP;
    packet.data = segment;

    if (packet.flags) segment.setFlags(...packet.flags);

    // Socket has received any seqNum before
    if (socket.ackNum) segment.ack = 1;

    // Fill the segment with socket info
    segment.srcPort = socket.srcPort;
    segment.dstPort = socket.dstPort;
    segment.ackNum = socket.ackNum ? socket.ackNum : 0;
    segment.seqNum = seqNum ? seqNum : socket.seqNum;

    // Set the sub/title accordingly
    packet.title = getTcpTitle(segment);
    packet.subtitle = getTcpSubtitle(segment);
    packet.type = PacketType.TCP;

    return segment;
  }
}
