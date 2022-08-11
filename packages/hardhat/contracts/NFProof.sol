// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
//import "./IERC4907.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

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

contract NFProof is IERC4907, IERC721, ERC721, ERC721Burnable, ERC721Enumerable, Ownable {
    
    struct UserInfo 
    {
        address user;   // address of user role
        uint64 expires; // unix timestamp, user expires
        address originalContract; //address of contract we shadow
        uint256 originalTokenId; // tokenId that we want to shadow
    }

    struct OwnerInfo {
        address owner;
        uint256 shadowTokenId;
        address originalContract;
        uint256 originalTokenId;

    }

    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 public mintPrice;
    bool private initVar;
    address public burnerAddress;
    string public nfpBaseURI;
    string public nfpURI;

    event Mint(uint256 tokenId, address minter);



    mapping (uint256  => UserInfo) private _users;
    mapping (uint256  => OwnerInfo) private _owners;
    mapping(address => mapping(uint256 => uint256)) public tokenToToken;
    mapping(address => mapping(uint256 => bool)) private tokenHasMinted;
    mapping(address => mapping(uint256 => bool)) public tokenHasBeenPaidfor;
    mapping(uint256 => bool) private tokenIsMinting;
    mapping(uint256 => bool) private tokenIsBurning;

    constructor()
     ERC721("NonFungibleProof","NFP"){
        mintPrice = 10000000000000000; //.01 ether
        initVar=true;
     }

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    function setNFPBaseURI(string calldata newBaseURI) public onlyOwner {
        nfpBaseURI = newBaseURI;
    }

    function setNFPURI(string calldata newURI) public onlyOwner {
        nfpURI = newURI;
    }

    function init(address newBurnerAddress)public onlyOwner {
        require(initVar=true, "this has already been run");
        burnerAddress = newBurnerAddress;
        initVar = false;
    }

    /// @notice set the user and expires of a NFT
    /// @dev The zero address indicates there is no user 
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires
    function setUser(uint256 tokenId, address user, uint64 expires) public override virtual{
        require(_isApprovedOrOwner(msg.sender, tokenId),"ERC721: transfer caller is not owner nor approved");
        require(userOf(tokenId)==address(0),"User already assigned");
        require(expires > block.timestamp, "expires should be in future");
        UserInfo storage info =  _users[tokenId];
        info.user = user;
        info.expires = expires;
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
        }
        return address(0);
    }


    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user 
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(uint256 tokenId) public view override virtual returns(uint256){
        return _users[tokenId].expires;
    }

    /// @dev See {IERC165-supportsInterface}.
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    //bulk mint an array of tokens
    function payForTokens(address originContractAddress, uint256[] memory originTokenIds) public payable {
        uint256 totalPrice = mintPrice*originTokenIds.length;
        require(msg.value >=totalPrice, "you didn't pay enough for all of these mints");
        for (uint i = 0; i < originTokenIds.length; i++) {
            require(!tokenHasMinted[originContractAddress][originTokenIds[i]], "token already minted");
            require(!tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]], "token already paid for");
            tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]] = true;
        }
    }

    //this willl mint one nft. checks in order 1) if you paid enough for mint 2) if you are the owner of the nft
    //3) check to see if that token has already been minted. update the owner info in storage.
    function safeMint(address originContractAddress, uint256 originTokenId) public payable returns (uint256){
        require(msg.value>=mintPrice || tokenHasBeenPaidfor[originContractAddress][originTokenId] == true, "you didnt pay enough to the mint troll");
        require(IERC721(originContractAddress).ownerOf(originTokenId) == msg.sender, "You do not own this NFT");
        require(!tokenHasMinted[originContractAddress][originTokenId], "token already minted");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        tokenIsMinting[tokenId] = true;
        _safeMint(msg.sender, tokenId);
        approve(burnerAddress, tokenId);
        OwnerInfo storage info =  _owners[tokenId];
        info.owner = msg.sender;
        info.originalContract = originContractAddress;
        info.originalTokenId = originTokenId;
        tokenToToken[originContractAddress][originTokenId] = tokenId;
        tokenHasMinted[originContractAddress][originTokenId] = true;
        tokenHasBeenPaidfor[originContractAddress][originTokenId] = true;
        tokenIsMinting[tokenId] = false;
        tokenIsBurning[tokenId] = false;
        emit Mint(tokenId, msg.sender);
        return tokenId;
    }

    function burn(address originContractAddress, uint256 originTokenId, uint256 proofTokenId) external payable virtual{
        require(msg.sender == burnerAddress, "this aint authorized");
        require(tokenToToken[originContractAddress][originTokenId] == proofTokenId, "these do not represent the same token");
        delete _users[proofTokenId];
        delete _owners[proofTokenId];
        tokenIsBurning[proofTokenId] = true;
        _burn(proofTokenId);
        tokenHasMinted[originContractAddress][originTokenId] = false;
        tokenHasBeenPaidfor[originContractAddress][originTokenId] = false;
        tokenIsBurning[proofTokenId] = false;
    }

    function mintWithdraw() public onlyOwner {
        address owner = msg.sender;
        (bool succ, )= owner.call{value:address(this).balance}("");
        require(succ, "withdraw failed");
    }

    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable){
        super._beforeTokenTransfer(from, to, tokenId);
        if (
            from != to &&
            _users[tokenId].user != address(0) &&       //user present
            block.timestamp >= _users[tokenId].expires  //user expired
        ) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
        require(tokenIsMinting[tokenId] || to == address(0) && tokenIsBurning[tokenId], "Not allowed to transfer token");
    }

} 