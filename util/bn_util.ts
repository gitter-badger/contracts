import BN = require('bn.js');
import BigNumber = require('bignumber.js');

type BNValue = number|string|BigNumber;

export const BNUtil = {
  add(numA: BNValue, numB: BNValue): string {
    const a = new BigNumber(numA);
    const b = new BigNumber(numB);
    const result = a.plus(b);
    return result.toString();
  },
  sub(numA: BNValue, numB: BNValue): string {
    const a = new BigNumber(numA);
    const b = new BigNumber(numB);
    const result = a.minus(b);
    return result.toString();
  },
  mul(numA: BNValue, numB: BNValue): string {
    const a = new BigNumber(numA);
    const b = new BigNumber(numB);
    const result = a.times(b);
    return result.toString();
  },
  div(numA: BNValue, numB: BNValue, decimalPlaces: number = 18): string {
    BigNumber.config({
      DECIMAL_PLACES: decimalPlaces,
    });
    const a = new BigNumber(numA);
    const b = new BigNumber(numB);
    const result = a.dividedBy(b);
    return result.toString();
  },
  cmp(numA: BNValue, numB: BNValue): BigNumber {
    const a = new BigNumber(numA);
    const b = new BigNumber(numB);
    return a.comparedTo(b);
  },
  toBuffer(num: number, size: number = 32, endian: string = 'be'): Buffer {
    return new BN(num.toString()).toArrayLike(Buffer, endian, size);
  },
  toSmallestUnits(num: number, decimals: number = 18): string {
    const a = new BigNumber(num);
    const unit = new BigNumber(10).pow(decimals);
    const result = a.times(unit);
    return result.toString();
  },
};
