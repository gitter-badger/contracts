import * as _ from 'lodash';
import ethUtil = require('ethereumjs-util');
import promisify = require('es6-promisify');
import Web3 = require('web3');
import { crypto } from './crypto';
import { OrderParams } from './types';

export class Order {
  public params: OrderParams;
  constructor(params: OrderParams) {
    this.params = params;
  }
  public isValidSignature() {
    const { v, r, s } = this.params;
    if (_.isUndefined(v) || _.isUndefined(r) || _.isUndefined(s)) {
      throw new Error('Cannot call isValidSignature on unsigned order');
    }
    const orderHash = this.getOrderHash();
    const msgHash = ethUtil.hashPersonalMessage(orderHash);
    try {
      const pubKey = ethUtil.ecrecover(msgHash, v, ethUtil.toBuffer(r), ethUtil.toBuffer(s));
      const recoveredAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(pubKey));
      return recoveredAddress === this.params.maker;
    } catch (err) {
      return false;
    }
  }
  public async signAsync() {
    const orderHash = this.getOrderHash();
    // The eth_sign RPC call functions differently on testrpc and geth clients. Geth clients add
    // the personal message header before sending the request, whereas testrpc does not.
    // TODO: In order to run the tests against any client, add client detection and conditionally add the
    // personal message header when needed.
    const msgHash = ethUtil.hashPersonalMessage(orderHash);
    const signature = await promisify(web3.eth.sign)(this.params.maker, ethUtil.bufferToHex(msgHash));
    const { v, r, s } = ethUtil.fromRpcSig(signature);
    this.params = _.assign(this.params, {
      orderHashHex: ethUtil.bufferToHex(orderHash),
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    });
  }
  public createFill(shouldCheckTransfer: boolean, fillValueM?: string) {
    const fill = {
      traders: [this.params.maker, this.params.taker],
      tokens: [this.params.tokenM, this.params.tokenT],
      feeRecipient: this.params.feeRecipient,
      shouldCheckTransfer,
      values: [this.params.valueM, this.params.valueT],
      fees: [this.params.feeM, this.params.feeT],
      expiration: this.params.expiration,
      fillValueM: fillValueM || this.params.valueM,
      v: this.params.v,
      rs: [this.params.r, this.params.s],
    };
    return fill;
  }
  public createCancel(cancelValueM?: string) {
    const cancel = {
      traders: [this.params.maker, this.params.taker],
      tokens: [this.params.tokenM, this.params.tokenT],
      feeRecipient: this.params.feeRecipient,
      values: [this.params.valueM, this.params.valueT],
      fees: [this.params.feeM, this.params.feeT],
      expiration: this.params.expiration,
      cancelValueM: cancelValueM || this.params.valueM,
    };
    return cancel;
  }
  private getOrderHash() {
    const orderHash = crypto.solSHA3([
      this.params.exchange,
      this.params.maker,
      this.params.taker,
      this.params.tokenM,
      this.params.tokenT,
      this.params.feeRecipient,
      this.params.valueM,
      this.params.valueT,
      this.params.feeM,
      this.params.feeT,
      this.params.expiration,
    ]);
    return orderHash;
  }
}
