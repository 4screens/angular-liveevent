module Util {
  export interface IEvent {
    listen(event: string, callback: any): void;
    trigger(event: string, ...data: any[]): void;
  }

  export interface IListenersDictionary {
    [index: string]: IListener[];
  }

  export interface IListener {
    next: any;
  }

  export class Event implements IEvent {
    private _listener: IListenersDictionary = {};

    /**
     * Register callback for given event.
     *
     * @param {String} event
     * @param {Function} callback
     */
    listen(event: string, callback: any): void {
      console.log('[ Util:Event ] listen', event);

      if (!this._listener[event]) {
        this._listener[event] = [];
      }

      this._listener[event].push({
        next: callback
      });
    }

    /**
     * Fire event with given arguments.
     *
     * @param {string} event
     * @param {args...} data
     */
    trigger(event: string, ...data: any[]): void {
      console.log('[ Util:Event ] trigger', event);

      var args = Array.apply(null, arguments).slice(1);
      var listeners = this._listener[event];

      if (!listeners) {
        return;
      }

      for (var i=0; i<listeners.length; i++) {
        listeners[i].next.apply(null, args);
      }
    }
  }
}
