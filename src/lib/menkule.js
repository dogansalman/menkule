import io from 'socket.io-client';
import EventEmitter from 'event-emitter';
import * as jwt from 'jwt-simple';
import config from './configs/config';


// Private properties
let socket = null;
const tokenData = ['access_token','expires_in','refresh_token','token_type', 'date'];
let token = function(){
    let x = {};
    tokenData.forEach(key => x[key] = window.localStorage.getItem(key) ? window.localStorage.getItem(key) : null);
    for(let i = 0; i < Object.keys(x).length; i++){
        if(!x[Object.keys(x)[i]]) {
            x = null;
            break;
        }
    }
    return x;
}();



let loggedUser = null;
let apiAddress = config().apiAdress;
let socketAddress = config().socketAddress;
let cloudinaryBaseUrl = config().cloudinaryBaseUrl;
let nullImageUrl = config().nullImageUrl;



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
    if (this.hasToken()) {
        if(this.tokenExpire()) this.refreshToken();
        ajaxOptions["beforeSend"] = (xhr => xhr.setRequestHeader('Authorization', 'Bearer ' + token.access_token));
    }
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
    Object.assign(t, {date: Date()});
    token = t;

    Object.keys(t).forEach(key => {
        window.localStorage.setItem(key, t[key]);
    });
};
Menkule.prototype.removeToken = function(){
    this.stopSocket();
    if(!token) return;
    tokenData.forEach(key => window.localStorage.removeItem(key));
};
Menkule.prototype.getToken = function(force){
    if(!token) return null;
    let property = null;
    tokenData.forEach(key => {
        property = key;
        Object.assign(token, { property: 'data'});
    })
    return token;
};
Menkule.prototype.refreshToken = function() {
    return new Promise((resolve, reject) => {
        if(!token) reject();
        this.request('POST', '/auth/login', {grant_type: 'refresh_token', refresh_token: this.getToken().refresh_token}, 'application/x-www-form-urlencoded')
            .then((token) => App.promise(() => this.saveToken(token)))
            .then(() => resolve())
            .catch((err) => reject(err));
    })
};
Menkule.prototype.tokenExpire = function () {
    let expire_date = new Date(this.getToken().date);
    expire_date.setSeconds(expire_date.getSeconds() + this.getToken().expires_in);
    if(new Date() > expire_date) return true;
};
/*
Sockets
 */

Menkule.prototype.startSocket = function (user){

  //if (socket) return;
  socket = io(socketAddress, {
      'query': 'user=' + user.id,
      'reconnection': true,
      'reconnectionDelay': 500,
      'reconnectionDelayMax' : 1000,
      secure: false,
      transports: ['websocket']

  });
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

