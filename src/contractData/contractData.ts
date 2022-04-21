import { Address, BigInt, BigDecimal, log, ethereum } from '@graphprotocol/graph-ts';

export function getContractBaseURI(type: BigInt): string {
	if (type == BigInt.fromI32(1)) {
		return 'api.ethemerals.com/api/';
	}
	return '';
}

export function getContractName(type: BigInt): string {
	if (type == BigInt.fromI32(1)) {
		return 'Ethemerals';
	}
	return '';
}
