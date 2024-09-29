<?php
	// Allow cross origin requests
    header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
	header("Content-Type: application/json; charset=UTF-8");

	$inData = getRequestInfo();
	
	// replace with correct form information (assuming from html)
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];
	$userId = $inData["userId"];

	$phoneRegex = '/^\d{3}-\d{3}-\d{4}$/';

	$conn = new mysqli("157.230.189.53", "Team25", "smallProj1", "COP4331"); 	

	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	}
	else if (!preg_match($phoneRegex, $phone) && !filter_var($email, FILTER_VALIDATE_EMAIL)) // Return error if invalid phone and email.
	{
		returnWithError("Invalid phone and email.");
	}
	else if (!preg_match($phoneRegex, $phone)) // Return error if email is valid but phone is invalid.
	{
		returnWithError("Invalid phone.");
	}
	else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) // Return error if phone is valid but email is invalid.
	{
		returnWithError("Invalid email.");
	}
	else
	{
		$stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserID) VALUES(?,?,?,?,?)");
		$stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
		
		if ($stmt->execute()) 
		{
			$contactId = $conn->insert_id;
			returnWithInfo($contactId);
		} else {
			returnWithError("Failed to add contact.");
		}

		$stmt->close();
		$conn->close();
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

	function returnWithInfo( $contactId )
	{
		$retValue = '{"id":"' . $contactId . '", "error":""}';

		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
