<?php

    // Allow cross origin requests.
   header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
	header("Content-Type: application/json; charset=UTF-8");

    // Get input.
    $inData = getRequestInfo();

    // Store the needed information.
    $userId = $inData['userId'];
    $contactId = $inData["id"];

    $conn = new mysqli("157.230.189.53", "TheBeast", "WeLoveCOP4331", "COP4331");

    // If no connection error, delete the contact from the database with the specified firstname, lastname, userId, phone, and email.
    if($conn->connect_error)
    {
        returnWithError( $conn->connect_error );
    }
    else
    {
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE userID = ? AND Id = ?");
        $stmt->bind_param("ii", $userId, $contactId);
  	    $stmt->execute();
  	    $stmt->close();
  	    $conn->close();
  	    returnWithError("");
    }

    function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

    function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

?>
