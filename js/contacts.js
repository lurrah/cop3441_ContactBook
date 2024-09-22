let contacts = [];
// const urlBase = 'http://lamp-project.com/LAMPAPI';

// const extension = 'php';

document.addEventListener('DOMContentLoaded', function () {
    readCookie();
    fetchContacts(""); // Load all contacts when the page loads
});

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
    xhr.open("POST", url, true); // Replace with your actual server path
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.error === "") {
                // Reload contacts after adding a new one
                fetchContacts("");
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
                <button onclick="openEditModal(${index})">Edit</button>
                <button onclick="deleteContact(${index})">Delete</button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function fetchContacts(searchTerm) {
    const srch = searchTerm.trim();
    document.getElementById("searchContactsResult").innerHTML = "";

    let tmp = { search: srch, userId: userId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error && jsonObject.error !== "") {
                    document.getElementById("searchContactsResult").innerHTML = "No contacts found.";
                    contacts = []; // Clear the contacts array
                } else {
                    document.getElementById("searchContactsResult").innerHTML = "Contact(s) retrieved.";
                    contacts = jsonObject.results; // Update the contacts array
                }

                renderContacts(); // Use the renderContacts function to display contacts
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("searchContactsResult").innerHTML = err.message;
    }
}

function deleteContact(index) {
    //get contact's info
    let contact = contacts[index];
    let table = document.getElementsById("contactTableBody");
    let namef_val = contact.firstName;
    let namel_val = contact.lastName;
    let email_val = contact.email;
    let phone_val = contact.phone;
    let contactId = contact.id;

    //display confirmation dialog for user
    let check = confirm('Confirm deletion of contact: ' + namef_val + ' ' + namel_val);

    if (check === true) {
        //data for API
        let tmp = {
            id: contactId,
            userId: userId
        };

        let jsonPayload = JSON.stringify(tmp);
        let url = urlBase + '/DeleteContact.' + extension;

        //send request to the server
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

        try {
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        let response = JSON.parse(xhr.responseText);
                        if (response.error === "") {
                            console.log("Contact has been deleted successfully.");
                            table.deleteRow(index)
                        } else {
                            console.error("Error deleting contact: " + response.error);
                        }
                    } else {
                        console.error("Request failed with status: " + xhr.status);
                    }  
                }
            };
            xhr.send(jsonPayload);
        } catch (e) {
            console.error("Error parsing response or handling request: " + e.message);
        }
    }
}

/*
// non-functioning deleteContact function
function deleteContact(index) {
    let tmp = { userId: userId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                if (response.error === "") {
                    // Remove contact from local array and re-render
                    contacts.splice(index, 1);
                    renderContacts();
                } else {
                    alert("Error deleting contact: " + response.error);
                }
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        alert(err.message);
    }
}
*/

function openEditModal(index) {
    let contact = contacts[index];
    document.getElementById("editContactFirstName").value = contact.firstName;
    document.getElementById("editContactLastName").value = contact.lastName;
    document.getElementById("editContactPhone").value = contact.phone;
    document.getElementById("editContactEmail").value = contact.email;

    document.getElementById("editContactResult").innerHTML = "";

    const saveButton = document.getElementById("saveContactButton");
    saveButton.onclick = function() {
        saveContact(index);
    };

    document.getElementById("editContactModal").style.display = "block";
}

function closeEditModal() {
    document.getElementById("editContactModal").style.display = "none";
    document.getElementById("editContactForm").reset();
    document.getElementById("editContactResult").innerHTML = "";
}

function saveContact(index) {
    let id = contacts[index].id;
    console.log("id of contact to update: "+ id);
    let table = document.getElementsById("contactTableBody");
    let firstName = document.getElementById("editContactFirstName").value;
    let lastName = document.getElementById("editContactLastName").value;
    let phone = document.getElementById("editContactPhone").value;
    let email = document.getElementById("editContactEmail").value;

    if (!firstName || !lastName || !phone || !email) {
        document.getElementById("editContactResult").innerHTML = "Please fill in all fields.";
        return;
    }

    if (firstName === contacts[index].firstName && 
        lastName === contacts[index].lastName && 
        phone === contacts[index].phone && 
        email === contacts[index].email) { // No changes
        document.getElementById("editContactResult").innerHTML = "No changes to save.";
        return;
    }

    let updatedContact = {
        id,
        firstName,
        lastName,
        phone,
        email,
    };

    let url = urlBase + '/EditContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    try {
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                if (response.error === "") {
                    // change contact info to updated
                    contacts[index].firstName = firstName;
                    contacts[index].lastName = lastName;
                    contacts[index].phone = phone;
                    contacts[index].email = email;

                    document.getElementById("editContactResult").innerHTML = "Contact updated successfully.";
                    closeEditModal();
                } else {
                    document.getElementById("editContactResult").innerHTML = "Error updating contact: " + response.error;
                }
            }
        };
        xhr.send(JSON.stringify(updatedContact));
    } catch (err) {
        document.getElementById("editContactResult").innerHTML = err.message;
    }
}
