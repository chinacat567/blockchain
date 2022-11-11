
/* 11/10/22 : Sumantra Sharma reference https://docs.openzeppelin.com/contracts/3.x/erc721#constructing_an_erc721_token_contract
*/
pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract MedicineToken is ERC721   {
    using Counters for Counters.Counter;

    event MintMedicine(uint tokenId);

    Counters.Counter private _tokenIds;
    
    address private _marketAddress;

    /* hash table for looking up creator addresses */
    mapping(uint => address) public _creators;


    constructor(address marketAddress) public ERC721("Medicine", "Sumantra") {
        _marketAddress = marketAddress;
    }

    function createMedicine(string memory tokenURI)
        public
        returns (uint)
    {
        _tokenIds.increment();

        uint newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _creators[newItemId] = msg.sender;

        /* approve marketplace to transfer medicine*/
        setApprovalForAll(_marketAddress, true);

        /* catch event in javascript */
        emit MintMedicine(newItemId);
        return newItemId;
    }

    function getMedicinesOwnedByAddress()
        public view
        returns (uint[] memory)
    {
        uint[] memory result = new uint[](balanceOf(msg.sender));
        uint j = 0;

        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (ownerOf(i) != msg.sender) continue;
            result[j] = i;
            j += 1;
        }

        return result;
    }

    function getMedicineCreatorById(uint tokenId)
        public view
        returns (address)
    {
        return _creators[tokenId];
    }

    function getMedicinesCreatedByMe()
        public view
        returns (uint[] memory)
    {
        uint count = 0;

        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (_creators[i] == msg.sender) {
                count += 1;
            }
        }

        uint[] memory result = new uint[](count);
        uint j = 0;

        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (_creators[i] == msg.sender) {
                result[j] = i;
                j += 1;
            }
        }
        return result;
    }
}
