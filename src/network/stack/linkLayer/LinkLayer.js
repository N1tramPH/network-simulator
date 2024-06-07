import { FrameType } from "../../../utils/constants.js";
import Layer from "../Layer.js";
import LinkFrame from "./LinkFrame.js";
import Arp from "./AddressResolution/Arp.js";

export default class LinkLayer extends Layer {
  constructor(stack) {
    super(stack);
    this.dataUnit = LinkFrame;
    this.networkAdapters = stack.networkAdapters;

    // ARP stack, including ARP table

    /**
     * An ARP stack
     * @type {Arp}
     */
    this.arp = new Arp(stack, this.networkAdapters);
  }

  toString() {
    return "Link layer";
  }

  acceptFromUpper(packet) {
    const frame = this.encapsulate(packet);
    const route = packet.route;
    frame.type = FrameType.IPV4;

    // Obtaining the MAC address from ARP
    const dstMacAddress = this.arp.resolve(route.gateway, packet);
    if (!dstMacAddress) return;

    // Create a frame with given dst MAC
    frame.dstMacAddress = dstMacAddress;
    frame.srcMacAddress = packet.outIface.macAddress;

    this.sendToLower(packet);
  }

  acceptFromLower(packet) {
    const frame = this.decapsulate(packet);
    const type = frame.type.decimal;

    if (type === FrameType.ARP) {
      const arpMessage = frame.data;
      return this.arp.resolveMessage(arpMessage, packet);
    } else if (type == FrameType.IPV4) {
      this.sendToUpper(packet);
    }
  }

  sendToLower(packet) {
    const iface = packet.outIface;
    iface.send(packet);
  }
}
