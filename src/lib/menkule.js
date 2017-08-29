import io from 'socket.io-client';
import EventEmitter from 'event-emitter';
import config from './configs/config';

// Private properties
let socket = null;
let token = window.localStorage.getItem("menkule_token") || null;
let loggedUser = null;
let apiAddress = config().apiAdress;
let socketAddress = config().socketAddress;
let cloudinaryBaseUrl = config().cloudinaryBaseUrl;



// Menkule Constructor
function Menkule(){
    this.apiAddress = config().apiAdress;
    this.socketAddress = config().socketAddress;
    this.cloudinaryBaseUrl = config().cloudinaryBaseUrl;
}

//Extend from eventemmiter
EventEmitter(Menkule.prototype);

//Request
Menkule.prototype.request = function(method, url, data) {

  return new Promise((resolve, reject) => {
    var ajaxOptions = {url: apiAddress + url, method: method, dataType: "json"};

    if (["POST", "PUT"].indexOf(method) > -1) {
      if (!(data instanceof File)) {
        ajaxOptions["data"] = JSON.stringify(data ? data : {});
        ajaxOptions["contentType"] = "application/json;charset=utf-8";
      }
      else {
        ajaxOptions["contentType"] = false;
        ajaxOptions["processData"] = false;
        ajaxOptions["data"] = data;
      }

    } else {
      var queryString = [];
      if (typeof data == "object") Object.keys(data).map(key => queryString.push(key + "=" + encodeURIComponent(data[key])));
      if (queryString.length > 0) ajaxOptions["url"] = ajaxOptions["url"] + "?" + queryString.join("&");
    }
    if (this.hasToken()) ajaxOptions["beforeSend"] = (xhr => xhr.setRequestHeader('Authorization', 'Bearer ' + token));
    ajaxOptions.timeout = 20000;
    $.ajax(ajaxOptions)
      .done(result => resolve(result))
      .fail(err => {
        if (err && err.statusText == 'timeout') window.location = "/error/timeout";
        reject(err);
        return this.emit("error.login");
      });
  });
};
Menkule.prototype.post = function(url, data){ return this.request("POST", url, data); };
Menkule.prototype.get = function(url, data){ return this.request("GET", url, data); };

//Token
Menkule.prototype.hasToken = function(){
  return token !== null;
};
Menkule.prototype.saveToken = function(t){
  window.localStorage.setItem("menkule_token", token = t);
  this.startSocket();
};
Menkule.prototype.removeToken = function(){
  this.stopSocket();
  window.localStorage.removeItem("menkule_token");
};
Menkule.prototype.getToken = function(){
    return token;
};

//User
Menkule.prototype.getUser = function(){
  return loggedUser;
};
Menkule.prototype.confirmPopup = function(messages,succesEvent){
 // Menkule.prototype.addListener('popupaccept',succesEvent);
 // this.loadTemplate("confirm",$("body"),"css,js",function(){$('#confirmpopup .message').html(messages);$('#confirmpopup').modal('show')});
};
Menkule.prototype.logout = function(){
  return new Promise(resolve => {
    loggedUser = null;
    this.removeToken();
    resolve(true);
  });
};
Menkule.prototype.startSocket = function (){
  if (socket) return;
  socket = io(socketAddress, {'query': 'token=' + token});
  socket.on('notification', (notification) => this.emit('new.notification', notification));
  socket.on('message', (message) => this.emit('new.message', message));
};
Menkule.prototype.stopSocket = function (){
  if (!socket) return;
  socket.off();
  socket.close();
  socket.disconnect();
  socket = null;
};
Menkule.prototype.login = function(email, password, save) {
  return new Promise((resolve, reject) => {
    this.post("/user/login", {"email": email, "password": password, "save": save })
      .then(result => {
        this.saveToken(result.result);
        resolve(result);
      })
      .catch(err => reject(err));
  });
};
Menkule.prototype.changePass = function(current, newpass, replypass) {
   return new Promise((resolve, reject) => {
   this.post("/user/password", {"currentpassword": current, "password": newpass, "reply": replypass })
   .then(result => {
   resolve();
   })
   .catch(err => reject(err));
   });

};
Menkule.prototype.register = function (name,lastname,email,gsm,gender,password) {
     return new Promise((resolve, reject) => {
     this.post("/user/register", { "name": name, "lastname": lastname, "email": email, "gsm": gsm, "gender": gender, "password": password })
     .then(result => resolve(result))
     .catch(err => reject(err));
     });
};
Menkule.prototype.Ownershipping = function() {
  return new Promise((resolve, reject) => {
    m.post("/user/ownership", { })
      .then(() => this.user(true)) // refresh user data
      .then((user) => resolve(user))
      .catch(err => reject(err));
  });
};
Menkule.prototype.updateProfile = function(name, lastname, email, gsm){
  return new Promise((resolve,reject) => {
    m.post("/user/update", { name, lastname, email, gsm })
      .then(() => this.user(true)) // refresh user
      .then((user) => resolve(user))
      .catch(err => reject(err));
  });
};
Menkule.prototype.isLogged = function () {
  return new Promise((resolve) => {
    this.user().then(user => {
      if (user !== null) return resolve(true);
      resolve(false);
    });
  });
};
Menkule.prototype.isActive = function () {
  return new Promise((resolve) => {
    this.user().then(user => {
        if(user) resolve(user.state);
        resolve(false);
    });
  });
};

Menkule.prototype.user = function(force) {
  force = force || false;
  return new Promise((resolve) => {
    if (!this.hasToken() || (loggedUser && force !== true)) return resolve(loggedUser);
    this.get("/user/detail")
      .then(user => {
        resolve(loggedUser = user);
      })
      .catch(err => this.logout().then(() => resolve(null)));
  });
};


export default Menkule

