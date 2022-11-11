/* 11/10/22 : Sumantra Sharma reference https://docs.openzeppelin.com/contracts/3.x/erc721#constructing_an_erc721_token_contract
*/
pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Medicine.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Marketplace  {
    using Counters for Counters.Counter;

    Counters.Counter private _medicineTokenIds;
    Counters.Counter private _soldCounter;
    Counters.Counter private _cancelledCounter;

    address payable public _owner;
    
    mapping(uint => Medicine) public _medicineTokenIdToMedicine;

    struct Roles {
        address payable creator;
        address payable seller;
        address payable owner;
    }
    
    struct Medicine {
        uint medicineTokenId;
        address medicineContractAddress;
        uint tokenId;
        Roles roles;
        uint price;
        bool sold;
        bool cancelled;
        bytes32 barcode;
    }

//    event MedicineCreated(uint medicineTokenId,
//                          address medicineContractAddress,
//                          uint tokenId,
//                          address creator,
//                          address seller,
//                          address owner,
//                          uint price,
//                          bool sold,
//                          bool cancelled,
//                          bytes32 barcode);

    constructor() public
    {
        _owner = msg.sender;
    }


    function createMedicine(address medicineContractAddress,
                            uint tokenId,
                            uint price,
                            bytes32 barcode)
    public payable
    returns (uint)
    {
        require(price != 0, "Cost can't be zero");

        _medicineTokenIds.increment();

        address creator = Medicine(medicineContractAddress).getMedicineCreatorById(tokenId);

        Roles roles = Roles(payable(creator), /* creator*/
            payable(msg.sender), /* seller */
            payable(address(0))); /* owner */

        /* Hash map which stores medicine market items  */
        _medicineTokenIdToMedicine[_medicineTokenIds.current()] = Medicine(_medicineTokenIds.current(),
                                                                            medicineContractAddress,
                                                                            tokenId,
                                                                            roles,
                                                                            price,
                                                                            false,
                                                                            false,
                                                                            barcode);

        /* Transfer token from seller to marketplace */
        IERC721(medicineContractAddress).transferFrom(msg.sender, address(this), tokenId);

//        emit MedicineCreated(
//            _medicineTokenIds.current(),
//            medicineContractAddress,
//            tokenId,
//            payable(creator),
//            payable(msg.sender),
//            payable(address(0)),
//            price,
//            false,
//            false,
//            barcode
//        );

        return _medicineTokenIds.current();
    }

    function cancelMedicine(address medicineContractAddress, uint medicineTokenId)
        public payable
    {
        uint itemId = _medicineTokenIdToMedicine[medicineTokenId].tokenId;
        require(itemId >= 1, "Item does not exists");

        require(_medicineTokenIdToMedicine[medicineTokenId].seller == msg.sender, "Ony seller can cancel");

        IERC721(medicineContractAddress).transferFrom(address(this), msg.sender, itemId);

        _medicineTokenIdToMedicine[medicineTokenId].owner = payable(msg.sender);
        _medicineTokenIdToMedicine[medicineTokenId].cancelled = true;

        _cancelledCounter.increment();
    }


    function getLatestMedicineByTokenId(uint tokenId)
        public view
        returns (Medicine memory, string memory)
    {
        for (uint i = _medicineTokenIds.current(); i >= 1; i--) {
            if (item.tokenId == tokenId) {
                Medicine memory medicine = _medicineTokenIdToMedicine[i];
                return (medicine, 'found');
            }
        }

        Medicine memory null;
        return (null, 'not found');
    }

    /* called by the buyer */
    function sellTokenToBuyer(address medicineContractAddress, uint medicineTokenId)
        public
    {
        /* sanity check on the amount received */
        require(msg.value == _medicineTokenIdToMedicine[medicineTokenId].price,
            "Received incorrect amount, please deposit correct price");

        uint itemId = _medicineTokenIdToMedicine[medicineTokenId].tokenId;

        /* transfer amount to seller from buyer  */
        _medicineTokenIdToMedicine[medicineTokenId].seller.transfer(msg.value);
        /* transfer token ownership */
        IERC721(medicineContractAddress).transferFrom(address(this), msg.sender, itemId);

        _medicineTokenIdToMedicine[medicineTokenId].owner = payable(msg.sender);
        _medicineTokenIdToMedicine[medicineTokenId].sold = true;
        _soldCounter.increment();
    }

    function fetchUnsoldMedicines()
        public view
        returns (Medicine[] memory)
    {
        uint unsoldCount = _medicineTokenIds.current() - _soldCounter.current() - _cancelledCounter.current();
        Medicine[] memory medicines = new Medicine[](unsoldCount);

        uint j = 0;
        for (uint i = 1; i <= _medicineTokenIds.current(); i++) {
            Medicine memory item = _medicineTokenIdToMedicine[i ];
            if (item.owner != address(0)) continue;
            medicines[j] = item;
            j += 1;
        }
        return medicines;
    }

    /* compare strings in solidity. Source https://ethereum.stackexchange.com/questions/30912/how-to-compare-strings-in-solidity */
    function compareStrings(string memory a, string memory b)
        public view
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function getAddress(Medicine memory item, string memory property)
        private
        returns (address)
    {
       if (compareStrings(property, "seller")) {
           return iterm.seller;
       }
        return item.owner;
    }

    function fetchSellingMedicines() public view returns (Medicine[] memory) {
        return getMedicines("seller");
    }


    function fetchOwnedMedicines() public view returns (Medicine[] memory) {
        return getMedicines("owner");
    }

    function getMedicines(string memory role)
        public view
        returns (Medicine[] memory)
    {
        uint count = 0;

        for (uint i = 1; i <= _medicineTokenIds.current(); i++) {
            Medicine storage medicine = _medicineTokenIdToMedicine[i];
            address addressPropertyValue = getAddress(medicine, role);
            if (addressPropertyValue == msg.sender) {
                count += 1;
            }
        }

        Medicine[] memory medicines = new Medicine[](count);

        uint j = 0;
        for (uint i = 1; i <= _medicineTokenIds.current(); i++) {
            Medicine storage medicine = _medicineTokenIdToMedicine[i];
            address addressPropertyValue = getAddress(medicine, role);
            if (addressPropertyValue != msg.sender) continue;
            medicines[j] = medicine;
            j += 1;
        }
        return medicines;
    }

    function verifyMedicineBarcode(uint medicineTokenId , string memory barcode) private pure returns (bool) {
    return compareStrings(_medicineTokenIdToMedicine[medicineTokenId].barcode, barcode);
    }
}
