let contacts = [];
const urlBase = 'http://lamp-project.com/LAMPAPI';
// const urlBase = 'http://127.0.0.1:5500/LAMPAPI';

const extension = 'php';


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
        userId: 1 // Assuming `userId` is 1. Replace this as needed.
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

function editContact(index) {
    let contact = contacts[index];
    document.getElementById("addContactFirstName").value = contact.firstName;
    document.getElementById("addContactLastName").value = contact.lastName;
    document.getElementById("addContactPhone").value = contact.phone;
    document.getElementById("addContactEmail").value = contact.email;

    contacts.splice(index, 1); // Remove the contact from the list so we can add the updated one
    renderContacts();
}
