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

/// @notice this is our custom error to prevent token transfers. 
error SoulBound();

/// @title Non-Fungible Proof
/// @author ruk.eth
/// @notice This purpose of this contract is to show Proof of Ownership over NFTs. You can mint soulbound NFTs that represent
/// ownership over an nft. You can assign a 'user' to this NFT to prove ownership from a separate wallet
/// @notice when we refer to a 'valid NFP token'; we mean 1) valid user is assigned -- an non-zero address that hasn't expired.
/// and 2) there is a valid owner -- the owner/minter of the NFP token still owns the underlying NFT they are proving ownership over
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

    /// @notice checks to see if an NFP token's underlying asset is still the valid owner. ie the underlying asset has 
    /// not been sold or transferred. 
    /// @dev is called internally and can be called externally. checks to see if an NFP token id has a valid owner/ if the nfp is 
    /// still valid
    /// @param tokenId the tokenId of the nfp
    /// @return will return true if the owner of the NFP is still the owner of the original contract/token
    function isValidOwner(uint256 tokenId) public view returns(bool) {
        OwnerInfo memory verifyOwner = _owners[tokenId];
        require(_exists(tokenId), "this token doesn't exist");
        require(IERC721(verifyOwner.originalContract).ownerOf(verifyOwner.originalTokenId) == verifyOwner.owner, "This item has been sold and/or transferred");
        return true;
    }

    /// @notice this function takes an nft contract address and token as input. it returns true if the sender is the user assigned to
    /// the nfp and the nfp owner/minter is still the valid owner of the underlying nft.
    /// @dev call this to find if there is a valid nfp with a valid user for an nft 
    /// @param originContract The contract address of the nft you want to check
    /// @param originTokenId The tokenId of the nft you want to check for
    /// @return returns true if the owner is valid and the user is the msg.sender
    function validateOwnerUser(address originContract, uint256 originTokenId) external view returns (bool){
        uint256 proofToken = tokenToToken[originContract][originTokenId];
        require(_exists(proofToken), "this token does not exist or has been burned");
        require(msg.sender == userOf(proofToken), "This wallet is not equal to the nfp user address");
        require(isValidOwner(proofToken) == true, "This is not the valid owner of this NFT");
        return true;
    }

    /// @notice Works similar to the above function. except instead of checking for msg.sender it checks for verifyAddress
    /// (an address you will input into the function). you supply an NFT token and user address -- it will return true 
    /// that supplied user address is the user assigned to that NFT tokens corresponding NFP token. 
    /// @dev call this to find you want to verify if an address is the valid user assigned to a valid NFP (the owner/minter of the NFP
    ///  is still the valid owner of the udnerlying asset)
    /// @param originContract The contract address of the nft you want to check
    /// @param originTokenId The tokenId of the nft you want to check for
    /// @param verifyAddress the address you want to check to see if it is the user assigned assigned to the corresponding NFP
    /// @return returns true if the owner is valid and the user is the msg.sender
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
    /// @param tokenId The NFP token to get the user address for
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
    /// @param tokenId The NFP token to get the user address for
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
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @notice input an underlying nft contract and tokenId and this function returns to the user assigned to 
    /// its NFP token, if it exists. 
    /// @dev will return user assigned to the NFP token of an underlying asset. 
    /// @param originContract The contract address of the nft you want to check
    /// @param originTokenId The tokenId of the nft you want to check for
    /// @return address of the user assigned to that token
    function findValidUserProofToken(address originContract, uint256 originTokenId) external view returns (address){
        uint256 proofToken = tokenToToken[originContract][originTokenId];
        require(userOf(proofToken) != address(0), "No valid user assigned");
        require(isValidOwner(proofToken) == true, "This proof token does not have a valid owner");
        return userOf(proofToken);
    }

    /// @notice works exactly the same as the above function but returns a zero address if there is not a valid owner and 
    /// user assigned.
    function findUserProofToken(address originContract, uint256 originTokenId) external view returns (address){
        uint256 proofToken = tokenToToken[originContract][originTokenId];
        if(isValidOwner(proofToken) == true) {
        return userOf(proofToken);
        } else {
        return address(0);
        }
    }

    
    /// @notice the minting function. checks to ensure you own the underlying NFT then mints an NFP token for you
    /// @dev does checks, stores information about the NFP token, then mints a token.
    /// @param originContract The contract address of the nft you want to mint an NFP token for
    /// @param originTokenId The tokenId of the nft you want to mint an NFP token for
    /// @return the tokenId that you minted
    function safeMint(address originContract, uint256 originTokenId) public payable returns (uint256){
        require(msg.value>=mintPrice || tokenHasBeenPaidfor[originContract][originTokenId] == true, "you didnt pay enough to the mint troll");
        require(IERC721(originContract).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
        require(!tokenHasMinted[originContract][originTokenId], "token already minted");
        require(originContract != address(this), "cannot mint proof of a proof");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        OwnerInfo storage info =  _owners[tokenId];
        info.owner = msg.sender;
        info.originalContract = originContract;
        info.originalTokenId = originTokenId;
        info.proofTokenId = tokenId;
        tokenToToken[originContract][originTokenId] = tokenId;
        tokenHasMinted[originContract][originTokenId] = true;
        tokenHasBeenPaidfor[originContract][originTokenId] = true;
        tokenIsBurning[tokenId] = false;
        _safeMint(msg.sender, tokenId);
        emit Mint(tokenId, msg.sender);
        return tokenId;
    }

    /// @notice Our burn functions but it doesn't actually burn the token in the traditional sense. just invalidates the token 
    /// and removes some of the properties. this can only be called by the owner of the undlerying NFT
    /// @dev this will remove properties of the token without destroying the token. so if user still needs the token to withdrawal
    /// or other emergency actions like that, they will be able to. but they will not gain any benefits of a valid NFP token
    function burn(address originContract, uint256 originTokenId, uint256 proofTokenId) external payable {
        require(_exists(proofTokenId), "this token does not exist or has been burned");
        require(msg.value>=burnPrice, "you didnt pay enough to the burn troll");
        require(IERC721(originContract).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
        require(tokenToToken[originContract][originTokenId] == proofTokenId, "these do not represent the same token");
        delete tokenToToken[originContract][originTokenId];
        tokenIsBurning[proofTokenId] = true;
        tokenHasMinted[originContract][originTokenId] = false;
        tokenHasBeenPaidfor[originContract][originTokenId] = false;
        emit Burn(proofTokenId);
    }
    
    /// @notice since the burn function only removes properties and not the actual token. this will allow the owner of the
    /// nfp to actually burn the token. 
    function burnSelf(uint256 proofTokenId) external {
        require(msg.sender == ownerOf(proofTokenId), "you don't own the token");
        require(tokenIsBurning[proofTokenId] == true, "you need to call burn function prior to burnSelf");
        tokenIsBurning[proofTokenId] = false;
        delete _users[proofTokenId];
        delete _owners[proofTokenId];
        _burn(proofTokenId);
    }

    /// --- Disabling Transfer Of Soulbound NFT --- ///
    /// Code provides additional assurance that NFP tokens are soulbound and cannot be transferred. 
    ///this code is from @author 0xMouseLess

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

    ///This token copies metadata from the original token so that it is recognizeable and a match.. 
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, IERC721Metadata) returns (string memory) {
        return IERC721Metadata(_owners[tokenId].originalContract).tokenURI(_owners[tokenId].originalTokenId);
    }

    ///allows the owner of the contract to withdraw money 
    
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
        //an additional check: transfers only allowed when the token is either minting or burning.  
        require(from == address(0) || to == address(0), "Not allowed to transfer token"); //only require transfer while burning and minting
    }

    receive() external payable {}
    fallback() external payable {}
} 