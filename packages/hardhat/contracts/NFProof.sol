// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IERC4907 {
    // Logged when the user of a token assigns a new user or updates expires
    /// @notice Emitted when the `user` of an NFT or the `expires` of the `user` is changed
    /// The zero address for user indicates that there is no user address
    event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

    /// @notice set the user and expires of a NFT
    /// @dev The zero address indicates there is no user 
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires
    function setUser(uint256 tokenId, address user, uint64 expires) external ;

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT
    function userOf(uint256 tokenId) external view returns(address);

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user 
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(uint256 tokenId) external view returns(uint256);
    
}


error SoulBound();

/// @title Non-Fungible Proof
/// @author ruk.eth
/// @notice This purpose of this contract is to show Proof of Ownership over NFTs. You can mint soulbound NFTs that represent
/// ownership over an nft. You can assign a 'user' to this NFT to prove ownership from a separate wallet
/// @dev This is designed to be used by projects as they see fit. please contact us if you are looking to implement
/// this with your project.
/// @custom:experimental This is an experimental contract.
contract NFProof is IERC4907, IERC721Metadata, ERC721Enumerable, Ownable {
    
    /// @notice stores the user/assigned owner's information for an NFP token. UserInfo includes an expires varable that 
    /// determines when that user designation will expire
    struct UserInfo 
    {
        address user;   // address of user role
        uint64 expires;// unix timestamp, assigned user expires
        uint256 proofTokenId; 
        address originalContract; //address of contract we shadow(are proving ownership of)
        uint256 originalTokenId; // tokenId that we want to shadow
    }

    /// @notice stores the owner/minter's information for an NFP token
    struct OwnerInfo {
        address owner;
        uint256 proofTokenId;
        address originalContract;
        uint256 originalTokenId;
    }

    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 public burnPrice; // how much it costs to burn a token
    uint256 public mintPrice; // how much it costs to mint an NFP. 

    event Mint(uint256 tokenId, address minter);
    event Burn(uint256 tokenId);
    
    mapping (uint256  => UserInfo) public _users;
    mapping (uint256  => OwnerInfo) public _owners;
    mapping(address => mapping(uint256 => uint256)) public tokenToToken; //maps a nft to its corresponding NFP token
    mapping(address => mapping(uint256 => bool)) public tokenHasMinted; //checks whether an nft's corresponding NFP has minted
    mapping(address => mapping(uint256 => bool)) public tokenHasBeenPaidfor; //tracks whether a token has been paid for
    mapping(uint256 => bool) private tokenIsBurning;


    constructor() ERC721("NonFungibleProof","NFP"){
        mintPrice = 1000000000000; //.000001 ether
        burnPrice = 1000000000; //.000000001 ether
     }

    /// @notice can set the mint price of an NFP if we want to change post-deployment 
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    //// @notice projects and people can use this to pay for multiple nps at the same time
    /// @dev projects or users might want to pay for their users NFPs as a reward, prize, etc. 
    /// @param originContractAddress The address of the nft collection
    /// @param originTokenIds an array of token ids that you want to pay for in bul
    function payForMints(address originContractAddress, uint256[] memory originTokenIds) external payable {
        require(originTokenIds.length < 6, "not allowed to pay for more than 5 mints at a time");
        uint256 totalPrice = mintPrice*originTokenIds.length;
        require(msg.value >=totalPrice, "you didn't pay enough for all of these mints");
        for (uint i = 0; i < originTokenIds.length; i++) {
            require(!tokenHasMinted[originContractAddress][originTokenIds[i]], "token already minted");
            require(!tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]], "token already paid for");
            require(IERC721(originContractAddress).ownerOf(originTokenIds[i]) != address(0), "token doesn't exist");
            tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]] = true;
        }
    }

    /// @notice checks to see if a nfp token has a valid owner and user
    /// @dev call this function with nfp tkenId to see if this token has a valid owner and user assigned
    /// @param tokenId the id of the nfp token
    /// @return bool true if token has valid owner and user
    function isValidUserToken(uint256 tokenId) external view returns (bool) {
        if(uint256(_users[tokenId].expires) >=  block.timestamp){
            require(isValidOwner(tokenId) == true, "This item has been sold and transferred");
            return true;
        } else {
            return false;
        }
    }

    //checks to see if the current owner of the proof token is the owner of the actual NFT
    function isValidOwner(uint256 tokenId) public view returns(bool) {
        OwnerInfo memory verifyOwner = _owners[tokenId];
        require(_exists(tokenId), "this token doesn't exist");
        require(IERC721(verifyOwner.originalContract).ownerOf(verifyOwner.originalTokenId) == verifyOwner.owner, "This item has been sold and/or transferred");
        return true;
    }

    //validates a wallet as the owner of a specific token from an nft collection
    function validateOwnerUser(address originContract, uint256 originTokenId) external view returns (bool){
        uint256 proofToken = tokenToToken[originContract][originTokenId];
        require(_exists(proofToken), "this token does not exist or has been burned");
        require(msg.sender == userOf(proofToken), "This wallet is not equal to the nfp user address");
        require(isValidOwner(proofToken) == true, "This is not the valid owner of this NFT");
        return true;
    }

    //works similar to above function, accept that it is attempting to verify a specific address. other contracts could utilize this
    //to verify their users wallet
    function validateVerifyUser(address originContract, uint256 originTokenId, address verifyAddress) external view returns (bool){
        uint256 proofToken = tokenToToken[originContract][originTokenId];
        require(_exists(proofToken), "this token does not exist or has been burned");
        require(verifyAddress == userOf(proofToken), "This wallet is not equal to the nfp user address");
        require(isValidOwner(proofToken) == true, "This is not the valid owner of this NFT");
        return true;
    }

    /// @notice set the user and expires of a NFT
    /// @dev The zero address indicates there is no user 
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires
    function setUser(uint256 tokenId, address user, uint64 expires) public override virtual{
        require(_isApprovedOrOwner(msg.sender, tokenId),"ERC721: transfer caller is not owner nor approved");
        require(expires > block.timestamp, "expires should be in future");
        UserInfo storage info =  _users[tokenId];
        info.user = user;
        info.expires = expires;
        info.proofTokenId = tokenId;
        info.originalContract = _owners[tokenId].originalContract;
        info.originalTokenId = _owners[tokenId].originalTokenId;
        emit UpdateUser(tokenId,user,expires);
    }

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT       
    function userOf(uint256 tokenId) public view override virtual returns(address){
        if( uint256(_users[tokenId].expires) >=  block.timestamp){
            return _users[tokenId].user; 
        } else {
        return address(0);
        }
    }

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user 
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(uint256 tokenId) public view override virtual returns(uint256){
        return _users[tokenId].expires;
    }

    /// @dev See {IERC165-supportsInterface}.
    //Erc721
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    //will find the wallet address that is set as owner given a contract address and tokenId
    //if no valid user is set as owner will return nothing
    function findValidUserProofToken(address originContractAddress, uint256 originTokenId) external view returns (address){
        uint256 proofToken = tokenToToken[originContractAddress][originTokenId];
        require(userOf(proofToken) != address(0), "No valid user assigned");
        require(isValidOwner(proofToken) == true, "This proof token does not have a valid owner");
        return userOf(proofToken);
    }

    //similar to the above function but always returns an address. it will either return the correct 
    //addres  or it will return  address(0) if there is not a valid proof token with valid user assigned
    function findUserProofToken(address originContractAddress, uint256 originTokenId) external view returns (address){
        uint256 proofToken = tokenToToken[originContractAddress][originTokenId];
        if(isValidOwner(proofToken) == true) {
        return userOf(proofToken);
        } else {
        return address(0);
        }
    }

    
    //this willl mint one nft. checks in order 1) if you paid enough for mint 2) if you are the owner of the nft
    //3) check to see if that token has already been minted. 4) make sure your not minting proof of itself. 5. update the owner info in storage.
    function safeMint(address originContractAddress, uint256 originTokenId) public payable returns (uint256){
        require(msg.value>=mintPrice || tokenHasBeenPaidfor[originContractAddress][originTokenId] == true, "you didnt pay enough to the mint troll");
        require(IERC721(originContractAddress).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
        require(!tokenHasMinted[originContractAddress][originTokenId], "token already minted");
        require(originContractAddress != address(this), "cannot mint proof of a proof");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        OwnerInfo storage info =  _owners[tokenId];
        info.owner = msg.sender;
        info.originalContract = originContractAddress;
        info.originalTokenId = originTokenId;
        info.proofTokenId = tokenId;
        tokenToToken[originContractAddress][originTokenId] = tokenId;
        tokenHasMinted[originContractAddress][originTokenId] = true;
        tokenHasBeenPaidfor[originContractAddress][originTokenId] = true;
        tokenIsBurning[tokenId] = false;
        _safeMint(msg.sender, tokenId);
        emit Mint(tokenId, msg.sender);
        return tokenId;
    }

    //this effectively burns the token. it erases all information about the token but does not send it to the burner address
    function burn(address originContractAddress, uint256 originTokenId, uint256 proofTokenId) external payable {
        require(_exists(proofTokenId), "this token does not exist or has been burned");
        require(msg.value>=burnPrice, "you didnt pay enough to the burn troll");
        require(IERC721(originContractAddress).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
        require(tokenToToken[originContractAddress][originTokenId] == proofTokenId, "these do not represent the same token");
        delete tokenToToken[originContractAddress][originTokenId];
        tokenIsBurning[proofTokenId] = true;
        tokenHasMinted[originContractAddress][originTokenId] = false;
        tokenHasBeenPaidfor[originContractAddress][originTokenId] = false;
        emit Burn(proofTokenId);
    }
    
    //if the owner of the token no longer wants it in their wallet, they can burn it themselves
    function burnSelf(uint256 proofTokenId) external {
        require(msg.sender == ownerOf(proofTokenId), "you don't own the token");
        require(tokenIsBurning[proofTokenId] == true, "you need to call burn function prior to burnSelf");
        tokenIsBurning[proofTokenId] = false;
        delete _users[proofTokenId];
        delete _owners[proofTokenId];
        _burn(proofTokenId);
    }

    /// --- Disabling Transfer Of Soulbound NFT --- ///
    // this code is from @author 0xMouseLess

    /// @notice Function disabled as cannot transfer a soulbound nft
    function safeTransferFrom(address, address, uint256,bytes memory) public pure override (ERC721, IERC721) {
        revert SoulBound();
    }

    /// @notice Function disabled as cannot transfer a soulbound nft
    function safeTransferFrom(address, address, uint256 ) public pure override (ERC721, IERC721) {
        revert SoulBound();
    }

    /// @notice Function disabled as cannot transfer a soulbound nft
    function transferFrom(address, address, uint256) public pure override (ERC721, IERC721) {
        revert SoulBound();
    }

    /// @notice Function disabled as cannot transfer a soulbound nft
    function approve(address, uint256) public pure override (ERC721, IERC721) {
        revert SoulBound();
    }

    /// @notice Function disabled as cannot transfer a soulbound nft
    function setApprovalForAll(address, bool) public pure override (ERC721, IERC721) {
        revert SoulBound();
    }

    /// @notice Function disabled as cannot transfer a soulbound nft
    function getApproved(uint256) public pure override (ERC721, IERC721) returns (address) {
        revert SoulBound();
    }

    /// @notice Function disabled as cannot transfer a soulbound nft
    function isApprovedForAll(address, address) public pure override (ERC721, IERC721) returns (bool) {
        revert SoulBound();
    }

    /**
    * This token copies metadata from the original token. 
     */

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, IERC721Metadata) returns (string memory) {
        return IERC721Metadata(_owners[tokenId].originalContract).tokenURI(_owners[tokenId].originalTokenId);
    }

    /**
    * allow the owner to withdraw the money 
    */
    function ethWithdraw() external onlyOwner {
        address contractOwner = msg.sender;
        (bool succ, )= contractOwner.call{value:address(this).balance}("");
        require(succ, "withdraw failed");
    }
 
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721Enumerable){
        super._beforeTokenTransfer(from, to, tokenId);
        if (
            from != to &&
            _users[tokenId].user != address(0) &&       //user present
            block.timestamp >= _users[tokenId].expires  //user expired
        ) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
        //transfers only allowed when the token is either minting or burning.  
        require(from == address(0) || to == address(0), "Not allowed to transfer token"); //only require transfer while burning and minting
    }

    receive() external payable {}
    fallback() external payable {}
} 