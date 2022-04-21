import { Address, BigInt, BigDecimal, log, ethereum } from '@graphprotocol/graph-ts';
import { ZERO_BI } from './constants';

export function transactionId(tx: ethereum.Transaction): string {
	return tx.hash.toHex();
}

export function addressId(address: Address): string {
	return address.toHexString();
}

const typeMult = BigInt.fromI32(1000000);

export function getTypeFromId(id: BigInt): BigInt {
	let type = id.div(typeMult);
	return type;
}

export function getTokenIdFromId(id: BigInt): BigInt {
	let type = getTypeFromId(id);
	let mult = type.times(typeMult);
	return id.minus(mult);
}

export function getIdFromType(type: BigInt, tokenId: BigInt): BigInt {
	let mult = type.times(typeMult);
	return tokenId.plus(mult);
}

export function getMainclassFromSubclass(subclass: BigInt): BigInt {
	if (subclass < BigInt.fromI32(4)) {
		return BigInt.fromI32(0);
	}
	if (subclass < BigInt.fromI32(8)) {
		return BigInt.fromI32(1);
	}
	if (subclass < BigInt.fromI32(12)) {
		return BigInt.fromI32(2);
	}
	return BigInt.fromI32(0);
}
