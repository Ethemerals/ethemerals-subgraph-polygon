import { Address, BigInt, BigDecimal, log, ethereum, json } from '@graphprotocol/graph-ts';

import { ADDRESS_ZERO, ZERO_BI, ZERO_BD, ONE_BI, TEN_BI, INI_SCORE } from './constants';

import { AccountAction, Transaction, Account, Operator, ERC721Contract, EBStakeActive, EBStakeRecord } from '../../generated/schema';

import { ensureTransaction } from './ensuresCommon';
import { transactionId } from './helpers';

export function ensureEBStakeActive(event: ethereum.Event, tokenId: BigInt): EBStakeActive {
	let id = tokenId.toString();

	let stake = EBStakeActive.load(id);
	if (stake) {
		return stake;
	}

	stake = new EBStakeActive(id);
	stake.active = true;
	stake.timestamp = event.block.timestamp;
	stake.meral = '1';
	stake.owner = ADDRESS_ZERO;
	stake.priceFeedId = ONE_BI;
	stake.positionSize = ONE_BI;
	stake.startingPrice = ONE_BI;
	stake.long = true;

	stake.save();

	return stake;
}

export function ensureEBStakeRecord(event: ethereum.Event, tokenId: BigInt): EBStakeRecord {
	let id = tokenId.toString() + '/' + event.block.timestamp.toString();

	let stakeRecord = EBStakeRecord.load(id);
	if (stakeRecord) {
		return stakeRecord;
	}

	stakeRecord = new EBStakeRecord(id);
	stakeRecord.startTime = event.block.timestamp;
	stakeRecord.endTime = event.block.timestamp;
	stakeRecord.meral = '1';
	stakeRecord.owner = ADDRESS_ZERO;
	stakeRecord.priceFeedId = ONE_BI;
	stakeRecord.positionSize = ONE_BI;
	stakeRecord.startingPrice = ONE_BI;
	stakeRecord.long = true;

	stakeRecord.hp = ZERO_BI;
	stakeRecord.elf = ZERO_BI;
	stakeRecord.revived = false;

	stakeRecord.save();

	return stakeRecord;
}
