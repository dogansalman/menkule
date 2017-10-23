import io from 'socket.io-client';
import EventEmitter from 'event-emitter';
import * as jwt from 'jwt-simple';
import config from './configs/config';


// Private properties
let socket = null;
let token = window.localStorage.getItem("menkule_token") || null;
let wsToken = window.localStorage.getItem("menkule_ws_token") || null;
let loggedUser = null;
let apiAddress = config().apiAdress;
let socketAddress = config().socketAddress;
let cloudinaryBaseUrl = config().cloudinaryBaseUrl;
let nullImageUrl = config().nullImageUrl;
let secretKey = config().secretKey;


// Menkule Constructor
function Menkule(){
    this.apiAddress = config().apiAdress;
    this.socketAddress = config().socketAddress;
    this.cloudinaryBaseUrl = config().cloudinaryBaseUrl;
    this.nullImageUrl = config().nullImageUrl;
    this.secretKey = config().secretKey;
}

//Extend from eventemmiter
EventEmitter(Menkule.prototype);

//Request
Menkule.prototype.request = function(method, url, data, contentType) {
  return new Promise((resolve, reject) => {
    var ajaxOptions = {url: apiAddress + url, method: method};
    if (["POST", "PUT"].indexOf(method) > -1) {
      if (!(data instanceof File)) {
        ajaxOptions["data"] = contentType == 'application/x-www-form-urlencoded' ?  (data ? data : {}) : (JSON.stringify(data ? data : {}));
        ajaxOptions["contentType"] = contentType;
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
      });
  });
};
Menkule.prototype.post = function(url, data, contentType = 'application/json;charset=utf-8'){ return this.request("POST", url, data, contentType); };
Menkule.prototype.put = function(url, data, contentType = 'application/json;charset=utf-8'){ return this.request("PUT", url, data, contentType); };
Menkule.prototype.get = function(url, data){ return this.request("GET", url, data); };
Menkule.prototype.delete = function(url){ return this.request("DELETE", url); };
/*
Token
 */
Menkule.prototype.hasToken = function(){
  return token !== null;
};
Menkule.prototype.saveToken = function(t){
  window.localStorage.setItem("menkule_token", token = t);
};
Menkule.prototype.saveWsToken = function(user){
    window.localStorage.setItem("menkule_ws_token", wsToken = jwt.encode(user, secretKey));
    this.startSocket();
};
Menkule.prototype.removeToken = function(){
  this.stopSocket();
  window.localStorage.removeItem("menkule_token");
  window.localStorage.removeItem("menkule_ws_token");
};
Menkule.prototype.getToken = function(){
    return token;
};
Menkule.prototype.getWsToken = function(){
    return wsToken;
};
/*
Sockets
 */

Menkule.prototype.startSocket = function (){
  if (socket) return;
  socket = io(socketAddress, {'query': 'token=' + wsToken});
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

/*
 User
 */
Menkule.prototype.getUser = function(){
  return loggedUser;
};
Menkule.prototype.logout = function(){
  return new Promise(resolve => {
    loggedUser = null;
    this.removeToken();
    resolve(true);
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
Menkule.prototype.hasOwnershipping = function () {
  return new Promise((resolve) => {
    this.user().then(user => {
      if(user) resolve(user.ownershiping);
      resolve(false);
    });
  });
};
Menkule.prototype.user = function(force) {
  force = force || false;
  return new Promise((resolve) => {
    if (!this.hasToken() || (loggedUser && force !== true)) return resolve(loggedUser);
    this.get("/users")
      .then(user => {
        resolve(loggedUser = user);
      })
      .catch(err => this.logout().then(() => resolve(null)));
  });
};

export default Menkule

