import gsap from "gsap";
import { useSimulationStore } from "../stores/SimulationStore";
import { PacketEvent as pe } from "../utils/constants";
import { Report } from "../network/Packet";
import Packet from "../network/Packet";
import Device from "../network/devices/Device";

/**
 * Creates an message sequence animation composed from Reports.
 * A text message is set on a designated a element of a Device component
 * - this element is specified by id `report-${device.id}`
 * @param {Device} device Device to have reports displayed on
 * @param  {...Report} reports Reports to be display
 * @returns A report sequence animation.
 */
function report(device, ...reports) {
  if (!device) return null;

  const tl = gsap.timeline();

  reports.forEach(({ msg, duration }) => {
    const tl2 = gsap.timeline();
    tl2.fromTo(
      `#report-${device.id}`,
      {
        opacity: 0,
        display: "none",
        innerHTML: msg,
      },
      {
        opacity: 1,
        display: "block",
        innerHTML: msg, // Needs to be repeated so it persists on reverse
      }
    );
    tl2.to(`#report-${device.id}`, {
      opacity: 0,
      duration: duration,
      ease: "power1.in",
      display: "none",
    });
    tl.add(tl2);
  });

  return tl;
}

// A mapping of supported animations
export const eventMap = new Map([
  [
    pe.tcpStateChange,
    (p, d) => report(d, new Report(`${p.stateBefore}→${p.stateAfter}`, 1.2)),
  ],
]);

/******* Physical transfer animation *******/

const moveOutYOffset = 38;

// Move up the device effect
export function outMove(packet) {
  const tl = gsap.timeline();
  tl.fromTo(
    `#${packet.id}`,
    {
      x: packet.startPoint.x,
      y: packet.startPoint.y,
      yPercent: -90,
      opacity: 0,
    },
    {
      duration: 0.5,
      y: packet.startPoint.y - moveOutYOffset,
      opacity: 1,
      visibility: 1,
      display: "block",
    }
  );
  return tl;
}

// Move from one device endpoint position to another
export function transferMove(packet) {
  return gsap.to(`#${packet.id}`, {
    duration: 1,
    x: packet.endPoint.x,
    y: packet.endPoint.y - moveOutYOffset,
  });
}

// Move in the device effect
export function inMove(packet) {
  return gsap.to(`#${packet.id}`, {
    duration: 0.35,
    y: packet.endPoint.y,
    opacity: 0,
    display: "none",
  });
}

// Animates a whole physical transmission between devices
export function transmission(packet) {
  if (!packet.transmitted) return null;

  const timeline = gsap.timeline();
  timeline.add(outMove(packet));
  timeline.add(transferMove(packet));
  timeline.add(inMove(packet));

  return timeline;
}

/**
 * Animate all the events ocurring at a given device
 * @param {Packet} packet
 * @param {Array} events An array of packetEvents of a Report instances
 * @param {Device} device A device where events ocurr
 * @returns An animations of all events ocurring on a given device
 */
function animateEvents(packet, events, device) {
  if (events.length) {
    const subTl = gsap.timeline();
    events.forEach((e) => {
      let animation;
      if (typeof e === "string") {
        if (eventMap.has(e)) {
          animation = eventMap.get(e)(packet, device);
        }
      } else if (e instanceof Report) {
        animation = report(device, e);
      }

      if (animation) subTl.add(animation);
    });
    return subTl;
  }
  return null;
}

/**
 * Animates the Packet events occuring before its transmission
 * @param {Packet} packet
 * @returns
 */
function animateBefore(packet) {
  return animateEvents(packet, packet.eventsBefore, packet.startPoint);
}

/**
 * Animates the Packet events occuring after its transmission
 * @param {Packet} packet
 * @returns
 */
function animateAfter(packet) {
  return animateEvents(packet, packet.eventsAfter, packet.endPoint);
}

/**
 *
 * @param {Packet} packet
 * @param {} tl
 * @returns
 */
export function animate(packets, tl = null) {
  tl = tl ? tl : gsap.timeline();

  // Visualize reports?
  const showReports = useSimulationStore().showReports;

  // As for now, reports are the only events, this needs to be
  // dealt with separately as new type of events will be implemented
  if (showReports) {
    packets.forEach((p) => {
      tl.add(animateBefore(p), `${p.label}-b`);
      tl.add(transmission(p), p.label);
      tl.add(animateAfter(p), `${p.label}-a`);
    });
  } else {
    packets.forEach((p) => {
      if (p.transmitted) tl.add(transmission(p), p.label);
    });
  }

  // Animate the endEvents on a root (could be extended chosen nodes in the future)
  const root = packets[0];
  if (root.endEvents) {
    tl.add(animateEvents(root, root.endEvents, root.startPoint));
  }

  return tl;
}
