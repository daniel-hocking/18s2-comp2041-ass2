/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');


export function padNum(num, pad_by = 2, pad_with = '0') {
    return num.toString().padStart(pad_by, pad_with);
}

export function formatDate(date_in) {
    const date_ob = new Date(date_in);
    return `${padNum(date_ob.getHours())}:${padNum(date_ob.getMinutes())} ${padNum(date_ob.getDate())}/${padNum(date_ob.getMonth()+1)}/${date_ob.getFullYear()}`;
}

export function appendNodeTo(id_name, child_node) {
  document.getElementById(id_name).appendChild(child_node);
}

export function removeFrom(id_name, child_id) {
  const parent_node = document.getElementById(id_name);
  const child_node = document.getElementById(child_id);
  if(parent_node && child_node)
    parent_node.removeChild(child_node);
}

export function createAlert(message, parent_id, type = 'danger') {
  const parent_node = document.getElementById(parent_id);
  const new_node = createElement('div', message, { class: "alert alert-dismissible fade show alert-" + type, role: 'alert' });
  const dismiss_button = createElement('button', null, { class: 'close', type: 'button', 'data-dismiss': 'alert', 'aria-label': 'Close' });
  const dismiss_cross = createElement('span', '×', { 'aria-hidden': 'true' });
  dismiss_button.appendChild(dismiss_cross);
  new_node.appendChild(dismiss_button);
  parent_node.appendChild(new_node);
}

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}, child = null) {
    const el = document.createElement(tag);
    el.textContent = data;
    if(child)
      el.appendChild(child);
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}

export function createModal(title, body, footer = null) {
  const modal_outer = createElement('div', null, { class: 'modal fade', id: 'modal-popup',  role: 'dialog', 'aria-labelledby': 'modal-title', 'aria-hidden': 'true' });
  const modal_inner = createElement('div', null, { class: 'modal-dialog modal-dialog-centered', role: 'document' });
  const modal_content = createElement('div', null, { class: 'modal-content' });
  const modal_header = createElement('div', null, { class: 'modal-header' });
  const modal_heading = createElement('h5', title, { class: 'modal-title', id: 'modal-title' });
  const modal_button = createElement('button', null, { class: 'close', type: 'button', 'data-dismiss': 'modal', 'aria-label': 'Close' }, createElement('span', '×', { 'aria-hidden': 'true' }));
  
  const modal_body = createElement('div', null, { class: 'modal-header' }, body);
  
  modal_header.appendChild(modal_heading);
  modal_header.appendChild(modal_button);
  modal_content.appendChild(modal_header);
  modal_content.appendChild(modal_body);
  if(footer) {
    modal_content.appendChild(createElement('div', null, { class: 'modal-footer' }, footer));
  }
  
  modal_inner.appendChild(modal_content);
  modal_outer.appendChild(modal_inner);

  document.getElementById('main-section').appendChild(modal_outer);
  $('#modal-popup').modal();
  $('#modal-popup').on('hidden.bs.modal', function (e) {
    removeFrom('main-section', 'modal-popup');
  });
}

/* 
    Reminder about localStorage
    window.localStorage.setItem('AUTH_KEY', someKey);
    window.localStorage.getItem('AUTH_KEY');
    localStorage.clear()
*/
export function checkStore(key) {
    if (window.localStorage)
        return window.localStorage.getItem(key)
    else
        return null

}

export function clearStore(key) {
  if(window.localStorage) {
    window.localStorage.removeItem(key);
    return true;
  } else {
    return false;
  }
}

export function setStore(key, value) {
    if (window.localStorage)
        return window.localStorage.setItem(key, value)
    else
        return null

}
