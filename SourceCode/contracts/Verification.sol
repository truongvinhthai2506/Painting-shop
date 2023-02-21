pragma solidity ^0.5.0;

contract Verification {
    address[] public verifiers;
    bool public flag = false;

    function getVerifiers() public view returns (address[] memory) {
        return verifiers;
    }

    function verify(uint id, uint capacity) public returns (uint) {
        require(id >= 0);
        
        if (flag == false) {
            verifiers = new address[](capacity);
            flag = true;
        }

        verifiers[id] = msg.sender;
        return id;
    }
}