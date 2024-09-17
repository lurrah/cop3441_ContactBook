<?php
    // Allow cross origin requests
    header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
	header("Content-Type: application/json; charset=UTF-8");

    $inData = getRequestInfo();

    // Extract contact details from the request
    $contactId = $inData["id"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"];
    $phone = $inData["phone"];
    $email = $inData["email"];

    // Database connection
    $conn = new mysqli("157.230.189.53", "TheBeast", "WeLoveCOP4331", "COP4331");

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        // Prepare and execute the update query
        $stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ? WHERE ID = ?");
        $stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $contactId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            returnWithInfo("Contact updated successfully");
        } else {
            returnWithError("No contact found with the given ID");
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err) {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($message) {
        $retValue = '{"message":"' . $message . '","error":""}';
        sendResultInfoAsJson($retValue);
    }

?>
