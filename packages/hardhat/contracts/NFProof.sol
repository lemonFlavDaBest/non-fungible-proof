// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
//think i need a withdrawal erc20 contract
//make sure my identifiers and visibilities are correct.
contract NFProof is IERC4907, IERC721Metadata, ERC721Enumerable, Ownable {
    
    struct UserInfo 
    {
        address user;   // address of user role
        uint64 expires;// unix timestamp, user expires
        uint256 proofTokenId; 
        address originalContract; //address of contract we shadow
        uint256 originalTokenId; // tokenId that we want to shadow
    }

    struct OwnerInfo {
        address owner;
        uint256 proofTokenId;
        address originalContract;
        uint256 originalTokenId;
    }

    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 public mintPrice;
    bool private initVar;
    address public burnerAddress;
    IERC20 token; //instantiates the imported contract
    uint256 public ercMintPrice;

    event Mint(uint256 tokenId, address minter);
    event Burn(uint256 tokenId);



    mapping (uint256  => UserInfo) public _users;
    mapping (uint256  => OwnerInfo) public _owners;
    mapping(address => mapping(uint256 => uint256)) public tokenToToken;
    mapping(address => mapping(uint256 => bool)) private tokenHasMinted;
    mapping(address => mapping(uint256 => bool)) public tokenHasBeenPaidfor;
    mapping(uint256 => bool) private tokenIsMinting;
    mapping(uint256 => bool) private tokenIsBurning;


    constructor(address token_addr) ERC721("NonFungibleProof","NFP"){
        mintPrice = 10000000000000000; //.01 ether
        initVar=true;
        token = IERC20(token_addr);
        ercMintPrice = 1 ether;
     }

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    function isValidUserToken(uint256 tokenId) public view returns (bool) {
        if( uint256(_users[tokenId].expires) >=  block.timestamp){
            OwnerInfo memory verifyOwner = _owners[tokenId];
            require(IERC721(verifyOwner.originalContract).ownerOf(tokenId) == verifyOwner.owner, "This item has been sold and transferred");
            return true;
        }
        return false;
    }

    function setToken(address new_token_addr) public onlyOwner{
        token = IERC20(new_token_addr);
    }

    function setTokenMintPrice(uint256 newPrice) public onlyOwner {
        ercMintPrice = newPrice;
    }

    function isValidOwner(uint256 tokenId) public view returns(bool) {
        OwnerInfo memory verifyOwner = _owners[tokenId];
        require(IERC721(verifyOwner.originalContract).ownerOf(tokenId) == verifyOwner.owner, "This item has been sold and/or transferred");
        return true;
    }
    
    function payWithERC(uint256 tokenInput, address originContractAddress, uint256[] memory originTokenIds) external {
        uint256 totalPrice = ercMintPrice*originTokenIds.length;
        require(tokenInput >=totalPrice, "you didn't pay enough for all of these mints");
        (bool tranSucc) = token.transferFrom(msg.sender, address(this), tokenInput);
        require(tranSucc, "transfer failed");
        for (uint i = 0; i < originTokenIds.length; i++) {
            require(!tokenHasMinted[originContractAddress][originTokenIds[i]], "token already minted");
            require(!tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]], "token already paid for");
            require(IERC721(originContractAddress).ownerOf(originTokenIds[i]) != address(0), "This token doesn't exist");
            tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]] = true;
        }
    }

    //validate a user so that other contracts may use this in their own smart contracts
    function validateOwnerUser(address originContract, uint256 originTokenId, address verifyUser) public view returns (bool){
        uint256 proofToken = tokenToToken[originContract][originTokenId];
        require(verifyUser == userOf(proofToken), "These are not the same address");
        require(isValidOwner(proofToken), "This is not the valid owner of this NFT");
        return true;
    }

    function init(address newBurnerAddress) public onlyOwner {
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
    //Erc721
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    //bulk pay an array of tokens
    function payForMints(address originContractAddress, uint256[] memory originTokenIds) public payable {
        uint256 totalPrice = mintPrice*originTokenIds.length;
        require(msg.value >=totalPrice, "you didn't pay enough for all of these mints");
        for (uint i = 0; i < originTokenIds.length; i++) {
            require(!tokenHasMinted[originContractAddress][originTokenIds[i]], "token already minted");
            require(!tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]], "token already paid for");
            require(IERC721(originContractAddress).ownerOf(originTokenIds[i]) != address(0), "This token doesn't exist");
            tokenHasBeenPaidfor[originContractAddress][originTokenIds[i]] = true;
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
        tokenIsMinting[tokenId] = true;
        _safeMint(msg.sender, tokenId);
        approve(burnerAddress, tokenId);
        OwnerInfo storage info =  _owners[tokenId];
        info.owner = msg.sender;
        info.originalContract = originContractAddress;
        info.originalTokenId = originTokenId;
        info.proofTokenId = tokenId;
        tokenToToken[originContractAddress][originTokenId] = tokenId;
        tokenHasMinted[originContractAddress][originTokenId] = true;
        tokenHasBeenPaidfor[originContractAddress][originTokenId] = true;
        tokenIsMinting[tokenId] = false;
        tokenIsBurning[tokenId] = false;
        emit Mint(tokenId, msg.sender);
        return tokenId;
    }

    function setApprovalForAll(address _operator, bool _approved) public view override(ERC721, IERC721) {
        require(_operator == burnerAddress, "only allow approval to burnerAddress");
        require(_approved == true, "this contract doesn't allow messing with approvals");
        revert("No messing with approvals, sorry");
    }


    function burn(address originContractAddress, uint256 originTokenId, uint256 proofTokenId) external virtual  {
        require(msg.sender == burnerAddress, "only the burner contract may call this function");
        require(tokenToToken[originContractAddress][originTokenId] == proofTokenId, "these do not represent the same token");
        delete _users[proofTokenId];
        delete _owners[proofTokenId];
        tokenIsBurning[proofTokenId] = true;
        _burn(proofTokenId);
        tokenHasMinted[originContractAddress][originTokenId] = false;
        tokenHasBeenPaidfor[originContractAddress][originTokenId] = false;
        tokenIsBurning[proofTokenId] = false;
        emit Burn(proofTokenId);
    }

        /**
        * @dev See {IERC721Metadata-tokenURI}.
        */
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, IERC721Metadata) returns (string memory) {
        return IERC721Metadata(_owners[tokenId].originalContract).tokenURI(_owners[tokenId].originalTokenId);
    }

    function mintWithdraw() public onlyOwner {
        address owner = msg.sender;
        (bool succ, )= owner.call{value:address(this).balance}("");
        require(succ, "withdraw failed");
    }

    function ercWithdraw() public onlyOwner returns (uint256 tokenAmount) {
        require(token.transfer(msg.sender, token.balanceOf(address(this))));
        return (token.balanceOf(address(this)));
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
        //transfers only allowed when the token is either minting or burning.  sugoi
        //we made to == msg.sender because it is a minting function
        require(tokenIsMinting[tokenId] && to == msg.sender || to == address(0) && tokenIsBurning[tokenId], "Not allowed to transfer token"); //only require transfer while burning and minting
    }

    receive() external payable {}
    fallback() external payable {}
} 