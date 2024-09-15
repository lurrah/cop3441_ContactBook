let contacts = [];

const urlBase = 'http://lamp-project.com/LAMPAPI';
// const urlBase = 'http://localhost:8000/LAMPAPI';

const extension = 'php';

// readCookie();

function addContact() {
    let firstName = document.getElementById("addContactFirstName").value;
    let lastName = document.getElementById("addContactLastName").value;
    let phone = document.getElementById("addContactPhone").value;
    let email = document.getElementById("addContactEmail").value;

    if (!firstName || !lastName || !phone || !email) {
        document.getElementById("addContactResult").innerHTML = "Please fill in all fields.";
        return;
    }

    let newContact = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        userId: 1 // Assuming `userId` is 1. Replace this as needed.
    };

    let url = urlBase + '/AddContact.' + extension;

    // Send contact to the server
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);  // Replace with your actual server path
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    
    try {
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
    } catch (err) {
        document.getElementById("addContactResult").innerHTML = "Error adding contact:" + err.message;
    }
    
    
    
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

function searchContacts() {
    let searchTerm = document.getElementById("searchInput").value.toLowerCase();
    let tbody = document.getElementById("contactTableBody");
    tbody.innerHTML = '';

    let filteredContacts = contacts.filter(contact => 
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm)
    );

    filteredContacts.forEach((contact, index) => {
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

    document.getElementById("searchContactsResult").innerHTML = filteredContacts.length
        ? `Found ${filteredContacts.length} contact(s).`
        : "No contacts found.";
}

function deleteContact(index) {

    contacts.splice(index, 1);
    renderContacts();
}

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

function saveContact(index) {
    let id = contacts[index].id;
    let firstName = document.getElementById("editContactFirstName").value;
    let lastName = document.getElementById("editContactLastName").value;
    let phone = document.getElementById("editContactPhone").value;
    let email = document.getElementById("editContactEmail").value;

    if (!firstName || !lastName || !phone || !email) {
        document.getElementById("editContactResult").innerHTML = "Please fill in all fields.";
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
                    contacts[index] = updatedContact;
                    renderContacts();
                    document.getElementById("editContactResult").innerHTML = "Contact updated successfully.";
                    document.getElementById("editContactModal").style.display = "none";
                    document.getElementById("editContactForm").reset();
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

window.onload = function () {
    renderContacts();
};
