import { Address, BigInt, BigDecimal, log, ethereum } from '@graphprotocol/graph-ts';
import { addressId, getIdFromType, getMainclassFromSubclass, transactionId } from '../utils/helpers';

import { ensureAccount, ensureAccountAction, ensureERC721Contract, ensureOperator } from '../utils/ensuresAccount';
import { ensureMeral, ensureMeralAction, ensureMeralByType, ensureScorecard } from '../utils/ensuresMerals';

import { ADDRESS_ZERO, ZERO_BI, ZERO_BD, ONE_BI, TEN_BI, INI_SCORE, INI_MAXHP, INI_MAXSTAM, ETERNALBATTLE_ADDRESS, BURN_ADDRESS } from '../utils/constants';
import {
	MeralManager,
	Approval,
	ApprovalForAll,
	AuthChange,
	ChangeELF,
	ChangeElement,
	ChangeHP,
	ChangeStats,
	ChangeXP,
	ContractRegistered,
	InitMeral,
	Transfer,
	MeralStatusChange,
	MeralOwnerChange,
	ChangeCMID,
	ChangeMax,
} from '../../generated/MeralManager/MeralManager';

import { Account, AccountAction } from '../../generated/schema';
import { getCmId, getCoin } from '../metadata/getMeralData';
import { getContractBaseURI, getContractName } from '../contractData/contractData';

export function handleApproval(event: Approval): void {
	// The following functions can then be called on this contract to access
	// state variables and other data:
	//
	// - contract.allMerals(...)
	// - contract.balanceOf(...)
	// - contract.exists(...)
	// - contract.getApproved(...)
	// - contract.getIdFromType(...)
	// - contract.getMeralByContractAndTokenId(...)
	// - contract.getMeralById(...)
	// - contract.getMeralByType(...)
	// - contract.getTokenIdFromId(...)
	// - contract.getTypeByContract(...)
	// - contract.getTypeFromId(...)
	// - contract.gmAddresses(...)
	// - contract.isApprovedForAll(...)
	// - contract.meralContracts(...)
	// - contract.meralOwners(...)
	// - contract.meralType(...)
	// - contract.name(...)
	// - contract.owner(...)
	// - contract.ownerOf(...)
	// - contract.ownerOfByType(...)
	// - contract.supportsInterface(...)
	// - contract.symbol(...)
	// - contract.tokenURI(...)
	// - contract.typeCounter(...)
}

export function handleMeralOwnerChange(event: MeralOwnerChange): void {
	let token = ensureMeral(event, event.params.id);
	let account = ensureAccount(event, addressId(event.params.newOwner));
	token.verifiedOwner = account.id;
	token.save();
}
export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleAuthChange(event: AuthChange): void {}

export function handleChangeELF(event: ChangeELF): void {
	let token = ensureMeral(event, event.params.id);
	token.elf = event.params.elf;
	token.save();
}

export function handleChangeElement(event: ChangeElement): void {
	let token = ensureMeral(event, event.params.id);
	token.element = BigInt.fromI32(event.params.element);
	token.save();
}

export function handleChangeHP(event: ChangeHP): void {
	let token = ensureMeral(event, event.params.id);
	token.hp = BigInt.fromI32(event.params.hp);
	token.save();
}

export function handleChangeStats(event: ChangeStats): void {
	let token = ensureMeral(event, event.params.id);
	token.atk = BigInt.fromI32(event.params.atk);
	token.def = BigInt.fromI32(event.params.def);
	token.spd = BigInt.fromI32(event.params.spd);
	token.save();
}

export function handleChangeXP(event: ChangeXP): void {
	let token = ensureMeral(event, event.params.id);
	token.xp = event.params.xp;
	token.save();
}

export function handleMeralStatusChange(event: MeralStatusChange): void {
	let token = ensureMeral(event, event.params.id);
	token.status = BigInt.fromI32(event.params.status);
	token.save();
}

