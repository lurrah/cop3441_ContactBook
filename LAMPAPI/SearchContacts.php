<?php
    // Allow cross origin requests
    header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
	header("Content-Type: application/json; charset=UTF-8");
	
	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "Team25", "smallProj1", "COP4331"); 	
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("SELECT * FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID=?");
		$contactName = "%" . $inData["search"] . "%";
		$stmt->bind_param("ssi", $contactName, $contactName, $inData["userId"]);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '{"ID":' . $row["ID"] .',"FirstName":"' . $row["FirstName"] .'","LastName":"' . $row["LastName"] .'","Email":"' . $row["Email"] .'","Phone":"' . $row["Phone"] . '"}';
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
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
	
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';

		// $retValue = '{"id": $searchResults[0],


		sendResultInfoAsJson( $retValue );
	}
	
?>