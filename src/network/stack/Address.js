import ByteArray from "../../utils/structures/ByteArray";

export default class Address extends ByteArray {
  constructor(address, numAsBytes = false) {
    super(address, numAsBytes);
  }
}