export function handleTransfer(event: Transfer): void {
	let token = ensureMeral(event, event.params.tokenId);
	let tokenAction = ensureMeralAction(event, token.id);

	// NORMAL TRANSFER TO
	let accountTo = ensureAccount(event, addressId(event.params.to));
	let accountToAction = ensureAccountAction(event, accountTo.id);

	// NORMAL TRANSFER FROM
	let accountFrom = ensureAccount(event, addressId(event.params.from));
	let accountFromAction = ensureAccountAction(event, accountFrom.id);

	tokenAction.type = 'Transfer';
	tokenAction.description = `Transfered from ${accountFrom.id}`;

	accountToAction.type = 'Receive';
	accountToAction.description = `Received ${token.tokenId} from ${accountFrom.id}`;

	accountFromAction.type = 'Send';
	accountFromAction.description = `Sent ${token.tokenId} to ${accountTo.id}`;

	// ORDER OF ACTION
	token.previousOwner = accountFrom.id;
	token.owner = addressId(event.params.to);

	// MINT
	if (accountFrom.id == ADDRESS_ZERO) {
		token.previousOwner = ADDRESS_ZERO;
		token.creator = accountTo.id;
		token.owner = accountTo.id;
		token.verifiedOwner = accountTo.id;
		token.status = BigInt.fromI32(2);
		tokenAction.type = 'Minted';
		tokenAction.description = `Proxied by ${accountTo.id}`;
		accountToAction.type = 'Minted';
		accountToAction.description = `Proxied Meral #${token.tokenId}`;
	}

	// BURN
	if (accountTo.id == ADDRESS_ZERO) {
		token.owner = accountTo.id;
		token.status = ZERO_BI;
		token.burnt = true;
		accountFromAction.type = 'Burnt';
		accountFromAction.description = `Burnt Meral #${token.tokenId}`;
	}

	// STAKING ADDRESSES

	// UNSTAKE ETERNAL BATTLE
	if (accountFrom.id == ETERNALBATTLE_ADDRESS) {
		tokenAction.type = 'Unstaked';
		tokenAction.description = `Return from Eternal Battle`;
		accountToAction.type = 'Unstaked';
		accountToAction.description = `Retrieve ${token.tokenId} from Eternal Battle`;
	}

	// STAKE ETERNAL BATTLE
	if (accountTo.id == ETERNALBATTLE_ADDRESS) {
		tokenAction.type = 'Staked';
		tokenAction.description = `Enter the Eternal Battle`;
		accountFromAction.type = 'Staked';
		accountFromAction.description = `Sent ${token.tokenId} to Eternal Battle`;
	}

	// BURN ADDRESS
	if (accountTo.id == BURN_ADDRESS) {
		accountFromAction.type = 'Burnt';
		accountFromAction.description = `Burnt Meral #${token.tokenId}`;
	}

	token.save();
	tokenAction.save();
	accountTo.save();
	accountFrom.save();
	accountFromAction.save();
	accountToAction.save();
}

export function handleContractRegistered(event: ContractRegistered): void {
	let contract = ensureERC721Contract(event, addressId(event.params.contractAddress));
	contract.type = event.params.meralType;
	contract.address = addressId(event.params.contractAddress);
	contract.baseURI = getContractBaseURI(contract.type);
	contract.name = getContractName(contract.type);
	contract.save();
}

export function handleInitMeral(event: InitMeral): void {
	let token = ensureMeralByType(event, event.params.meralType, event.params.tokenId);
	let scorecard = ensureScorecard(token.id);
	let creator = ensureAccount(event, addressId(event.params.owner));

	token.status = ONE_BI;
	token.creator = creator.id;
	token.owner = creator.id;
	token.verifiedOwner = creator.id;
	token.type = event.params.meralType;

	token.hp = BigInt.fromI32(event.params.hp);
	token.elf = event.params.elf;

	token.atk = BigInt.fromI32(event.params.atk);
	token.def = BigInt.fromI32(event.params.def);
	token.spd = BigInt.fromI32(event.params.spd);
	token.cmId = event.params.cmId;

	if (token.type == ONE_BI) {
		token.coin = getCoin(token.tokenId);
		token.name = getCoin(token.tokenId);
	}

	token.element = BigInt.fromI32(event.params.element);
	token.subclass = BigInt.fromI32(event.params.subclass);
	token.mainclass = getMainclassFromSubclass(token.subclass);

	scorecard.highestRewards = token.elf;

	token.save();
	scorecard.save();
	creator.save();
}

export function handleChangeCMID(event: ChangeCMID): void {}

export function handleChangeMax(event: ChangeMax): void {}
