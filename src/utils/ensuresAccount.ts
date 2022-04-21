import { Address, BigInt, BigDecimal, log, ethereum, json } from '@graphprotocol/graph-ts';

import { ADDRESS_ZERO, ZERO_BI, ZERO_BD, ONE_BI, TEN_BI, INI_SCORE } from './constants';

import { AccountAction, Transaction, Account, Operator, ERC721Contract } from '../../generated/schema';

import { ensureTransaction } from './ensuresCommon';
import { transactionId } from './helpers';

export function ensureERC721Contract(event: ethereum.Event, id: string): ERC721Contract {
	let erc721Contract = ERC721Contract.load(id);
	if (erc721Contract) {
		return erc721Contract;
	}

	erc721Contract = new ERC721Contract(id);
	erc721Contract.address = ADDRESS_ZERO;
	erc721Contract.timestamp = event.block.timestamp;
	erc721Contract.blockNumber = event.block.number;
	erc721Contract.type = ZERO_BI;
	erc721Contract.save();

	return erc721Contract;
}

export function ensureOperator(event: ethereum.Event, operatorAddress: string, ownerAddress: string): Operator {
	let id = operatorAddress + '/' + ownerAddress;
	let operator = Operator.load(id);
	if (operator) {
		return operator;
	}

	operator = new Operator(id);
	operator.timestamp = event.block.timestamp;
	operator.blockNumber = event.block.number;
	operator.approved = false;
	operator.owner = ownerAddress;
	operator.save();

	return operator;
}

export function ensureAccount(event: ethereum.Event, id: string): Account {
	let account = Account.load(id);
	if (account) {
		return account;
	}

	account = new Account(id);
	account.elfBalance = ZERO_BI;
	account.timestamp = event.block.timestamp;
	account.blockNumber = event.block.number;
	account.allowDelegates = false;
	account.save();

	return account;
}

export function ensureAccountAction(event: ethereum.Event, accountId: string): AccountAction {
	let id = transactionId(event.transaction) + '/' + accountId;
	let action = AccountAction.load(id);
	if (action) {
		return action;
	}

	action = new AccountAction(id);
	action.account = accountId;
	action.timestamp = event.block.timestamp;
	action.transaction = ensureTransaction(event).id;
	action.type = 'Default';
	action.save();

	return action;
}
