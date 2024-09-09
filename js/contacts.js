let contacts = [];

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
        firstName,
        lastName,
        phone,
        email,
    };

    contacts.push(newContact);
    renderContacts();
    document.getElementById("addContactForm").reset();
    document.getElementById("addContactResult").innerHTML = "Contact added successfully.";
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