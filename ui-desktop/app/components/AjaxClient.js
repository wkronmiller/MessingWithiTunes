import jQuery from 'jquery';

export class AjaxClient {
  constructor() {
    this._ajaxRoot = 'http://localhost:8085';
    this._root = null;
  }
  _post(url, data) {
    return new Promise((resolve, reject) => {
      jQuery.ajax({
        type: 'POST',
        url,
        data,
        success: resolve,
      })
        .fail(reject);
    });
  }
  _get(url) {
    return new Promise((resolve, reject) => {
      jQuery.ajax({
        type: 'GET',
        url,
        success: resolve,
      }).fail(reject);
    });
  }
}
