'use babel';

import EventEmitter from 'events';
import { shallowEqualObjects } from 'shallow-equal';
import AtomforcesDispatcher from './atomforces-dispatcher';
import CodeforcesScraper from '../business/codeforces-scraper';

class LoginStore {

    constructor() {
        this._emitter = new EventEmitter();
        this._changed = false;
        this.dispatchToken = AtomforcesDispatcher.register(payload => {
            this._invokeOnDispatch(payload);
        });

        this.data = {
            loggedIn: false,
            password: null,
            handle: null
        };
    }

    serialize() {
        return this.data;
    }

    load(data) {
        this.data = data;
        CodeforcesScraper.getUser(atom.config.get('atomforces.codeforcesHandle')).then(res => {
          this.data = {...data, ...res};
        })
    }

    addListener(event, callback) {
        this._emitter.on('c', callback);
    }

    removeListener(event, callback) {
        this._emitter.off('c', callback);
    }

    isLoggedIn() {
        return this.data.loggedIn;
    }

    getHandle() {
        return this.data.handle;
    }

    getData() {
        return this.data;
    }

    _invokeOnDispatch(payload) {
        this._changed = false;
        this._onDispatch(payload);
        if (this._changed) this._emitter.emit('c');
    }

    _updateLogin(login) {
        const newData = {
            ...this.data,
            ...login
        };

        if (shallowEqualObjects(this.data, newData)) return;
        this.data = newData;
        this._changed = true;
    }

    _onDispatch(payload) {
        switch (payload.type) {
            case 'UPDATE_LOGIN':
                this._updateLogin(payload.login);
                break;
        }
    }

}

export default new LoginStore();
