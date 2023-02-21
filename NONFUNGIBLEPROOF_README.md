# NONFUNGIBLE PROOF INFORMATION
## Contracts 
The entirety of the contracts is in packages/hardhat/contracts/NFProof.sol . The other contracts in 
The idea of this contract is to Mint an ERC721 token that you can prove ownership from another address (ie COLD WALLET --> HOT WALLET). The NonFungibleProof Token can do this by leveraging IERC4907. This allows the ERC721 token to set a user(another wallet address) for the token.

I'll explain how the contract functions in the next sections.

### Non-Fungible Proof Token
The goal of Non-Fungible Proof Tokens is to allow owners of NFTs tha ability and confidence to use their NFTs safely without risking their assets. 

##### How does it work?
It is pretty simple. Let's give a quick example: Say you want to prove ownership for you Azuki, BAYC, Moonbird, etc NFT from your hot wallet. so you go to mint an Non-Fungible Proof Token.
1. you enter the contract address and token id of the NFT you own (e.g Azuki #1);
2. the contract will verify that you actually own the NFT. then will mint your NFP token. the NFP token will will copy the metadata and image of the original token, so it will be easily recognizeable. 
3. Set your hot wallet address (and the duration) that you want to use prove ownership over you NFP.

### Use Cases
1) Staking Solutions: 