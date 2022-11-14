pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Medicine.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Marketplace  {
    using Counters for Counters.Counter;

    Counters.Counter private _marketItemIds;
    Counters.Counter private _tokensSold;
    Counters.Counter private _tokensCanceled;

    address payable private owner;

    uint private listingFee = 0.045 ether;

    mapping(uint => MarketItem) private _marketItemsLookup;

//    struct Roles {
//        address payable creator;
//        address payable seller;
//        address payable owner;
//    }

    struct MarketItem {
        uint marketItemId;
        address nftContractAddress;
        uint tokenId;
        address payable creator;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
        bool canceled;
        bytes32 barcode;
    }

    event MarketItemCreated(
        uint indexed marketItemId,
        address indexed nftContract,
        uint indexed tokenId,
        address creator,
        address seller,
        address owner,
        uint price,
        bool sold,
        bool canceled,
        bytes32 barcode
    );

    constructor()
        public
    {
        owner = payable(msg.sender);
    }

    function getValue()
        public view
        returns (uint)
    {
        return listingFee;
    }

    function createItem(address nftContractAddress, uint tokenId, uint price, bytes32 barcode)
        public payable
        returns (uint)
    {
        require(price > 0, "Price must be > 0");
        require(msg.value == listingFee, "Need 0.75 ether for listing fee");
        _marketItemIds.increment();
        uint marketItemId = _marketItemIds.current();

        address creator = Medicine(nftContractAddress).getMedicineCreator(tokenId);

        _marketItemsLookup[marketItemId] = MarketItem(
            marketItemId,
            nftContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            false,
            barcode
        );

        IERC721(nftContractAddress).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            marketItemId,
            nftContractAddress,
            tokenId,
            payable(creator),
            payable(msg.sender),
            payable(address(0)),
            price,
            false,
            false,
            barcode
        );

        return marketItemId;
    }


    function deleteItem(address nftContractAddress, uint marketItemId) public payable  {
        uint tokenId = _marketItemsLookup[marketItemId].tokenId;
        require(tokenId > 0, "Market item has to exist");

        require(_marketItemsLookup[marketItemId].seller == msg.sender, "Only seller can cancel market item");

        IERC721(nftContractAddress).transferFrom(address(this), msg.sender, tokenId);

        _marketItemsLookup[marketItemId].owner = payable(msg.sender);
        _marketItemsLookup[marketItemId].canceled = true;

        _tokensCanceled.increment();
    }


    function getItem(uint tokenId)
        public view
        returns (MarketItem memory, bool)
    {
        for (uint i = _marketItemIds.current(); i > 0; i--) {
            MarketItem memory item = _marketItemsLookup[i];
            if (item.tokenId == tokenId) {
                return (item, true);
            }
        }

        MarketItem memory emptyMarketItem;
        return (emptyMarketItem, false);
    }


    function createTrade(address nftContractAddress, uint marketItemId)
        public payable
    {
        uint price = _marketItemsLookup[marketItemId].price;
        uint tokenId = _marketItemsLookup[marketItemId].tokenId;
        require(msg.value == price, "Invalid price");

        _marketItemsLookup[marketItemId].owner = payable(msg.sender);
        _marketItemsLookup[marketItemId].sold = true;

        _marketItemsLookup[marketItemId].seller.transfer(msg.value);
        IERC721(nftContractAddress).transferFrom(address(this), msg.sender, tokenId);

        _tokensSold.increment();

        payable(owner).transfer(listingFee);
    }


    function getAllItems()
        public view
        returns (MarketItem[] memory)
    {
        uint availableItemsCount = _marketItemIds.current() - _tokensSold.current() - _tokensCanceled.current();
        MarketItem[] memory marketItems = new MarketItem[](availableItemsCount);

        uint j = 0;
        for (uint i = 1; i <= _marketItemIds.current(); i++) {
            MarketItem memory item = _marketItemsLookup[i];
            if (item.owner == address(0)) {
                marketItems[j] = item;
                j += 1;
            }
        }
        return marketItems;
    }


    function compareStrings(string memory a, string memory b)
        public view
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }


    function getItemByRole(MarketItem memory item, string memory property)
        private view
        returns (address)
    {
        require(
            compareStrings(property, "seller") || compareStrings(property, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );

        return compareStrings(property, "seller") ? item.seller : item.owner;
    }


    function fetchSellingMarketItems()
        public view
        returns (MarketItem[] memory)
    {
        return getItemsByRoleAddress("seller");
    }

    function fetchOwnedMarketItems()
        public view
        returns (MarketItem[] memory)
    {
        return getItemsByRoleAddress("owner");
    }


    function getItemsByRoleAddress(string memory _addressProperty)
        public
        view
        returns (MarketItem[] memory)
    {
        require(
            compareStrings(_addressProperty, "seller") || compareStrings(_addressProperty, "owner"),
            "Parameter must be 'seller' or 'owner'"
        );
        uint totalItemsCount = _marketItemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemsCount; i++) {

            MarketItem storage item = _marketItemsLookup[i + 1];
            address addressPropertyValue = getItemByRole(item, _addressProperty);
            if (addressPropertyValue != msg.sender) continue;
            itemCount += 1;
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint i = 0; i < totalItemsCount; i++) {

            MarketItem storage item = _marketItemsLookup[i + 1];
            address addressPropertyValue = getItemByRole(item, _addressProperty);
            if (addressPropertyValue != msg.sender) continue;
            items[currentIndex] = item;
            currentIndex += 1;
        }

        return items;
    }

//    function verifyMarketItemBarcode(uint marketItemId , string memory barcode) private pure returns (bool) {
//    return compareStrings(_marketItemsLookup[marketItemId].barcode, barcode);
//    }
}
