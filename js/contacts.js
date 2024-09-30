let contacts = [];

let isEditing = false;
let editingIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    // Read the userId from the cookie
    readCookie();

    if (userId < 1) {
        window.location.href = 'index.html'; // Redirect to login page if not logged in
    } else {
        fetchContacts("", false); // Fetch all contacts on page load
    }

    // Event listeners
    document.getElementById('createContactButton').addEventListener('click', toggleContactForm);
    /* document.getElementById('submitContactButton').addEventListener('click', submitContact); */
    document.getElementById('cancelButton').addEventListener('click', cancelEdit);
    document.getElementById('contactPhone').addEventListener('input', formatPhoneNumber);
});

function toggleContactForm() {
    const formContainer = document.getElementById('contactFormContainer');
    formContainer.classList.toggle('hidden');
    resetForm();
}

function resetForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('contactResult').innerHTML = "";
    document.getElementById('formHeader').innerText = "Add Contact";
    document.getElementById('submitContactButton').innerHTML = '<span class="material-icons">save</span> Save';
    isEditing = false;
    editingIndex = -1;
}

function submitContact() {
    console.log("Submitting contact.");
    let firstName = document.getElementById("contactFirstName").value.trim();
    let lastName = document.getElementById("contactLastName").value.trim();
    let email = document.getElementById("contactEmail").value.trim();
    let phone = document.getElementById("contactPhone").value.trim().replace(/\D/g, '');
    console.log(phone);
    /*
    if (!firstName || !lastName || !email || !phone) {
        document.getElementById("contactResult").innerHTML = "Please fill in all fields.";
        return;
    }
    */

    if (isEditing) {
        updateContact(editingIndex, firstName, lastName, email, phone);
    } else {
        addContact(firstName, lastName, email, phone);
    }
}

function addContact(firstName, lastName, email, phone) {
    console.log("Adding contact.")
    // Prepare data for API call
    let newContact = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        userId: userId
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
                // Add the new contact to the contacts array
                newContact.id = response.id; // Assuming the API returns the new contact's id
                contacts.push(newContact);
                // Re-render the contacts
                renderContacts();
                // Reset the form
                resetForm();
                toggleContactForm();
            } else {
                document.getElementById("contactResult").innerHTML = "Error adding contact: " + response.error;
            }
        }
    };

    xhr.send(JSON.stringify(newContact));
}

function fetchContacts(searchTerm, isScroll) {

    let tmp = { search: searchTerm.trim(), userId: userId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let jsonObject = JSON.parse(xhr.responseText);

            if (jsonObject.error && jsonObject.error !== "") {
                document.getElementById("searchContactsResult").innerHTML = "No contacts found.";
                contacts = []; // Clear the contacts array
                renderContacts(); // Clear the table
            } else {
                document.getElementById("searchContactsResult").innerHTML = "";
                contacts = jsonObject.results || [];
                renderContacts(); // Display the contacts
            }
        }
    };

    xhr.send(jsonPayload);
}

function renderContacts() {
    let tbody = document.getElementById("contactTableBody");
    tbody.innerHTML = '';

    contacts.forEach((contact, index) => {
        let row = document.createElement('tr');

        // Name cell (First Name + Last Name)
        let nameCell = document.createElement('td');
        nameCell.innerText = contact.firstName + ' ' + contact.lastName;
        row.appendChild(nameCell);

        // Email cell
        let emailCell = document.createElement('td');
        emailCell.innerText = contact.email;
        row.appendChild(emailCell);

        // Phone cell
        let phoneCell = document.createElement('td');
        let phone = contact.phone;
        phoneCell.innerText = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
        row.appendChild(phoneCell);

        // Actions cell
        let actionsCell = document.createElement('td');

        // Edit button
        let editButton = document.createElement('button');
        editButton.classList.add('action-button');
        editButton.innerHTML = '<span class="material-icons">edit</span>';
        editButton.onclick = function() { openEditForm(index); };
        actionsCell.appendChild(editButton);

        // Delete button
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('action-button', 'delete');
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';
        deleteButton.onclick = function() { deleteContact(index); };
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
}

function openEditForm(index) {
    let contact = contacts[index];
    document.getElementById("contactFirstName").value = contact.firstName;
    document.getElementById("contactLastName").value = contact.lastName;
    document.getElementById("contactEmail").value = contact.email;
    let phone = contact.phone;
    document.getElementById("contactPhone").value = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;

    document.getElementById("contactResult").innerHTML = "";

    // Set the form header and button label
    document.getElementById('formHeader').innerText = "Edit Contact";
    document.getElementById('submitContactButton').innerHTML = '<span class="material-icons">save</span> Update';

    // Show the form if it's hidden
    const formContainer = document.getElementById('contactFormContainer');
    if (formContainer.classList.contains('hidden')) {
        formContainer.classList.remove('hidden');
    }

    isEditing = true;
    editingIndex = index;
}

function updateContact(index, firstName, lastName, email, phone) {
    let contactId = contacts[index].id;

    let updatedContact = {
        id: contactId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        userId: userId
    };

    let url = urlBase + '/EditContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.error === "") {
                // Update the contact in the contacts array
                contacts[index] = updatedContact;
                // Re-render the contacts
                renderContacts();
                // Reset the form
                resetForm();
                toggleContactForm();
            } else {
                document.getElementById("contactResult").innerHTML = "Error updating contact: " + response.error;
            }
        }
    };

    xhr.send(JSON.stringify(updatedContact));
}

function deleteContact(index) {
    let contactId = contacts[index].id;
    console.log(contactId);

    let confirmation = confirm("Are you sure you want to delete this contact?");
    if (!confirmation) {
        return;
    }

    let tmp = { id: contactId, userId: userId };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/DeleteContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.error === "") {
                // Remove the contact from the contacts array
                contacts.splice(index, 1);
                // Re-render the contacts
                renderContacts();
            } else {
                alert("Error deleting contact: " + response.error);
            }
        }
    };

    xhr.send(jsonPayload);
}

function cancelEdit() {
    resetForm();
    toggleContactForm();
}

function formatPhoneNumber() {
    const value = this.value.trim().replace(/\D/g, ''); // Remove non-numeric characters
    let formattedValue = ``;
    if (value.length > 0) {
        formattedValue += `(${value.slice(0, 3)}`;
    }
    if (value.length > 3) {
        formattedValue += `) ${value.slice(3, 6)}`;
    }
    if (value.length > 6) {
        formattedValue += `-${value.slice(6)}`;
    }
    this.value = formattedValue;
}