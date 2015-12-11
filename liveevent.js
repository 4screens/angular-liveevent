(function(angular) {
/// <reference path="../typings/tsd.d.ts" />
var app = angular.module('4screens.liveevent', ['LocalStorageModule']);
var Engageform;
(function (Engageform) {
    (function (Type) {
        Type[Type["Undefined"] = 0] = "Undefined";
        Type[Type["Live"] = 1] = "Live";
        Type[Type["Outcome"] = 2] = "Outcome";
        Type[Type["Poll"] = 3] = "Poll";
        Type[Type["Score"] = 4] = "Score";
        Type[Type["Survey"] = 5] = "Survey";
    })(Engageform.Type || (Engageform.Type = {}));
    var Type = Engageform.Type;
    (function (Mode) {
        Mode[Mode["Undefined"] = 0] = "Undefined";
        Mode[Mode["Default"] = 1] = "Default";
        Mode[Mode["Preview"] = 2] = "Preview";
        Mode[Mode["Result"] = 3] = "Result";
        Mode[Mode["Summary"] = 4] = "Summary";
    })(Engageform.Mode || (Engageform.Mode = {}));
    var Mode = Engageform.Mode;
})(Engageform || (Engageform = {}));
/// <reference path="iliveevent.ts" />
/// <reference path="iliveevent.ts" />
var Liveevent;
(function (Liveevent_1) {
    var Liveevent = (function () {
        function Liveevent() {
            this.event = new Util.Event();
        }
        Liveevent.prototype.summaryStatsUnification = function (data) {
            var result = {};
            result.questionId = data._id;
            if (data.type === 'rateIt') {
                result.avg = data.stats.avg;
                return result;
            }
            _.each(data.answers, function (answer) {
                result[answer._id] = answer.percent;
            });
            return result;
        };
        ;
        Liveevent.prototype.getAnswersForSummary = function () {
            var _this = this;
            var url = Extension.config.backend.domain + Extension.config.engageform.presentationViewStats;
            url = url.replace(':questionId', this.activePageId);
            return Extension.$http.get(url).then(function (res) {
                if ([200, 304].indexOf(res.status) !== -1) {
                    return _this.summaryStatsUnification(res.data);
                }
                return Extension.$q.reject(res);
            });
        };
        ;
        Liveevent.prototype.updatePage = function (page) {
            var _this = this;
            console.log('[ Liveevent ] Update Page: ' + page._id, this.currentEngageform.navigation);
            var __type = this.activePage ? (this.activePage.type + '') : null;
            // Check if form and if so, send all inputs
            if (__type && __type.indexOf('form') > -1) {
                this.currentEngageform.navigation.pick(null, null, { quiet: true });
            }
            this.activePage = page;
            this.activePageId = page._id;
            this.currentEngageform.message = null;
            this.currentEngageform.initPage(page);
            // Add liveSettings
            this.currentEngageform.liveSettings = page.liveSettings;
            // Overwrite navigation
            this.currentEngageform.navigation.enabled = false;
            this.currentEngageform.navigation.position = 0;
            this.currentEngageform.navigation.size = 1;
            this.currentEngageform.navigation.hasStart = false;
            this.currentEngageform.navigation.enabledStart = false;
            this.currentEngageform.navigation.hasPrev = false;
            this.currentEngageform.navigation.enabledPrev = false;
            this.currentEngageform.navigation.hasNext = false;
            this.currentEngageform.navigation.enabledNext = false;
            this.currentEngageform.navigation.hasFinish = false;
            this.currentEngageform.navigation.enabledFinish = false;
            this.currentEngageform.navigation.distance = 0;
            this.currentEngageform.navigation.prev = function ($event) { return; };
            this.currentEngageform.navigation.next = function ($event, vcase) { return; };
            this.currentEngageform.navigation.start = function ($event) { return; };
            this.currentEngageform.navigation.finish = function ($event, vcase) { return; };
            if (!this.currentEngageform.navigation.truePick) {
                this.currentEngageform.navigation.truePick = this.currentEngageform.navigation.pick;
            }
            // Block pick if answers are not allowed
            this.currentEngageform.navigation.pick = function (event, page, options) {
                if (_this.currentEngageform.liveSettings.acceptResponses) {
                    _this.currentEngageform.navigation.truePick(event, page, options);
                }
                else {
                    _this.currentEngageform.message = 'Answering is disabled at the moment.';
                }
            };
            if (Extension.mode === Engageform.Mode.Summary && this.currentEngageform.current
                && this.activePageId && _.has(Extension.config, 'engageform.presentationViewStats')) {
                this.getAnswersForSummary().then(function (answersData) {
                    _this.currentEngageform.current.updateAnswers(answersData);
                });
                this.currentEngageform.liveSettings.showAnswers = true;
            }
        };
        Liveevent.prototype.removePage = function () {
            var _this = this;
            console.log('[ Liveevent ] Remove page');
            Extension.$timeout(function () {
                _this.activePage = null;
                _this.activePageId = null;
                if (_this.currentEngageform) {
                    _this.currentEngageform.current = null;
                    _this.currentEngageform.message = null;
                }
            });
        };
        Liveevent.prototype.updateQuiz = function (EF) {
            this.currentEngageform = EF;
            this.event.trigger('now::changed', EF);
            console.log('[ Liveevent ] Update Quiz: ' + this.currentEngageform._engageformId);
            if (!this.currentEngageform.navigation.truePick) {
                this.currentEngageform.navigation.truePick = this.currentEngageform.navigation.pick;
            }
            this.activeQuiz = this.currentEngageform;
            this.activeQuizId = this.currentEngageform._engageformId;
        };
        Liveevent.prototype.removeQuiz = function () {
            var _this = this;
            console.log('[ Liveevent ] Remove quiz');
            Extension.$timeout(function () {
                _this.activeQuiz = null;
                _this.activeQuizId = null;
                _this.currentEngageform = null;
                if (_this.currentEngageform) {
                    _this.currentEngageform.branding = null;
                    _this.currentEngageform.current = null;
                    _this.currentEngageform.message = null;
                    _this.currentEngageform.meta = null;
                    _this.currentEngageform.navigation = null;
                    _this.currentEngageform.theme = null;
                    _this.currentEngageform.title = null;
                    _this.currentEngageform.type = null;
                }
            });
        };
        // Init chat
        Liveevent.prototype.initChat = function (id) {
            var deferred = Extension.$q.defer();
            if (!this.chat && id) {
                this.chat = new ChatModule.Chat(id, this);
                return this.chat.init();
            }
            else {
                // If it is already initialised (meaning it's available on this instance), return a fake promise that
                // is here just to make the API looks better.
                deferred.resolve();
                return deferred.promise;
            }
        };
        // Sockets
        Liveevent.prototype.initSocket = function (opts) {
            var _this = this;
            console.log('[ Liveevent ] Init socket');
            var url = Extension.config.backend.socket + Extension.config.liveEvent.socketNamespace;
            url = url.replace(':liveEventId', opts.id);
            this.socket = Extension.io.connect(url, { forceNew: true });
            this.socket.on('connect', function () {
                console.log('[ Liveevent:Socket ] Connected');
                _this.socket.emit('getStatus', { liveEventId: opts.id });
            });
            this.socket.on('disconnect', this.initSocket);
            this.socket.on('error', function (res) {
                console.warn('[ Liveevent:Socket ] Error: ' + res);
            });
            this.socket.on('reconnecting', function () {
                console.warn('[ Liveevent:Socket ] Reconnecting');
            });
            this.socket.on('reconnect_failed', function () {
                console.warn('[ Liveevent:Socket ] Reconnect failed');
            });
            this.socket.on('reconnect', function () {
                console.log('[ Liveevent:Socket ] Reconnect');
                _this.socket.emit('getStatus', { liveEventId: opts.id });
            });
            this.socket.on('liveEventStatus', function (data) {
                _this.chat.status = data.chatAvailable;
                // Liveevent is off
                if (!data.isActive) {
                    console.log('[ Liveevent:Socket ] Liveevent is not active');
                    _this.removePage();
                    _this.removeQuiz();
                    // Run callback
                    if (opts.callback && opts.callback.liveEventStatus) {
                        data.id = opts.id;
                        opts.callback.liveEventStatus(data);
                    }
                    return;
                }
                if (data.activeQuestionId !== _this.activePageId || data.activeQuizId !== _this.activeQuizId) {
                    // Quiz is off
                    if (!data.activeQuizId) {
                        console.log('[ Liveevent ] Quiz is empty');
                        _this.removeQuiz();
                        // Run callback
                        if (opts.callback && opts.callback.liveEventStatus) {
                            data.id = opts.id;
                            opts.callback.liveEventStatus(data);
                        }
                        return;
                    }
                    _this.EF.init({ id: data.activeQuizId, mode: 'default', callback: { sendAnswerCallback: _this.sendAnswerCallback } }).then(function (res) {
                        _this.updateQuiz(res);
                    });
                    // Page is off
                    if (!data.activeQuestionId) {
                        console.log('[ Liveevent ] Page is empty');
                        _this.removePage();
                        // Run callback
                        if (opts.callback && opts.callback.liveEventStatus) {
                            data.id = opts.id;
                            opts.callback.liveEventStatus(data);
                        }
                        return;
                    }
                    // Quiz changed
                    if (data.activeQuizId !== _this.activeQuizId) {
                        console.log('[ Liveevent:Socket ] Quiz changed');
                        _this.EF.init({ id: data.activeQuizId, mode: 'default', callback: { sendAnswerCallback: _this.sendAnswerCallback } }).then(function (res) {
                            _this.updateQuiz(res);
                            // Update Page
                            _this.getPageById(data.activeQuestionId).then(function (page) {
                                _this.updatePage(page);
                            });
                        });
                    }
                    else {
                        // Only Page changed
                        console.log('[ Liveevent:Socket ] Only Page changed');
                        _this.getPageById(data.activeQuestionId).then(function (page) {
                            _this.updatePage(page);
                        });
                    }
                }
                // Quiz and page is same, check if showAnswers or acceptResponses had change
                if (_this.currentEngageform) {
                    if (data.showAnswers !== _this.currentEngageform.liveSettings.showAnswers) {
                        console.log('[ Liveevent ] Show answer option changed');
                        Extension.$timeout(function () {
                            _this.currentEngageform.liveSettings.showAnswers = data.showAnswers;
                        });
                    }
                    if (data.acceptResponses !== _this.currentEngageform.liveSettings.acceptResponses) {
                        console.log('[ Liveevent ] Accept responses option changed');
                        Extension.$timeout(function () {
                            _this.currentEngageform.liveSettings.acceptResponses = data.acceptResponses;
                            _this.currentEngageform.message = '';
                        });
                    }
                }
                // Run callback
                if (opts.callback && opts.callback.liveEventStatus) {
                    data.id = opts.id;
                    opts.callback.liveEventStatus(data);
                }
            });
            this.socket.on('rateItQuestionStatus', function (data) {
                _this.currentEngageform.current.updateAnswers(data);
            });
            this.socket.on('multipleChoiceQuestionAnswers', function (data) {
                _this.currentEngageform.current.updateAnswers(data);
            });
            // Buzzer listening
            this.socket.on('buzzerQuestionStatusCallback', function (data) {
                // Run callback
                if (opts.callback && opts.callback.buzzerQuestionStatus) {
                    data.id = opts.id;
                    opts.callback.buzzerQuestionStatus(data);
                }
            });
        };
        // Get Liveevent
        Liveevent.prototype.getById = function (id) {
            var url = Extension.config.backend.domain + Extension.config.liveEvent.liveEventUrl;
            url = url.replace(':liveEventId', id);
            // TODO: Get quiz and current question
            return Extension.$http.get(url).then(function (res) {
                if ([200, 304].indexOf(res.status) !== -1) {
                    return res.data;
                }
                return Extension.$q.reject(res);
            });
        };
        // Get Page
        Liveevent.prototype.getPageById = function (questionId) {
            var url = Extension.config.backend.domain + Extension.config.liveEvent.activeQuestion;
            url = url.replace(':questionId', questionId);
            return Extension.$http.get(url).then(function (res) {
                if ([200, 304].indexOf(res.status) !== -1) {
                    console.log('[ Liveevent ] Get PAGE: ' + res.data['_id']);
                    return res.data;
                }
                this.$q.reject(res);
            });
        };
        Liveevent.prototype.init = function (opts) {
            var _this = this;
            console.log('[ Liveevent ] Init: ' + opts.id);
            var deferred = Extension.$q.defer();
            this.id = opts.id;
            this.EF = opts.engageform;
            this.sendAnswerCallback = opts.callback.sendAnswerCallback;
            // Get Liveevent
            this.getById(opts.id).then(function (res) {
                // Init socket
                _this.initSocket(opts);
                // Init chat
                _this.initChat(res.chatId).then(function () {
                    // ...
                });
                deferred.resolve(_this);
            });
            return deferred.promise;
        };
        return Liveevent;
    })();
    Liveevent_1.Liveevent = Liveevent;
})(Liveevent || (Liveevent = {}));
/// <reference path="./ichat.ts" />
var ChatModule;
(function (ChatModule) {
    function featuredMessageNotify(oldValue, newValue, message) {
        this._liveevent.event.trigger('chat::messageFeatureStatusChanged', this._liveevent.id, message, newValue);
        return message;
    }
    function updateFeaturedStatus(oldValue, newValue, message) {
        message.featured = newValue;
        return message;
    }
    var Chat = (function () {
        function Chat(id, liveevent) {
            this.messages = [];
            this.updateMessageHandlers = {};
            this.id = id;
            this._liveevent = liveevent;
            // Feature status handlers
            this.registerUpdateMessageHandler('featured', updateFeaturedStatus);
            this.registerUpdateMessageHandler('featured', featuredMessageNotify);
        }
        /**
         * Registers handlers that will be invoked and will potentially modify the message on its data update.
         * @param field
         * @param handler
         */
        Chat.prototype.registerUpdateMessageHandler = function (field, handler) {
            if (!this.updateMessageHandlers[field]) {
                this.updateMessageHandlers[field] = [];
            }
            this.updateMessageHandlers[field].push(handler);
        };
        Chat.prototype.login = function (data, dataMe) {
            this.user = {
                accessToken: data.accessToken,
                user: data.userID,
                userLink: dataMe.link,
                userName: dataMe.name,
                userID: data.userID
            };
        };
        Chat.prototype.logout = function () {
            this.user = null;
        };
        Chat.prototype.updateChat = function (data) {
            console.log('[ Chat ] Update chat');
            this.id = data.id;
            this.name = data.name;
            this.premoderated = data.premoderated;
            this.direction = data.chatDirection;
            this.theme = data.theme;
            // Get some old msgs
            this.getMsgs();
        };
        Chat.prototype.sendMsg = function (m) {
            console.log('[ Chat ] Posting msg');
            if (!this.user)
                return;
            var url = Extension.config.backend.domain + Extension.config.chat.sendUrl, msg;
            url = url.replace(':chatId', this.id);
            msg = {
                accessToken: this.user.accessToken,
                date: Date.now(),
                hidden: false,
                id: this.user.userId,
                msg: m,
                user: this.user.user,
                userLink: this.user.userLink,
                userName: this.user.userName
            };
            return Extension.$http.post(url, msg);
        };
        Chat.prototype.getMsgs = function () {
            var _this = this;
            console.log('[ Chat ] Get old msgs');
            var url = Extension.config.backend.domain + Extension.config.chat.messagesUrl;
            url = url.replace(':chatId', this.id);
            return Extension.$http.get(url).then(function (res) {
                //console.log('[ Chat ] Got ' + res.data.length + ' msgs');
                _this.messages = res.data;
                if (_this.messages.length) {
                    // Sort by newest
                    _this.messages = _.sortBy(_this.messages, 'date').reverse();
                    // Reverse msg order
                    if (_this.direction && _this.direction === 'ttb') {
                        _this.messages.reverse();
                    }
                }
                _.forEach(_this.messages, function (message) {
                    _this._liveevent.event.trigger('chat::message', _this._liveevent.id, message);
                });
            });
        };
        /**
         * Handles updates of a message data, delegating data to handler functions.
         * @param message
         * @param newData
         * @returns {IMessage}
         */
        Chat.prototype.handleNewMessageData = function (message, newData) {
            var _this = this;
            _.forOwn(newData, function (value, field) {
                // When the value is different than it was before and there are handlers defined, call them.
                if (value !== message[field] && _.isArray(_this.updateMessageHandlers[field])) {
                    var oldValue = message[field];
                    _.forEach(_this.updateMessageHandlers[field], function (handler) {
                        handler.call(_this, oldValue, value, message);
                    });
                }
            });
            return message;
        };
        Chat.prototype.initSocket = function () {
            var _this = this;
            console.log('[ Chat:Socket ] Init socket');
            var url = Extension.config.backend.socket;
            this.socket = Extension.io.connect(url, { forceNew: true });
            this.socket.on('error', function (res) {
                console.warn(res);
            });
            this.socket.on('connect', function (data) {
                console.log('[ Chat:Socket ] Connected');
                // Join room
                _this.socket.emit('joinRoom', _this.id);
                // We can also leave room, to do so just emit 'leaveRoom' with roomId as param
            });
            // New msg event
            this.socket.on('msg', function (data) {
                console.log('[ Chat:Socket ] New msg');
                // "msg" event is triggered not only when new message arrives, but also a message changes.
                var existingMsg = _.find(_this.messages, function (message) {
                    return message.id === data.id;
                });
                Extension.$rootScope.$apply(function () {
                    if (existingMsg) {
                        _this.handleNewMessageData(existingMsg, data);
                    }
                    else {
                        if (_this.direction && _this.direction === 'ttb') {
                            _this.messages.push(data);
                        }
                        else {
                            _this.messages.unshift(data);
                        }
                    }
                });
                if (!existingMsg) {
                    _this._liveevent.event.trigger('chat::message', _this._liveevent.id, data);
                }
            });
            this.socket.on('msgHide', function (id) {
                console.log('[ Chat:Socket] Hide msg');
                _this._liveevent.event.trigger('chat::hideMessage', id);
                var messageIndex = _this.messages.length;
                for (var i = 0; i < _this.messages.length; i += 1) {
                    if (_this.messages[i].id === id) {
                        messageIndex = i;
                    }
                }
                Extension.$rootScope.$apply(function () {
                    _this.messages.splice(messageIndex, 1);
                });
            });
            // On disconect
            this.socket.on('disconnect', this.initSocket);
        };
        Chat.prototype.init = function () {
            var _this = this;
            console.log('[ Chat ] Init: ' + this.id);
            // Get chat details
            var url = Extension.config.backend.domain + Extension.config.chat.detailUrl;
            url = url.replace(':chatId', this.id);
            return Extension.$http.get(url).then(function (res) {
                _this.updateChat(res.data);
                _this.initSocket();
                return res;
            });
        };
        return Chat;
    })();
    ChatModule.Chat = Chat;
})(ChatModule || (ChatModule = {}));
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./engageform/enum.ts" />
/// <reference path="./api/api.ts" />
/// <reference path="./liveevent/liveevent.ts" />
/// <reference path="./chat/chat.ts" />
var Extension = (function () {
    function Extension($http, $q, $timeout, localStorage, $rootScope, ApiConfig) {
        Extension.$http = $http;
        Extension.$timeout = $timeout;
        Extension.$q = $q;
        Extension.localStorage = localStorage;
        Extension.config = ApiConfig;
        Extension.$rootScope = $rootScope;
    }
    Extension.prototype.init = function (opts) {
        if (Extension._instances[opts.id]) {
            return Extension._instances[opts.id];
        }
        Extension.io = opts.io;
        switch (opts.mode) {
            case 'summary':
                Extension.mode = Engageform.Mode.Summary;
                break;
            case 'default':
            case '':
            case undefined:
                Extension.mode = Engageform.Mode.Default;
                break;
            default:
                return Extension.$q.reject({
                    status: 'error',
                    error: {
                        code: 406,
                        message: 'Mode property not supported.'
                    },
                    data: opts
                });
        }
        var liveEvent = new Liveevent.Liveevent();
        if (!opts.callback) {
            opts.callback = {
                sendAnswerCallback: function () { }
            };
        }
        else if (!opts.callback.sendAnswerCallback) {
            opts.callback.sendAnswerCallback = function () { };
        }
        return Extension._instances[opts.id] = liveEvent.init(opts);
    };
    Extension.mode = Engageform.Mode.Undefined;
    Extension._instances = {};
    return Extension;
})();
Extension.$inject = ['$http', '$q', '$timeout', 'localStorageService', '$rootScope', 'ApiConfig'];
app.service('Liveevent', Extension);
/// <reference path="../branding/ibranding.ts" />
var Page;
(function (Page) {
    (function (CaseType) {
        CaseType[CaseType["Undefined"] = 0] = "Undefined";
        CaseType[CaseType["Image"] = 1] = "Image";
        CaseType[CaseType["Input"] = 2] = "Input";
        CaseType[CaseType["Iteration"] = 3] = "Iteration";
        CaseType[CaseType["Text"] = 4] = "Text";
    })(Page.CaseType || (Page.CaseType = {}));
    var CaseType = Page.CaseType;
    (function (Type) {
        Type[Type["Undefined"] = 0] = "Undefined";
        Type[Type["EndPage"] = 1] = "EndPage";
        Type[Type["Form"] = 2] = "Form";
        Type[Type["MultiChoice"] = 3] = "MultiChoice";
        Type[Type["PictureChoice"] = 4] = "PictureChoice";
        Type[Type["Rateit"] = 5] = "Rateit";
        Type[Type["StartPage"] = 6] = "StartPage";
        Type[Type["Buzzer"] = 7] = "Buzzer";
        Type[Type["Poster"] = 8] = "Poster";
    })(Page.Type || (Page.Type = {}));
    var Type = Page.Type;
})(Page || (Page = {}));
var Page;
(function (Page) {
    ;
})(Page || (Page = {}));
///<reference path="../page/ipage.ts"/>
/// <reference path="api/iembed.ts" />
/// <reference path="api/iquizquestion.ts" />
/// <reference path="api/iquizquestionsres.ts" />
/// <reference path="api/iquizquestionanswer.ts" />
/// <reference path="api/iquizquestionanswerres.ts" />
/// <reference path="api/iquiz.ts" />
/// <reference path="api/iquizres.ts" />
/// <reference path="api/iquizfinish.ts" />
/// <reference path="api/iquizfinishres.ts" />
/// <reference path="page/enum.ts" />
/// <reference path="page/icase.ts" />
/// <reference path="page/ipage.ts" />
/// <reference path="page/ipages.ts" />
/// <reference path="page/ipagesent.ts" />
/// <reference path="page/isettings.ts" />
/// <reference path="engageform/enum.ts" />
/// <reference path="engageform/iengageform.ts" />
/// <reference path="engageform/isettings.ts" />
/// <reference path="engageform/itheme.ts" />
/// <reference path="engageform/itabs.ts" />
/// <reference path="branding/ibranding.ts" />
/// <reference path="navigation/inavigation.ts" /> 
/*!
 * 4screens-angular-liveevent v0.1.44
 * (c) 2015 Nopattern sp. z o.o.
 * License: proprietary
 */
var Util;
(function (Util) {
    var Event = (function () {
        function Event() {
            this._listener = {};
        }
        /**
         * Register callback for given event.
         *
         * @param {String} event
         * @param {Function} callback
         */
        Event.prototype.listen = function (event, callback) {
            console.log('[ Util:Event ] listen', event);
            if (!this._listener[event]) {
                this._listener[event] = [];
            }
            this._listener[event].push(callback);
        };
        /**
         * Removes one or all calbacks from the registered listeners.
         *
         * @param {String} event
         * @param {Function} callback
           */
        Event.prototype.unsubscribe = function (event, callback) {
            console.log('[ Util:Event ] unsubscribe', event);
            if (this._listener[event]) {
                if (!callback) {
                    this._listener[event].length = 0;
                }
                else {
                    _.pull(this._listener[event], callback);
                }
            }
        };
        /**
         * Fire event with given arguments.
         *
         * @param {string} event
         * @param {args...} data
         */
        Event.prototype.trigger = function (event) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
            console.log('[ Util:Event ] trigger', event);
            var args = Array.apply(null, arguments).slice(1);
            var listeners = this._listener[event];
            if (!listeners) {
                return;
            }
            for (var i = 0; i < listeners.length; i++) {
                listeners[i].apply(null, args);
            }
        };
        return Event;
    })();
    Util.Event = Event;
})(Util || (Util = {}));
})(angular);
//# sourceMappingURL=liveevent.js.map
