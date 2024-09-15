let contacts = [];
// const urlBase = 'http://lamp-project.com/LAMPAPI';
const urlBase = 'http://localhost:8000/LAMPAPI'; // For testing purposes

// const extension = 'php';

document.addEventListener('DOMContentLoaded', function() {
    readCookie();
    loadContacts();
});

function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    document.cookie =
        "firstName=" + userFirstName +
        ";lastName=" + userLastName +
        ";userId=" + userId +
        ";expires=" + date.toGMTString() + ";path=/";
}

function readCookie() {
    userId = -1;
    const data = document.cookie;
    const pairs = data.split(";");

    pairs.forEach(pair => {
        const [key, value] = pair.trim().split("=");
        if (key === "firstName") {
            userFirstName = value;
        } else if (key === "lastName") {
            userLastName = value;
        } else if (key === "userId") {
            userId = parseInt(value.trim());
        }
    });

    if (userId < 0) {
        window.location.href = "index.html";
    } else {
        // Optionally display the user's name
        // document.getElementById("userName").innerHTML = "Logged in as " + userFirstName + " " + userLastName;
    }
}

readCookie();

function addContact() {
    let firstName = document.getElementById("addContactFirstName").value;
    let lastName = document.getElementById("addContactLastName").value;
    let phone = document.getElementById("addContactPhone").value;
    let email = document.getElementById("addContactEmail").value;

    if (!firstName || !lastName || !phone || !email) {
        document.getElementById("addContactResult").innerHTML = "Please fill in all fields.";
        return;
    }

    // Prepare data for API call
    let newContact = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        userId: userId,
    };

    let url = urlBase + '/AddContact.' + extension;

    // Send contact to the server
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);  // Replace with your actual server path
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.error === "") {
                // If success, add the new contact to the local array and render
                contacts.push(newContact);
                renderContacts();
                document.getElementById("addContactForm").reset();
                document.getElementById("addContactResult").innerHTML = "Contact added successfully.";
            } else {
                document.getElementById("addContactResult").innerHTML = "Error adding contact: " + response.error;
            }
        }
    };
    
    xhr.send(JSON.stringify(newContact));
}

function renderContacts() {
    let tbody = document.getElementById("contactTableBody");
    tbody.innerHTML = '';

    contacts.forEach((contact, index) => {
        let row = `<tr>
            <td>${contact.firstName}</td>
            <td>${contact.lastName}</td>
            <td>${contact.phone}</td>
            <td>${contact.email}</td>
            <td>
                <button onclick="editContact(${index})">Edit</button>
                <button onclick="deleteContact(${index})">Delete</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function searchContacts() {
    const srch = document.getElementById("searchInput").value;
	document.getElementById("searchContactsResult").innerHTML = "";

	const table = document.getElementById("contactTableBody"); 
    table.innerHTML = '';

	// reset contact table
	// while (table.rows.length > 1) {
	// 	table.deleteRow(1);
	// }
	
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
				let jsonObject = JSON.parse( xhr.responseText );
				console.log(jsonObject);
                if (jsonObject.error !== "") 
                {
                    document.getElementById("searchContactsResult").innerHTML = "No contacts found.";
                } else 
                {
				document.getElementById("searchContactsResult").innerHTML = "Contact(s) retrieved.";
                }

                console.log(jsonObject);
				for (let i=0; i<jsonObject.results.length; i++)
				{
                    let row = `<tr id='row ${i}'>
                                    <td id='firstName ${i}'><span>${jsonObject.results[i].FirstName}</span></td>
                                    <td id='lastName ${i}'><span>${jsonObject.results[i].LastName}</span></td>
                                    <td id='email ${i}'><span>${jsonObject.results[i].Email}</span></td>
                                    <td id='phone ${i}'><span>${jsonObject.results[i].Phone}</span></td>
                                    <td>
                                        <button onclick="editContact(${i})">Edit</button>
                                        <button onclick="deleteContact(${i})">Delete</button>
                                    </td>
                                </tr>`
                    table.innerHTML += row;
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("searchContactsResult").innerHTML = err.message;	
    }
	
}

function loadContacts() {
    let tmp = { search: "", userId: userId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = fun