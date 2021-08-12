import { validateSignUp } from '/js/validateRegistration.js'
var LOC = window.location;
let BASEURL = LOC.protocol + "//" + LOC.hostname + (LOC.port? ":"+LOC.port : "")

function displayRegisterForm() {
    document.querySelector('.register_modal_container').style.display = 'flex';
}

function closeRegisterForm() {
    document.querySelector('.register_modal_container').style.display = 'none';
    clearSignUpForm();
}

function closeRegisterModalContent() {
    document.querySelector('.register_modal_content').style.display = 'none';
}

function clearSignUpForm(){
    let first_name = document.getElementById('first_name');
    let last_name = document.getElementById('last_name');
    let email = document.getElementById('email');
    let username = document.getElementById('user');
    let password = document.getElementById('pass');
    let confirm_password = document.getElementById('confirm_password');

    // clear field values after closing
    first_name.value = "";
    last_name.value = "";
    email.value = "";
    username.value = "";
    password.value = "";
    confirm_password.value = "";

    // clear error messages
    let input_list = [];
    input_list.push(first_name);
    input_list.push(last_name);
    input_list.push(email);
    input_list.push(username);
    input_list.push(password);
    input_list.push(confirm_password);
    for (let i=0; i<input_list.length; i++) {
        if (input_list[i].nextElementSibling.childElementCount != 0){
            input_list[i].nextElementSibling.children[0].remove();
        }
    }
}

function signUpAttempt() {
    return new Promise (function (resolve, reject) {
        let first_name = document.getElementById('first_name');
        let last_name = document.getElementById('last_name');
        let email = document.getElementById('email');
        let username = document.getElementById('user');
        let password = document.getElementById('pass');
        let confirm_password = document.getElementById('confirm_password');
        let signUpForm = new SignUpForm(first_name, last_name, email, username, password, confirm_password);
        // clear all error messages
        for (let nodeElement of Object.values(signUpForm)) {
            if (nodeElement.nextElementSibling.childElementCount != 0) {
                nodeElement.nextElementSibling.children[0].remove();
            };
        }
        let formValidated = validateSignUp(signUpForm)
        formValidated.then(function(formValidated) {
            if (formValidated === true){
                //create account goes here?
                let req = new XMLHttpRequest();
                let payload = {first_name: signUpForm.getFirstName().value,last_name: signUpForm.getLastName().value, email: signUpForm.getEmail().value, username: signUpForm.getUsername().value, password: signUpForm.getPassword().value}
                req.open("POST", BASEURL + "/register", true);
                req.setRequestHeader("Content-Type", "application/json");
                req.addEventListener("load", function(){
                    if (req.status >= 200 && req.status < 400) {
                        let response = JSON.parse(req.responseText);
                        if (response.success === true) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    } else {
                        console.log(req.status);
                    }
                });
                req.send(JSON.stringify(payload));
            }
        }).catch(error => {
            console.log(error)
        });
    });
}

function SignUpForm(first_name, last_name, email, username, password, confirm_password) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.username = username;
    this.password = password;
    this.confirm_password = confirm_password;
}

SignUpForm.prototype.getFirstName = function() {
    return this.first_name;
}

SignUpForm.prototype.getLastName = function() {
    return this.last_name;
}

SignUpForm.prototype.getEmail = function() {
    return this.email;
}

SignUpForm.prototype.getUsername = function() {
    return this.username;
}

SignUpForm.prototype.getPassword = function() {
    return this.password;
}

SignUpForm.prototype.getConfirmPassword = function() {
    return this.confirm_password;
}

function displaySuccessMsg(){
    closeRegisterModalContent()
    document.querySelector('.success_modal_content').style.display = 'inline-block';
}

function closeSuccessMsg(){
    document.querySelector('.register_modal_container').style.display = 'none';
    document.querySelector('.success_modal_content').style.display = 'none';
    clearSignUpForm();
    document.querySelector('.register_modal_content').style.display = '';
}


document.getElementById('register_button').addEventListener('click', function(event){
    displayRegisterForm();
    event.preventDefault();
    event.stopPropagation();
});

document.getElementById('register_close').addEventListener('click', function(event){
    closeRegisterForm();
    event.preventDefault();
    event.stopPropagation();
});

document.getElementById('create_account_button').addEventListener('click', function(event){
    let success = signUpAttempt();
    success.then(function(success){
        if (success === true){
            displaySuccessMsg();
        }
    }).catch(error =>{
        console.log(error);
    });
    event.preventDefault();
    event.stopPropagation();
});

document.getElementById('success_msg_close').addEventListener('click', function(event){
    closeSuccessMsg();
    event.preventDefault();
    event.stopPropagation();
});
