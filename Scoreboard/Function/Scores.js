const scoreboard = document.getElementById('scoreboard'); 

// Stores current state of scoreboard locally
const STORAGE_KEY  = 'scoreboard_state';
// maximum characters allowed in a group name
const MAX_GROUP_NAME_LENGTH = 30;


// deletes the current stored data and clears the DOM
function clearData() 
{ 
  try { 
    localStorage.removeItem(STORAGE_KEY); 
  } catch(e){ 
    console.error('failed to clear storage', e);
  }

  const groupsEl = document.getElementById('groups') || document.getElementById('scoreboard');
  if(groupsEl) groupsEl.innerHTML = '';
}

// Loads the saved state from local storage
function loadstate(){
  try{ 
    const raw = localStorage.getItem(STORAGE_KEY); 
    if(!raw) return null; 

    return JSON.parse(raw); 
  } catch(e) { 
    console.warn('Could not parse scoreboard state', e); 
    return null;
  }
}

// Saves the current state to local storage
function savestate(state) { 
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // small debug log to confirm save
    try { console.debug('scoreboard saved', state); } catch (e){}
  }catch(e){
    console.error('Failed to save current state', e);
  }
}
// test

// Reads the current state from the DOM structure and converts it to a savable object
function readStateFromDOM() 
{
  const groupNodes = document.querySelectorAll('.group_row');
  const groups = [];
  let maxId = 0;

  groupNodes.forEach(node => {
    const id = Number(node.dataset.group) || 0;
    const nameEl = node.querySelector('.group-name');
    const scoreEl = node.querySelector('.group-score span');
    const score = Number(scoreEl ? scoreEl.textContent : 0) || 0;
    const name = nameEl ? nameEl.textContent.trim() : `Group ${id}`;
    groups.push({ id, name, score });
    if (id > maxId) maxId = id;
  });

  return { groups, nextId: maxId + 1 };
}

// Use a stable container for delegated click handling (groups or scoreboard or document)
const clickContainer = document.getElementById('groups') || scoreboard || document;
clickContainer.addEventListener('click', function(event) {
  const button = event.target;

  const groupNum = button.getAttribute && button.getAttribute('data-group');
  // if no data-group on the clicked element, ignore (other handlers will handle group-name edits)
  if (!groupNum) return;

  const scoreElement = document.getElementById(`score-${groupNum}`);
  if (!scoreElement) return;

  // reads text to value
  let currentScore = Number(scoreElement.textContent) || 0;

  if (button.classList.contains('btn-add')) {
    currentScore += 10;
    scoreElement.textContent = currentScore;
    // persist updated DOM
    savestate(readStateFromDOM());
  } else if (button.classList.contains('btn-minus')) {
    currentScore -= 10;
    scoreElement.textContent = currentScore;
    // persist updated DOM
    savestate(readStateFromDOM());
  } else if (button.classList.contains('btn-reset')) {
    scoreElement.textContent = 0;
    // persist updated DOM
    savestate(readStateFromDOM());
  }
});


// Allows name editing via an input field 
(function GroupNameEditing() { 
  const container = document.getElementById('groups') || document.getElementById('scoreboard');
  if(!container) return;
  container.addEventListener('click', (e) => {
    const clicked = e.target;

    const nameEl = clicked.closest('.group-name');
    if (!nameEl) return;

    if (nameEl.dataset.editing === 'true') return;
    nameEl.dataset.editing = 'true';

    // prevent other click handlers (score buttons) from firing while editing
    e.stopPropagation();

    const groupRow = nameEl.closest('.group_row');
    const groupId = groupRow ? groupRow.dataset.group : null;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'group-name-input';
    input.value = nameEl.textContent.trim();
    input.style.minWidth = '120px';

    function commitChange() {
      const newName = input.value.trim() || `Group ${groupId || ''}`;
      const newNameEl = document.createElement('p');
      newNameEl.className = 'group-name';
      newNameEl.textContent = newName;

      input.replaceWith(newNameEl);
      newNameEl.dataset.editing = 'false';

      if (typeof readStateFromDOM === 'function' && typeof savestate === 'function') {
        savestate(readStateFromDOM());
      }
    }

    // Cancel editing adn restore original state
    function cancelChange() {
      // restore original element
      nameEl.dataset.editing = 'false';
      input.replaceWith(nameEl);
    }

    // replace the name element with the input and focus
    nameEl.replaceWith(input);
    input.focus();
    input.select();

    // commit on blur or Enter, cancel on Escape
    input.addEventListener('blur', commitChange);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        input.blur();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        cancelChange();
      }
    });
  });
})

