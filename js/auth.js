const urlBase = 'http://lamp-project.com/LAMPAPI';
//const urlBase = 'http://localhost:8000/LAMPAPI';

const extension = 'php';

let userId = 0;
let userFirstName = "";
let userLastName = "";

function doSignIn() {
    userId = 0;
    userFirstName = "";
    userLastName = "";

    let signInUsername = document.getElementById("signInUsername").value;
    let signInPassword = document.getElementById("signInPassword").value;

	if (signInUsername === '' || signInPassword === '') {
		document.getElementById('signInResult').innerHTML = "Please fill out all fields"
		document.getElementById('signInResult').removeAttribute('hidden');
		return;
	}


    document.getElementById("signInResult").innerHTML = "";

    let tmp = { login: signInUsername, password: signInPassword };
    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let jsonObject = JSON.parse(xhr.responseText);
                    if (jsonObject.error !== '') {
                        document.getElementById("signInResult").innerHTML = "Username or password is incorrect.";
						document.getElementById("signInResult").removeAttribute('hidden');
                        return;
                    }

                    userId = jsonObject.id;
                    userFirstName = jsonObject.firstName;
                    userLastName = jsonObject.lastName;

                    saveCookie();
                    window.location.href = "contacts.html";
                } else {
                    document.getElementById("signInResult").innerHTML = "Username or password is incorrect.";
                }
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
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

	// check if user forgot to input anything
	if (signUpFirstName === '' || signUpLastName === '' || signUpUsername === '' || signUpPassword === '') {
		document.getElementById('signUpResult').innerHTML = "Please fill out all fields"
		document.getElementById('signUpResult').removeAttribute('hidden');
		return;
	}
	
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
			if (this.readyState == 4) {
				if (this.status == 200) {
				// Status set to success
				let jsonObject = JSON.parse( xhr.responseText );

				if (jsonObject.error !== '') {
					document.getElementById("signUpResult").innerHTML = "Username taken";
					document.getElementById("signUpResult").removeAttribute('hidden');

					return;
				}

				userId = jsonObject.id;
				userFirstName = jsonObject.firstName;
				userLastName = jsonObject.lastName;

				saveCookie();

				window.location.href = "contacts.html";
			} 
				else 
				{
					document.getElementById("signUpResult").innerHTML = "Username taken";
					document.getElementById("signUpResult").removeAttribute('hidden');
				}
		}
	};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("signUpResult").innerHTML = err.message;
	}

}

function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    const expires = ";expires=" + date.toUTCString() + ";path=/";

    document.cookie = "firstName=" + encodeURIComponent(userFirstName) + expires;
    document.cookie = "lastName=" + encodeURIComponent(userLastName) + expires;
    document.cookie = "userId=" + encodeURIComponent(userId) + expires;
}

function readCookie() {
    userId = -1;
    userFirstName = "";
    userLastName = "";

    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        let [key, value] = cookie.split("=");

        key = decodeURIComponent(key);
        value = decodeURIComponent(value);

        if (key === "firstName") {
            userFirstName = value;
        } else if (key === "lastName") {
            userLastName = value;
        } else if (key === "userId") {
            userId = parseInt(value);
        }
    }

    if (userId < 0 || isNaN(userId)) {
        //window.location.href = "index.html";
    } else {
        // Optionally display the user's name
        // document.getElementById("userName").innerHTML = "Logged in as " + userFirstName + " " + userLastName;
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