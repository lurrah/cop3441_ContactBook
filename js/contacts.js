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
                //document.getElementById("addContactForm").reset();
                toggleContactForm();
                document.getElementById("addContactResult").innerHTML = "Contact added successfully.";
<<<<<<< HEAD

            } else {
                document.getElementById("contactResult").innerHTML = "Error adding contact: " + response.error;
=======
                showToast('Contact added successfully!', 'success'); // Show success toast
            } else {
                document.getElementById("addContactResult").innerHTML = "Error adding contact: " + response.error;
                showToast(data.error, 'Could not add contact'); // Show error toast
>>>>>>> toast
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
<<<<<<< HEAD
=======
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
                            renderContacts();
                            showToast('Contact deleted successfully!', 'success'); // Show success toast
                        } else {
                            console.error("Error deleting contact: " + response.error);
                            showToast(data.error, 'Could not delete contact'); // Show error toast
                        }
                    } else {
                        console.error("Request failed with status: " + xhr.status);
                    }  
                }
            };
            xhr.send(jsonPayload);
        } catch (e) {
            console.error("Error parsing response or handling request: " + e.message);
>>>>>>> toast
        }
    };

    xhr.send(jsonPayload);
}

function renderContacts() {
    let tbody = document.getElementById("contactTableBody");
    tbody.innerHTML = '';

    if (contacts.length === 0) {
        document.getElementById("searchContactsResult").innerHTML = 'No contacts found.'
    } else {
        document.getElementById("searchContactsResult").innerHTML = '';
    }


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

<<<<<<< HEAD
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
=======
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
                    showToast('Contact updated successfully!', 'success'); // Show success toast
                } else {
                    document.getElementById("editContactResult").innerHTML = "Error updating contact: " + response.error;
                    showToast(data.error, 'Could not update contact'); // Show error toast
                }
>>>>>>> toast
            }
        }
    };

    xhr.send(JSON.stringify(updatedContact));
}

<<<<<<< HEAD
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
=======
function toggleSidebar() {
	const sidebar = document.getElementById('sidebar');
	const content = document.getElementById('content');
	sidebar.classList.toggle('active');
	content.classList.toggle('active');
}

function showToast(message, type) {
    const toastContainer = document.getElementById("toastContainer");
    
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
  
    if (type === "success") {
      toast.classList.add("success");
    } else if (type === "error") {
      toast.classList.add("error");
    }
    
    toastContainer.appendChild(toast);
  
    // Automatically remove the toast after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
>>>>>>> toast
