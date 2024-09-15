// const urlBase = 'http://lamp-project.com/LAMPAPI';
const urlBase = 'http://localhost:8000/LAMPAPI'; // For testing purposes


const extension = 'php';

let userId = 0;
let userFirstName = "";
let userLastName = "";

function doSignIn()
{

	userId = 0;
	userFirstName = "";
	userLastName = "";
	
	let signInUsername = document.getElementById("signInUsername").value;
	let signInPassword = document.getElementById("signInPassword").value;
	
	document.getElementById("signInResult").innerHTML = "";

	let tmp = {login:signInUsername,password:signInPassword};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			
			if (this.readyState != 4) { // No response yet
				return;
			}
			
			if (this.status == 404) { // Status set to "No records found"
				document.getElementById("signInResult").innerHTML = "Username or password is incorrect.";
				return;
			}

			if (this.status == 200) // Status set to success
			{
				console.log("TEXT", xhr.responseText);
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;

				userFirstName = jsonObject.firstName;
				userLastName = jsonObject.LastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
			
			// Previous working version
			if (this.readyState == 4 && this.status == 200) // Have response w/ status set to success.
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("signInResult").innerHTML = "Username or password is incorrect.";
					return;
				}
				
				userFirstName = jsonObject.firstName;
				userLastName = jsonObject.LastName;

				saveCookie();
	
				window.location.href = "contacts.html";
			}
			
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("signInResult").innerHTML = err.message;
	}

}

function doSignUp()
{
	userId = 0;
	userFirstName = "";
	userLastName = "";
	
	let signUpFirstName = document.getElementById("signUpFirstName").value;
	let signUpLastName = document.getElementById("signUpLastName").value;
	let signUpUsername = document.getElementById("signUpUsername").value;
	let signUpPassword = document.getElementById("signUpPassword").value;
	
	document.getElementById("signUpResult").innerHTML = "";

	let tmp = {firstName:signUpFirstName, lastName:signUpLastName, login:signUpUsername, password:signUpPassword};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/SignUp.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) {
				// Status set to success
				console.log(xhr.responseText);
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;

				if (jsonObject.error != "") {
					document.getElementById("signUpResult").innerHTML = jsonObject.error;
					return;
				}

				saveCookie();
	
				window.location.href = "contacts.html";
			}
			
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("signUpResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	console.log(userFirstName + " : " + userLastName + " : " + userId);
	document.cookie = "firstName=" + userFirstName + ",lastName=" + userLastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			userFirstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			userLastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
//		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doSignOut()
{
	userId = 0;
	userFirstName = "";
	userLastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function addContact()
{
	let addContactFirstName = document.getElementById("addContactFirstName").value;
	let addContactLastName = document.getElementById("addContactLastName").value;
	//let userId = document.getElementById("userId").value;
	let addContactPhone = document.getElementById("addContactPhone").value;
	let addContactEmail = document.getElementById("addContactEmail").value;
	document.getElementById("addContactResult").innerHTML = "";

	let tmp = 
	{ 
		userId: userId,
		firstName: addContactFirstName, 
		lastName: addContactLastName, 
		phone: addContactPhone, 
		email: addContactEmail
	};

	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState != 4) {
				return;
			}
			if (this.status == 404) {
				document.getElementById("addContactResult").innerHTML = "URL not found.";
				return;
			}
			if (this.status == 200) {
				document.getElementById("addContactResult").innerHTML = "Contact added.";
				return;
			}
			
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("addContactResult").innerHTML = err.message;
	}
	
}

function searchContacts()
{
	const srch = document.getElementById("searchInput").value;
	document.getElementById("searchContactsResult").innerHTML = "";

	const table = document.getElementById("contacts"); // table in contacts.html needs to have id="contacts"
	const row = table.getElementsByTagName("tr");  

	// reset contact table
	while (table.rows.length > 1) {
		table.deleteRow(1);
	}
	
	let tmp = {search:srch,userId:userId};

	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("searchContactsResult").innerHTML = "Contact(s) retrieved.";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for (let i=0; i<jsonObject.results.length; i++)
				{
					tableHTML += "<tr id='row" + i + "'>";
					tableHTML += "<td id= 'firstName" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
					tableHTML += "<td id = 'lastName" + i +"'><span>" + jsonObject.results[i].LastName + "</span></td>";
					tableHTML += "<td id = 'email" + i + "'><span>" + jsonObject.results[i].Email + "</span></td>";
					tableHTML += "<td id = 'phone" + i + "'><span>" + jsonObject.results[i].Phone + "</span></td>";
					tableHTML += "<td>" 
				}
				//tableHTML += "</table>";
				document.getElementById("tbody").innerHTML = tableHTML;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("searchContactsResult").innerHTML = err.message;	}
	
}

function deleteContact() {
	let tmp = {"userId": userId, "firstName": "John","lastName": "Doe"}
}

function loadContacts() {
	let tmp = {search: "", userId: userId};
}
