import { Address, BigInt, BigDecimal, log, ethereum, json } from '@graphprotocol/graph-ts';

import { ADDRESS_ZERO, ZERO_BI, ZERO_BD, ONE_BI, TEN_BI, INI_SCORE, INI_MAXHP, INI_MAXSTAM } from './constants';

import { Meral, MeralAction, Scorecard } from '../../generated/schema';

import { ensureTransaction } from './ensuresCommon';
import { getIdFromType, getTokenIdFromId, getTypeFromId, transactionId } from './helpers';
import { getArtist, getCmId, getCoin, getCostume, getElement, getEyes, getHair, getMainclass, getSkin, getSubclass } from '../metadata/getMeralData';

export function ensureMeral(event: ethereum.Event, meralId: BigInt): Meral {
	let id = meralId.toString();
	let meral = Meral.load(id);
	if (meral) {
		return meral;
	}
	meral = newMeral(event, meralId);
	return meral;
}

export function ensureMeralByType(event: ethereum.Event, type: BigInt, tokenId: BigInt): Meral {
	let meralId = getIdFromType(type, tokenId);
	let id = meralId.toString();
	let meral = Meral.load(id);
	if (meral) {
		return meral;
	}

	meral = newMeral(event, meralId);
	return meral;
}

export function newMeral(event: ethereum.Event, meralId: BigInt): Meral {
	let id = meralId.toString();

	let meral = new Meral(id);
	let type = getTypeFromId(meralId);
	let tokenId = getTokenIdFromId(meralId);
	meral.tokenId = tokenId;
	meral.meralId = meralId;
	meral.type = type;
	meral.timestamp = event.block.timestamp;
	meral.blockNumber = event.block.number;
	meral.creator = ADDRESS_ZERO;
	meral.owner = ADDRESS_ZERO;
	meral.verifiedOwner = ADDRESS_ZERO;
	meral.previousOwner = ADDRESS_ZERO;
	meral.hp = INI_SCORE;
	meral.maxHp = INI_MAXHP;
	meral.elf = ZERO_BI;
	meral.xp = ZERO_BI;
	// STATS
	meral.atk = ZERO_BI;
	meral.def = ZERO_BI;
	meral.spd = ZERO_BI;
	meral.maxStamina = INI_MAXSTAM;
	// METADATA
	meral.cmId = ZERO_BI;
	meral.coin = '';
	meral.name = '';
	meral.element = getElement(ONE_BI);
	meral.mainclass = getMainclass(ONE_BI);
	meral.subclass = getSubclass(ONE_BI);

	if (type === ONE_BI) {
		meral.artist = getArtist(tokenId);
		meral.hair = getHair(tokenId);
		meral.eyes = getEyes(tokenId);
		meral.skin = getSkin(tokenId);
		meral.costume = getCostume(tokenId);
	}

	meral.scorecard = ensureScorecard(meral.id).id;

	meral.burnt = false;
	meral.status = ZERO_BI;
	meral.proxy = true;

	meral.save();

	return meral;
}

export function ensureScorecard(meralId: string): Scorecard {
	let scorecard = Scorecard.load(meralId);
	if (scorecard) {
		return scorecard;
	}

	scorecard = new Scorecard(meralId);
	scorecard.meral = meralId;
	scorecard.highestScore = INI_SCORE;
	scorecard.highestRewards = ZERO_BI; // TODO
	scorecard.battles = ZERO_BI;
	scorecard.wins = ZERO_BI;
	scorecard.revived = ZERO_BI;
	scorecard.reviver = ZERO_BI;
	scorecard.resurrected = ZERO_BI;
	scorecard.reaped = ZERO_BI;
	scorecard.reaper = ZERO_BI;
	scorecard.drained = ZERO_BI;

	scorecard.save();

	return scorecard;
}

export function ensureMeralAction(event: ethereum.Event, meralId: string): MeralAction {
	let id = transactionId(event.transaction) + '/' + meralId;
	let action = MeralAction.load(id);
	if (action) {
		return action;
	}

	action = new MeralAction(id);
	action.meral = meralId;
	action.timestamp = event.block.timestamp;
	action.transaction = ensureTransaction(event).id;
	action.type = 'Default';
	action.save();

	return action;
}