// expose helpers for other scripts (New_Group.js) and allow manual access
window.readStateFromDOM = readStateFromDOM;
window.savestate = savestate;
window.loadstate = loadstate;

// render groups into #groups container
function renderGroups(saved) {
  const container = document.getElementById('groups') || document.getElementById('scoreboard');
  if (!container) return;

  // build HTML for groups
  const html = (saved.groups || []).map(g => `
    <div class="group_row" id="group-${g.id}" data-group="${g.id}">
  <div class="group-name" contenteditable="true">${g.name}</div>
      <div class="group-score"><span id="score-${g.id}">${g.score}</span></div>
      <div class="group_controls">
        <button type="button" class="btn-add" data-group="${g.id}">+10</button>
        <button type="button" class="btn-minus" data-group="${g.id}">-10</button>
        <button type="button" class="btn-reset" data-group="${g.id}">Reset</button>
      </div>
    </div>
  `).join('');

  // If there is a dedicated #groups element, replace its content; otherwise insert before Add_Groups
  const groupsEl = document.getElementById('groups');
  if (groupsEl) {
    groupsEl.innerHTML = html;
  } else {
    // fallback: place into scoreboard
    container.innerHTML = html + container.innerHTML;
  }
}

// Enable direct inline editing via contentEditable on .group-name elements
(function EnableContentEditableNames() {
  const container = document.getElementById('groups') || document.getElementById('scoreboard');
  if (!container) return;

  // commit changes when a name element loses focus (focusout bubbles)
  container.addEventListener('focusout', (e) => {
    const nameEl = e.target.closest && e.target.closest('.group-name');
    if (!nameEl) return;

    // normalize whitespace and trim
    nameEl.textContent = nameEl.textContent.replace(/\s+/g, ' ').trim();

    if (typeof readStateFromDOM === 'function' && typeof savestate === 'function') {
      savestate(readStateFromDOM());
    }
  });

  // commit on Enter key inside editable element
  container.addEventListener('keydown', (e) => {
    const nameEl = e.target.closest && e.target.closest('.group-name');
    if (!nameEl) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      // move focus away to trigger focusout
      nameEl.blur();
    }
  });

  // enforce a maximum length as the user types (for contenteditable)
  container.addEventListener('input', (e) => {
    const nameEl = e.target.closest && e.target.closest('.group-name');
    if (!nameEl) return;
    const text = nameEl.textContent || '';
    if (text.length > MAX_GROUP_NAME_LENGTH) {
      const truncated = text.slice(0, MAX_GROUP_NAME_LENGTH);
      // set truncated text and restore caret to end
      nameEl.textContent = truncated;
      // place caret at end
      try {
        const range = document.createRange();
        range.selectNodeContents(nameEl);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        // ignore selection errors on older browsers
      }
    }
  });
})();

// initialize on page load: render saved groups and hook reset button
document.addEventListener('DOMContentLoaded', () => {
  const saved = loadstate();
  const resetBtn = document.getElementById('Reset_Button');
  if (resetBtn) resetBtn.addEventListener('click', clearData);
  if (!saved || !saved.groups) return;
  renderGroups(saved);
});

// Also bind reset button immediately in case this script runs after DOMContentLoaded
const _resetBtnImmediate = document.getElementById('Reset_Button');
