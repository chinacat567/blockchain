 /* 11/1/22 : Sumantra Sharma 
 Reference https://docs.openzeppelin.com/contracts/3.x/erc721
 */
pragma solidity ^0.6.2;

 import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Medicine is ERC721 {
    
    address public _marketAddress;

    mapping(uint => address) public _creators;
    
    using Counters for Counters.Counter;
    Counters.Counter private _medicineIds;
    
    event MedicineCreated(uint indexed medicineId);

    constructor(address marketAddress) ERC721("MedicineToken", "Sumantra") 
        public 
    {
        _marketAddress = marketAddress;
    }

    function createNewMedicine(string memory medicineURI)
        public
        returns (uint)
    {
        _medicineIds.increment();
        uint medicineId = _medicineIds.current();

        _creators[medicineId] = msg.sender;
        _mint(msg.sender, medicineId);
        _setTokenURI(medicineId, medicineURI);

        setApprovalForAll(_marketAddress, true);

        emit MedicineCreated(medicineId);

        return medicineId;
    }

    function getMedicinesOwnedByMe()
        public view
        returns (uint[] memory)
    {
        uint[] memory result = new uint[](balanceOf(msg.sender));
        uint j = 0;

        for (uint i = 1; i <= _medicineIds.current(); i++) {
            if (ownerOf(i) == msg.sender) {
                result[j] = i;
                j += 1;
            }
        }
        return result;
    }

    function getMedicineCreator(uint medicineId)
        public view
        returns (address)
    {
        return _creators[medicineId];
    }

    function getMedicinesCreatedBySender()
        public view
        returns (uint[] memory)
    {
        uint count = 0;

        for (uint i = 1; i <= _medicineIds.current(); i++) {
            if (_creators[i] == msg.sender) {
                count += 1;
            }
        }

        uint[] memory result = new uint[](count);
        uint j = 0;
        for (uint i = 1; i <= _medicineIds.current(); i++) {
            if (_creators[i] == msg.sender) {
                result[j] = i;
                j += 1;
            }
        }
        return result;
    }
}
