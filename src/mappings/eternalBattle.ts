import { BigInt } from '@graphprotocol/graph-ts';
import { EternalBattle, StakeCanceled, StakeCreated, TokenRevived } from '../../generated/EternalBattle/EternalBattle';
import { ONE_BI } from '../utils/constants';
import { ensureEBStakeActive, ensureEBStakeRecord } from '../utils/ensureEternalBattle';
import { ensureAccount, ensureAccountAction } from '../utils/ensuresAccount';
import { ensureMeral, ensureMeralAction, ensureScorecard } from '../utils/ensuresMerals';

export function handleStakeCanceled(event: StakeCanceled): void {
	let tokenId = event.params.tokenId;
	let stake = ensureEBStakeActive(event, tokenId);

	let meral = ensureMeral(event, tokenId);
	let meralAction = ensureMeralAction(event, meral.id);

	let account = ensureAccount(event, meral.verifiedOwner);
	let accountAction = ensureAccountAction(event, account.id);

	let meralScorecard = ensureScorecard(meral.id);

	stake.active = false;

	// RECORD
	let stakeRecord = ensureEBStakeRecord(event, tokenId);
	stakeRecord.startTime = stake.timestamp;
	stakeRecord.endTime = event.block.timestamp;
	stakeRecord.meral = meral.id;
	stakeRecord.owner = account.id;
	stakeRecord.priceFeedId = stake.priceFeedId;
	stakeRecord.positionSize = stake.positionSize;
	stakeRecord.startingPrice = stake.startingPrice;
	stakeRecord.long = stake.long;
	stakeRecord.hp = event.params.change;
	stakeRecord.elf = event.params.reward;

	meralAction.type = 'Unstaked';
	meralAction.description = `Return from Eternal Battle`;
	accountAction.type = 'Unstaked';
	accountAction.description = `Retrieve ${meral.tokenId} from Eternal Battle`;

	if (event.params.win) {
		meralScorecard.wins = meralScorecard.wins.plus(ONE_BI);
	}

	stake.save();
	stakeRecord.save();
	meralAction.save();
	accountAction.save();
	meralScorecard.save();
}

export function handleStakeCreated(event: StakeCreated): void {
	let tokenId = event.params.tokenId;
	let stake = ensureEBStakeActive(event, tokenId);

	let meral = ensureMeral(event, tokenId);
	let meralAction = ensureMeralAction(event, meral.id);

	let account = ensureAccount(event, meral.verifiedOwner);
	let accountAction = ensureAccountAction(event, account.id);

	let meralScorecard = ensureScorecard(meral.id);

	stake.active = true;
	stake.timestamp = event.block.timestamp;
	stake.meral = meral.id;
	stake.owner = account.id;
	stake.priceFeedId = event.params.priceFeedId;
	stake.positionSize = event.params.positionSize;
	stake.startingPrice = event.params.startingPrice;
	stake.long = event.params.long;

	meralAction.type = 'Staked';
	meralAction.description = `Enter the Eternal Battle`;
	accountAction.type = 'Staked';
	accountAction.description = `Sent ${meral.tokenId} to Eternal Battle`;

	meralScorecard.battles = meralScorecard.battles.plus(ONE_BI);

	stake.save();
	meralAction.save();
	accountAction.save();
	meralScorecard.save();
}

export function handleTokenRevived(event: TokenRevived): void {
	let tokenId = event.params.tokenId;
	let tokenId2 = event.params.reviver;
	let stake = ensureEBStakeActive(event, tokenId);

	let meral = ensureMeral(event, tokenId);
	let meralAction = ensureMeralAction(event, meral.id);

	let meral2 = ensureMeral(event, tokenId2);
	let meral2Action = ensureMeralAction(event, meral2.id);

	let account = ensureAccount(event, meral.verifiedOwner);
	let accountAction = ensureAccountAction(event, account.id);

	let account2 = ensureAccount(event, meral2.verifiedOwner);
	let account2Action = ensureAccountAction(event, account2.id);

	let meralScorecard = ensureScorecard(meral.id);
	let meral2Scorecard = ensureScorecard(meral2.id);

	stake.active = false;

	// RECORD
	let stakeRecord = ensureEBStakeRecord(event, tokenId);
	stakeRecord.startTime = stake.timestamp;
	stakeRecord.endTime = event.block.timestamp;
	stakeRecord.meral = meral.id;
	stakeRecord.owner = account.id;
	stakeRecord.priceFeedId = stake.priceFeedId;
	stakeRecord.positionSize = stake.positionSize;
	stakeRecord.startingPrice = stake.startingPrice;
	stakeRecord.long = stake.long;
	stakeRecord.revived = true;
	stakeRecord.reviver = meral2.id;

	meralAction.type = 'Revived';
	meralAction.description = `Revived from Eternal Battle`;
	accountAction.type = 'Receive';
	accountAction.description = `Received ${meral.tokenId} from Eternal Battle`;

	meral2Action.type = 'Reviver';
	meral2Action.description = `Revived ${meral.tokenId} from Eternal Battle`;
	account2Action.type = 'Reviver';
	account2Action.description = `Revived ${meral.tokenId} from Eternal Battle`;

	meralScorecard.revived = meralScorecard.revived.plus(ONE_BI);
	meral2Scorecard.reviver = meral2Scorecard.reviver.plus(ONE_BI);

	stake.save();
	stakeRecord.save();
	meralAction.save();
	meral2Action.save();
	accountAction.save();
	account2Action.save();
	meralScorecard.save();
	meral2Scorecard.save();
}
