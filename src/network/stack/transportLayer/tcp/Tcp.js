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

/**
 * Generates a title for a TCP segment packet, consisting of all flags set in the segment.
 * The title is a string of all flag names separated by a plus sign.
 * For example, "SYN+ACK".
 * @param {TcpSegment} segment TCP segment to generate title for
 * @returns {string} Title string
 */
function getTcpTitle(segment) {
  const flags = segment.getFlags();
  const flagKeys = [];

  Object.keys(f).forEach((flagKey) => {
    if (hasFlags(flags, f[flagKey])) flagKeys.push(flagKey);
  });

  return flagKeys.join("+");
}

/**
 * Creates a subtitle for a TCP segment packet, consisting of its sequence number range
 * and acknowledgement number, if any.
 * For example, "seq: 0-1000, ack: 2000" or just "seq: 1000" if the segment doesn't contain ACK nor data.
 *
 * @param {TcpSegment} segment TCP segment to generate subtitle for
 * @returns {string} subtitle string
 */
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

  /**
   * Processes the acknowledgment of a received segment
   * by updating socket's sequence number and possibly handling unacknowledged data
   * @param {Packet} packet A received packet with a TCP segment
   * @param {Socket} socket A socket to be updated
   * @returns {boolean} True if the acknowledgment was processed, false otherwise
   */
  _processAck(packet, socket) {
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
   *  - setting ACK number
   *  - setting unordered data to temp buffer
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
      this._processAck(packet, socket);

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

      if (!closeOnFin && socket.hasData()) {
        socket.setState(s.CLOSE_WAIT, packet);
        packet.report("More data\nto be sent");
      } else {
        socket.setState(s.LAST_ACK, packet);
        return { respond: [f.FIN] };
      }
    }

    const data = socket.getData();
    return { respond: [f.ACK], ...data };
  }

  /**
   * Updates the state of the server socket based on received flags
   *
   * @param {Packet} packet - A received Packet containing a TCP segment
   * @param {Socket} socket - A server socket that deals with an sender of TCP segment
   * @param {tcpFlags} flags - Flags received in a TCP segment
   * @returns {Object} - An object containing a response to be sent along with TCP flags
   */
  _handleServerFlags(packet, socket, flags) {
    // If the server socket is in SYN_SENT state and the received flags contain SYN,
    // the connection is established and the server socket is moved to the ESTABLISHED state
    if (socket.state === s.SYN_SENT && hasFlags(flags, f.SYN)) {
      socket.setState(s.ESTABLISHED, packet);
      packet.report("Finishing 3-phase handshake...");
    }

    // If the client socket is not in the CLOSED state and the received flags contain ACK,
    // process the acknowledgement and update the client state accordingly
    if (socket.state !== s.CLOSED && hasFlags(flags, f.ACK)) {
      this._processAck(packet, socket);
      if (socket.state === s.FIN_WAIT_1) {
        packet.report("Keeping one-sided connection...");
        socket.setState(s.FIN_WAIT_2, packet);
      }
    }

    // If the received flags contain FIN, the server socket state is moved to TIME_WAIT,
    // a timeout is set and the socket is destroyed after the timeout
    if (hasFlags(flags, f.FIN)) {
      packet.report("Connection closed");
      socket.setState(s.TIME_WAIT); // Wait some time to ensure ACK arrived to a server
      setTimeout(() => socket.destroy(), 1500);
    }

    return { respond: [f.ACK] }; // respond with ACK in all cases
  }

  /**
   * Processes a received packet and performs necessary actions
   * like updating the socket state, creating a response, etc.
   *
   * @param {Packet} packet - A received packet containing a TCP segment
   * @param {Socket} socket - A server socket that deals with the sender of TCP segment
   * @returns {Packet | null} - A response packet or null if no response is needed
   */
  handle(packet, socket) {
    // Create an uncommitted response packet
    let response = packet.createChild(null, "TCP segment");
    const rcvSegment = packet.getUnit(TcpSegment);
    const flags = rcvSegment.getFlags();

    // Pass received data to the socket and update ackNum
    this._deliverData(packet, socket, rcvSegment);

    // Process flags, decide whether to respond, what data and seqNum
    const { respond, data, seqNum } =
      socket.type === "client"
        ? this._handleServerFlags(packet, socket, flags)
        : this._handleClientFlags(packet, socket, flags);

    // Packet handled without response
    if (!respond) return null;

    // If not specified, use the socket's seqNum
    if (seqNum) {
      // Increment seqNum on sending data
      response.seqNum = data ? seqNum + 1 : seqNum;
    }

    // Set required data for encapsulate method
    response.data = data;
    response.flags = respond;
    response.socket = socket;

    // Encapsulate the response packet
    this.encapsulate(response);
    return response;
  }

  /**
   * Encapsulates a packet with a TCP segment and sets the necessary information.
   *
   * @param {Object} packet - The packet to be encapsulated.
   * @param {any} packet.data - The data to be encapsulated.
   * @param {number} packet.seqNum - The sequence number of the packet.
   * @param {Socket} packet.socket - The socket associated with the packet.
   * @param {Array} [packet.flags] - Optional flags to set on the TCP segment.
   * @return {TcpSegment} The encapsulated TCP segment.
   */
  encapsulate(packet) {
    let segment = new TcpSegment(packet.data);
    const socket = packet.socket;

    if (packet.flags) segment.setFlags(...packet.flags);

    // Socket has received any seqNum before
    if (socket.ackNum) segment.ack = 1;

    // Fill the segment with socket info
    segment.srcPort = socket.srcPort;
    segment.dstPort = socket.dstPort;
    segment.ackNum = socket.ackNum ? socket.ackNum : 0;
    segment.seqNum = packet.seqNum ? packet.seqNum : socket.seqNum;

    // Set the sub/title accordingly
    packet.title = getTcpTitle(segment);
    packet.subtitle = getTcpSubtitle(segment);
    packet.type = PacketType.TCP;

    packet.ipProtocol = IpProtocol.TCP;
    packet.data = segment;

    return segment;
  }
}
