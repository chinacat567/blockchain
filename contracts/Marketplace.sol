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

    struct MarketItem {
        uint marketItemId;
        address medicineContractAddress;
        uint tokenId;
        address payable creator;
        address payable seller;
        address payable owner;
        uint price;
        bool sold;
        bool canceled;
        bytes32 barcode;
    }


    event MarketItemCreated(uint marketItemId, address medicineContract, uint  tokenId, address creator, address seller,
                            address owner, uint price, bool sold, bool canceled, bytes32 barcode);
    

    address payable private owner;

    uint private fee = 0.001 ether;

    mapping(uint => MarketItem) private _marketItemsLookup;

    //    struct Roles {
    //        address payable creator;
    //        address payable seller;
    //        address payable owner;
    //    }

    
    constructor()
    public
    {
        owner = payable(msg.sender);
    }

    function getFee()
    public view
    returns (uint)
    {
        return fee;
    }

    function createItem(address medicineContractAddress, uint tokenId, uint price, bytes32 barcode)
    public payable
    returns (uint)
    {
        require(price > 0, "Price must be > 0");
        require(msg.value == fee, "Need 0.001 goerli ether for listing fee");
        _marketItemIds.increment();
        uint marketItemId = _marketItemIds.current();

        address creator = Medicine(medicineContractAddress).getMedicineCreator(tokenId);

        _marketItemsLookup[marketItemId] = MarketItem(marketItemId, medicineContractAddress, tokenId,
                                                      payable(creator), payable(msg.sender), payable(address(0)),
                                                      price, false, false, barcode);

        IERC721(medicineContractAddress).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(marketItemId, medicineContractAddress, tokenId, payable(creator),
                               payable(msg.sender), payable(address(0)), price, false, false, barcode);

        return marketItemId;
    }


    function deleteItem(address medicineContractAddress, uint marketItemId) public payable  {
        uint tokenId = _marketItemsLookup[marketItemId].tokenId;
        require(tokenId > 0, "Market item has to exist");

        require(_marketItemsLookup[marketItemId].seller == msg.sender, "Only seller can cancel market item");

        IERC721(medicineContractAddress).transferFrom(address(this), msg.sender, tokenId);

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


    function createTrade(address medicineContractAddress, uint marketItemId)
    public payable
    {
        uint price = _marketItemsLookup[marketItemId].price;
        uint tokenId = _marketItemsLookup[marketItemId].tokenId;
        require(msg.value == price, "Invalid price");

        _marketItemsLookup[marketItemId].owner = payable(msg.sender);
        _marketItemsLookup[marketItemId].sold = true;

        _marketItemsLookup[marketItemId].seller.transfer(msg.value);
        IERC721(medicineContractAddress).transferFrom(address(this), msg.sender, tokenId);

        _tokensSold.increment();

        payable(owner).transfer(fee);
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


    function addressLookup(MarketItem memory item, string memory property)
    private view
    returns (address)
    {
        if (compareStrings(property, "seller")) {
            return item.seller;
        }
        return item.owner;
        
    }


    
    function getItemsByRoleAddress(string memory _addressProperty)
    public
    view
    returns (MarketItem[] memory)
    {
        uint size = 0;
        for (uint i = 1; i <= _marketItemIds.current(); i++) {
            MarketItem storage item = _marketItemsLookup[i];
            address addressPropertyValue = addressLookup(item, _addressProperty);
            if (addressPropertyValue == msg.sender) {
                size += 1;
            }
        }

        MarketItem[] memory result = new MarketItem[](size);
        
        uint j = 0;
        for (uint i = 1; i <= _marketItemIds.current(); i++) {
            MarketItem storage item = _marketItemsLookup[i];
            address addressPropertyValue = addressLookup(item, _addressProperty);
            if (addressPropertyValue == msg.sender) {
                result[j] = item;
                j += 1;
            }
        }
        return result;
    }

    //    function verifyMarketItemBarcode(uint marketItemId , string memory barcode) private pure returns (bool) {
    //    return compareStrings(_marketItemsLookup[marketItemId].barcode, barcode);
    //    }
}