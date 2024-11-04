// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;

contract MessageManager {
    struct Message {
        string message;
        string originalMessage;
    }

    mapping(bytes8 => Message) public messages;

    event MessageAdded(bytes8 indexed key, string message);
    event MessageUpdated(bytes8 indexed key, string newMessage);
    event MessageRevoked(bytes8 indexed key);

    function createShortKey(string memory input) internal pure returns (bytes8) {
        return bytes8(keccak256(abi.encodePacked(input)));
    }

    function handleTransaction(
        string memory transactionType,
        string memory newMessage,
        string memory originalMessage
    ) public {
        bytes8 newKey = createShortKey(newMessage);
        bytes8 originalKey = createShortKey(originalMessage);

        if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("add"))) {
            require(bytes(newMessage).length > 0, "Message cannot be empty");
            require(bytes(messages[newKey].message).length == 0, "Message already exists");
            messages[newKey] = Message(newMessage, "");
            emit MessageAdded(newKey, newMessage);

        } else if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("update"))) {
            require(bytes(newMessage).length > 0, "New message cannot be empty");
            require(bytes(messages[originalKey].message).length != 0, "Original message not found");
            messages[newKey] = Message(newMessage, originalMessage);
            delete messages[originalKey];
            emit MessageUpdated(newKey, newMessage);

        } else if (keccak256(abi.encodePacked(transactionType)) == keccak256(abi.encodePacked("revoke"))) {
            require(bytes(messages[originalKey].message).length != 0, "Message not found");
            delete messages[originalKey];
            emit MessageRevoked(originalKey);

        } else {
            revert("Unknown transaction type");
        }
    }

    function getMessage(bytes8 key) public view returns (string memory) {
        require(bytes(messages[key].message).length != 0, "Message not found");
        return messages[key].message;
    }
}