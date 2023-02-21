# NONFUNGIBLE PROOF INFORMATION
## Contracts 
The entirety of the contracts is in packages/hardhat/contracts/NFProof.sol . The other contracts in 
The idea of this contract is to Mint an ERC721 token that you can prove ownership from another address (ie COLD WALLET --> HOT WALLET). The NonFungibleProof Token can do this by leveraging IERC4907. This allows the ERC721 token to set a user(another hot wallet address in our case) for the token. For the purpose of our contract, setting the user of a token is granting that wallet Proof of Ownership. 

I'll explain how the contract functions in the next sections.

### Non-Fungible Proof Token
The goal of Non-Fungible Proof Tokens is to allow owners of NFTs tha ability and confidence to use their NFTs safely without risking their assets. 

##### How does it work?
It is pretty simple. Let's give a quick example: Say you want to prove ownership for you Azuki, BAYC, Moonbird, etc NFT from your hot wallet. so you go to mint an Non-Fungible Proof Token.

1. you enter the contract address and token id of the NFT you own (e.g Azuki #1);
2. the contract will verify that you actually own the NFT. then will mint your NFP token. the NFP token will will copy the metadata and image of the original token, so it will be easily recognizeable. 
3. Set your hot wallet address (and the duration) that you want to use prove ownership over you NFP.
Finished:

#### How to deal with underlying NFT ownership changes
Now because most NFTs are freely tradeable and transferable, an NFP token must deal with ownership of the underlying asset(NFT) changing (either through sale or transfer). Since NFP tokens cannot be transferred (they are soulbound to the minters wallet) In order to deal with this, an NFP token will become invalid (through validity checks) if ownership of the underlying NFT changes. In the contract we have a few functions (validity checks) that test whether an NFP token is still valid. These functions are designed to be easily implemented in projects by developers to suit their specific needs. 

The validity check functions are below:
function isValidUserToken(uint256 tokenId) -- the function will take the NFP tokenId and return true if there is 1) a user assigned and 2) the owner(minter) of the NFP is still the valid owner of the underlying NFT

function isValidOwner(uint256 tokenId) -- this function will take the NFP tokenID and return true if the owner is still the valid owner of their underlying asset. This function can be called externally and it is also called internally by other contract functions. 

function validateOwnerUser(address originContract, uint256 originTokenId) -- this function is used to check if the msg.sender is the valid assigned user for the underlying nft(contract + token). the function will take the the underlying asset (nft contract & tokenId), find the corresponding NFP tokenId and check its ownership validity, and then check if the msg.sender is the user wallet assigned to this token. Returns true if everything checks out. This function could be used for tokengating events, website pages, etc. 

function validateVerifyUser(address originContract, uint256 originTokenId, address verifyAddress) -- this function is the same as the function above except that it uses verifyAddress instead of msg.sender. If projects want to implement NFPs into their ecosystem, they might need slightly different functions to meet their use case. 

##### What to do if the owner before you already minted the NFP for your NFT
Since the NFP will already me marked as invalid, so that token will not be able to get any of the benefits of your asset.

However in order to mint your NFP token, you will need to 'burn' the NFP token of the owner before you. (This is done easily through our UI) The contract will simply check if you are the correct owner of the underlying asset, then 'burn' the NFP token of the old owner. 

This is not a traditional burn (it doesn't send to the zero address), it instead erases all of the NFP token information, only keeping its ID. This effectively burns the token, while preserving some features (that will be illuminated on in the next section) and future use cases.


### Use Cases
1) Staking Solutions: A big influence to the creation of this protocol had to do with the APE coin + NFT staking fiasco. BAYC wanted to keep the NFTs freely tradeable (not locked), while still being able to stake APE coin. Their solution to this problem was that instead of locking the NFT + APE coin to accrue rewards, the NFT acted as a key that would unlock rewards and the staked ape coin. 

The issue with this (which was predicted and came to fruition), is that if users lost ownership of their NFT (either through sale or hack), they would also lose access to their locked APE coin and rewards. This could potentially cost users thousands of dollars due to inadequate system design. 

NonFungibleProof tokens would solve these issues. How? Projects could lock the NFPs or use them as the key staking instead of the underlying asset. 