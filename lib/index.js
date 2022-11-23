"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlexAPIClient = void 0;
var util_1 = require("util");
var util_2 = require("./util");
var request = require('request-promise');
var os = require('os');
var PlexAPIClient = /** @class */ (function () {
    function PlexAPIClient(clientId, username, password, options) {
        this.clientId = '';
        this.username = '';
        this.password = '';
        this.accessToken = '';
        this.options = {};
        this.clientId = clientId;
        this.username = username;
        this.password = password;
        Object.assign(this.options, options);
    }
    PlexAPIClient.prototype.authenticate = function () {
        var _this = this;
        var options = {
            method: 'POST',
            url: 'https://plex.tv/api/v2/users/signin',
            json: true,
            headers: {
                'X-Plex-Client-Identifier': this.clientId,
                'X-Plex-Device-Name': this.options.title || 'Node.js Device',
                'X-Plex-Version': this.options.version || '1.0',
                'X-Plex-Product': this.options.description || 'My awesome app!',
                'X-Plex-Device': this.options.operatingSystem || os.platform()
            },
            form: {
                login: this.username,
                password: this.password,
            },
        };
        return new Promise(function (resolve) {
            request(options)
                .then(function (result) {
                _this.accessToken = result.authToken;
                resolve(result.authToken);
            })
                .catch(function (error) {
                throw new Error(error.message);
            });
        });
    };
    PlexAPIClient.prototype.getServers = function () {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.getServers(); });
        var servers = [];
        var options = {
            method: 'GET',
            url: 'https://plex.tv/api/servers',
            json: true,
            headers: {
                'X-Plex-Token': this.accessToken,
            },
        };
        return new Promise(function (resolve) {
            request(options)
                .then(function (result) {
                (0, util_2.parseXML)(result).then(function (parsedResult) {
                    if ((0, util_1.isUndefined)(parsedResult.MediaContainer.Server))
                        return resolve(servers);
                    parsedResult.MediaContainer.Server.forEach(function (server) {
                        servers.push(Object.assign(new Object, server.$));
                    });
                    resolve(servers);
                });
            })
                .catch(function (error) {
                throw new Error(error.message);
            });
        });
    };
    PlexAPIClient.prototype.getUsers = function () {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.getUsers(); });
        var users = [];
        var options = {
            method: 'GET',
            url: 'https://plex.tv/api/users',
            json: true,
            headers: {
                'X-Plex-Token': this.accessToken,
            },
        };
        return new Promise(function (resolve) {
            request(options)
                .then(function (result) {
                (0, util_2.parseXML)(result).then(function (parsedResult) {
                    if ((0, util_1.isUndefined)(parsedResult.MediaContainer.User))
                        return resolve(users);
                    parsedResult.MediaContainer.User.forEach(function (user) {
                        users.push(Object.assign(new Object, user.$));
                    });
                    resolve(users);
                });
            })
                .catch(function (error) {
                throw new Error(error.message);
            });
        });
    };
    PlexAPIClient.prototype.getPendingUsers = function () {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.getPendingUsers(); });
        var users = [];
        var options = {
            method: 'GET',
            url: 'https://plex.tv/api/invites/requested',
            json: true,
            headers: {
                'X-Plex-Token': this.accessToken,
            },
        };
        return new Promise(function (resolve) {
            request(options)
                .then(function (result) {
                (0, util_2.parseXML)(result).then(function (parsedResult) {
                    if ((0, util_1.isUndefined)(parsedResult.MediaContainer.Invite))
                        return resolve(users);
                    parsedResult.MediaContainer.Invite.forEach(function (user) {
                        users.push(Object.assign(new Object, user.$));
                    });
                    resolve(users);
                });
            })
                .catch(function (error) {
                throw new Error(error.message);
            });
        });
    };
    PlexAPIClient.prototype.getAllUsers = function () {
        var _this = this;
        var users = [];
        return new Promise(function (resolve, reject) {
            _this.getUsers().then(function (userResult) {
                users.push.apply(users, userResult);
                _this.getPendingUsers().then(function (pendingUserResult) {
                    users.push.apply(users, pendingUserResult);
                    resolve(users);
                });
            });
        });
    };
    PlexAPIClient.prototype.getPendingFriends = function () {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.getPendingFriends(); });
        var users = [];
        var options = {
            method: 'GET',
            url: 'https://plex.tv/api/v2/friends?status=pending_sent&includeSharedServers=true',
            json: true,
            headers: {
                'X-Plex-Token': this.accessToken,
            },
        };
        return new Promise(function (resolve) {
            request(options)
                .then(function (fetchedUsers) {
                fetchedUsers.forEach(function (user) {
                    users.push(user);
                });
                resolve(users);
            })
                .catch(function (error) {
                throw new Error(error.message);
            });
        });
    };
    PlexAPIClient.prototype.inviteUser = function (username, machineId) {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.inviteUser(username, machineId); });
        var options = {
            method: 'POST',
            uri: 'https://plex.tv/api/v2/shared_servers',
            headers: {
                'X-Plex-Client-Identifier': this.clientId,
                'X-Plex-Token': this.accessToken,
            },
            form: {
                invitedEmail: username,
                librarySectionIds: [],
                machineIdentifier: machineId,
                settings: {}
            }
        };
        request(options)
            .catch(function (error) {
            throw new Error(error.message);
        });
    };
    PlexAPIClient.prototype.removeUser = function (userId) {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.removeUser(userId); });
        var options = {
            method: 'DELETE',
            uri: "https://plex.tv/api/friends/".concat(userId),
            headers: {
                'X-Plex-Client-Identifier': this.clientId,
                'X-Plex-Token': this.accessToken,
            },
        };
        request(options)
            .catch(function (error) {
            throw new Error(error.message);
        });
    };
    PlexAPIClient.prototype.removePendingUser = function (userId) {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.removePendingUser(userId); });
        var options = {
            method: 'DELETE',
            uri: "https://plex.tv/api/invites/requested/".concat(userId, "?friend=1&server=1&home=0"),
            headers: {
                'X-Plex-Client-Identifier': this.clientId,
                'X-Plex-Token': this.accessToken,
            },
        };
        request(options)
            .catch(function (error) {
            throw new Error(error.message);
        });
    };
    PlexAPIClient.prototype.getSessions = function (ip, port) {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.getSessions(ip, port); });
        var sessions = [];
        var options = {
            method: 'GET',
            url: "http://".concat(ip, ":").concat(port, "/status/sessions"),
            headers: {
                'X-Plex-Token': this.accessToken,
            },
        };
        return new Promise(function (resolve) {
            request(options)
                .then(function (result) {
                (0, util_2.parseXML)(result).then(function (parsedResult) {
                    if ((0, util_1.isUndefined)(parsedResult.MediaContainer.Video))
                        return resolve(sessions);
                    parsedResult.MediaContainer.Video.forEach(function (session) {
                        sessions.push(Object.assign(new Object, session.$, {
                            player: __assign({}, session.Player[0].$),
                            user: __assign({}, session.User[0].$)
                        }));
                    });
                    resolve(sessions);
                });
            })
                .catch(function (error) {
                throw new Error(error.message);
            });
        });
    };
    PlexAPIClient.prototype.isValidUser = function (emailOrUsername) {
        var _this = this;
        if (this.accessToken === '')
            return this.authenticate().then(function () { return _this.isValidUser(emailOrUsername); });
        var options = {
            method: 'GET',
            url: "https://plex.tv/api/users/validate?invited_email=".concat(emailOrUsername),
            headers: {
                'X-Plex-Token': this.accessToken,
            },
        };
        return new Promise(function (resolve) {
            request(options)
                .then(function (result) {
                resolve(result.includes('Valid user'));
            })
                .catch(function (error) {
                throw new Error(error.message);
            });
        });
    };
    return PlexAPIClient;
}());
exports.PlexAPIClient = PlexAPIClient;
