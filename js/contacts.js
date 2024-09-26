let contacts = [];
let offset = 0;
let limit = 10;
let moreResults = true;
// const urlBase = 'http://lamp-project.com/LAMPAPI';
// const urlBase = 'http://localhost:8000/LAMPAPI';

// const extension = 'php';

document.addEventListener('DOMContentLoaded', function () {
    readCookie();
    fetchContacts(""); // Load all contacts when the page loads
});

window.addEventListener('scroll', () => {
    if (moreResults === true && window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        fetchContacts(document.getElementById("searchInput").value, true);
    }
})

function addContact() {
    let firstName = document.getElementById("addContactFirstName").value;
    let lastName = document.getElementById("addContactLastName").value;
    let phone = document.getElementById("addContactPhone").value;
    let email = document.getElementById("addContactEmail").value;

    // RegEx validation for phone numbers.
    // Allows for the user to input phone numbers with or without the dashes.
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    const phoneRegex2 = /^\d{3}\d{3}\d{4}$/;

    // RegEx validation for the email. The email does not have to be a working email.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // All error messages are mainly used for debugging.
    // If any field is empty, prompts user to fill all fields.
    if (!firstName || !lastName || !phone || !email) {
        document.getElementById("addContactResult").innerHTML = "Please fill in all fields.";
        return;
    }

    // Prompts the user according to the validation error.
    if ((!phoneRegex.test(phone) && !phoneRegex2.test(phone)) && !emailRegex.test(email)) {
        document.getElementById("addContactResult").innerHTML = "Invalid phone and email.";
        return;
    }
    else if (!phoneRegex.test(phone) && !phoneRegex2.test(phone)) {
        document.getElementById("addContactResult").innerHTML = "Invalid phone.";
        return;
    }
    else if (!emailRegex.test(email)) {
        document.getElementById("addContactResult").innerHTML = "Invalid email.";
        return;
    }

    // Auto adds dashes if the user input 10 digits with no dashes.
    if (phoneRegex2.test(phone)) {
        phone = phone.slice(0, 3) + "-" + phone.slice(3, 6) + "-" + phone.slice(6);
    }

    // Final check to ensure everything is correct and update error message.
    if (firstName && lastName && phone && email && phoneRegex.test(phone) && emailRegex.test(email)) {
        document.getElementById("addContactResult").innerHTML = "Everything is correct";
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
                fetchContacts("", false);
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
                <button onclick="openEditModal(${index})"><span class="material-symbols-outlined">edit</span><span>Edit</span></button>
                <button onclick="deleteContact(${index})"><span class="material-symbols-outlined">delete</span><span>Delete</span></button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function fetchContacts(searchTerm, isScroll) {
    if (!isScroll) {
        contacts = [];
        offset = 0;
    }

    const srch = searchTerm.trim();
    document.getElementById("searchContactsResult").innerHTML = "";

    let tmp = { search: srch, userId: userId, offset: offset, limit: limit};
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
                    offset = 0;
                } else {

                    if (jsonObject.results.length < limit) {
                        moreResults = false;
                    } else {
                        moreResults = true;
                    }
                    document.getElementById("searchContactsResult").innerHTML = "Contact(s) retrieved.";
                    
                    
                    contacts = contacts.concat(jsonObject.results); // Update the contacts array
                    offset+= limit;
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
            userId: userId, 
            firstName: namef_val,
            lastName: namel_val,
            email: email_val,
            phone: phone_val
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
                            contacts.splice(index, 1);
                            offset--;
                            renderContacts();
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
    console.log("id of contact to update: "+ id);    let firstName = document.getElementById("editContactFirstName").value;
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
                    
                    renderContacts();
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

function toggleSidebar() {
	const sidebar = document.getElementById('sidebar');
	const content = document.getElementById('content');
	sidebar.classList.toggle('active');
	content.classList.toggle('active');
}