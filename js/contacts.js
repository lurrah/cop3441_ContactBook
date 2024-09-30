let contacts = [];
let offset = 0;
let limit = 25;
let moreResults = true;
let isFetching = false;


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

window.addEventListener('scroll', function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && moreResults && !isFetching) {
        fetchContacts(document.getElementById("searchInput").value.toLowerCase(), true); // Re-fetch contacts with the same search term
        }
    })

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
                searchTerm = document.getElementById("searchInput").value.toLowerCase();
                if ((firstName.toLowerCase().includes(searchTerm) || lastName.toLowerCase().includes(searchTerm) ||
                    phone.toLowerCase().includes(searchTerm) || email.toLowerCase().includes(searchTerm)))
                {
                    // add new contact to list if includes search
                    newContact["id"] = response.id;
                    contacts.push(newContact);
                    renderContacts();
                    offset += 1;
                } else 
                {
                    fetchContacts(searchTerm, false);
                }

                toggleContactForm();
                document.getElementById("contactValidResult").innerHTML = "Contact added successfully.";
                document.getElementById("contactErrorResult").innerHTML = "";
            

            } else {
                document.getElementById("contactErrorResult").innerHTML = "Error adding contact: " + response.error;
                document.getElementById("contactValidResult").innerHTML = "";
            }
        }
    };

    xhr.send(JSON.stringify(newContact));
}

function fetchContacts(searchTerm, isScroll) {
    if (isFetching) {
        return;
    }

    isFetching = true;

    if (!isScroll) {
        contacts = [];
        offset = 0;
    }

    let searchParam = searchTerm.trim();

    // If searchTerm is empty, adjust searchParam to fetch all contacts
    if (searchParam === "") {
        searchParam = "%"; // Assuming your backend treats '%' as a wildcard to return all contacts
    }

    let tmp = { search: searchParam, userId: userId, limit: limit, offset: offset };
    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let jsonObject = JSON.parse(xhr.responseText);

            // Log the response for debugging
            console.log("Response:", jsonObject);

            if (jsonObject.error && jsonObject.error !== "" && !isScroll) {
                document.getElementById("searchContactsResult").innerHTML = "No contacts found.";
                contacts = []; // Clear the contacts array
                renderContacts(); // Clear the table
            } else {
                if (!jsonObject.results || jsonObject.results.length < limit) {
                    moreResults = false;
                } else {
                    moreResults = true;
                }

                if (jsonObject.results && jsonObject.results.length > 0) {
                    if (isScroll) {
                        // Append new results to the existing contacts array
                        contacts = contacts.concat(jsonObject.results);
                    } else {
                        // Replace contacts array with new results
                        contacts = jsonObject.results;
                    }
                    document.getElementById("searchContactsResult").innerHTML = "";
                } else {
                    // No results found
                    contacts = []; // Clear contacts array
                    document.getElementById("searchContactsResult").innerHTML = "No contacts found.";
                }

                offset += limit;
                renderContacts(); // Display the contacts
            }
        }
        isFetching = false;
    };

    xhr.send(jsonPayload);
}

function renderContacts() {
    let tbody = document.getElementById("contactTableBody");

    // Always clear the table body
    tbody.innerHTML = '';

    if (contacts.length === 0) {
        document.getElementById("searchContactsResult").innerHTML = 'No contacts found.';
        return; // Exit early since there are no contacts to render
    } else {
        document.getElementById("searchContactsResult").innerHTML = '';
    }

    // Render all contacts
    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];
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
        editButton.onclick = function () { openEditForm(i); };
        actionsCell.appendChild(editButton);

        // Delete button
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('action-button', 'delete');
        deleteButton.innerHTML = '<span class="material-icons">delete</span>';
        deleteButton.onclick = function () { deleteContact(i); };
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        tbody.appendChild(row);
    }
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