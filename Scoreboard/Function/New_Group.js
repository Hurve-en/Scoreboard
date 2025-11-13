// Calls the button to add a new group
const newGroupButton = document.querySelector('.New_Group');

const scoreboardContainer = document.getElementById('scoreboard');
// Counts how many groups currently exists
let groupCount = 0; 


// keeps track of how many groups are there based on existing DOM or saved state
if(window.readStateFromDOM){
    const s = window.readStateFromDOM(); 
    if(s && typeof s.nextId === 'number') groupCount = Math.max(groupCount, s.nextId - 1);
}

const state = window.readStateFromDOM ? window.readStateFromDOM():null; 



// Adds a new group when the button is clicked 

newGroupButton.addEventListener('click', function() { 

    console.log('Button clicked! Current count: ',groupCount);
    groupCount++; 

    const newGroupHTML = `
    <div class="group_row" id="group-${groupCount}" data-group="${groupCount}">
        <p class="group-name" contenteditable="true">Group Name</p>

        <div class="group-score">

          <span id="score-${groupCount}"></span>
        </div>

         <div class="group_controls">
            <button type="button" class="score_btn_add" data-group="${groupCount}">+10</button>
            <button type="button" class="score_btn_minus" data-group="${groupCount}">-10</button>
            <button type="button" class="score_btn_reset" data-group="${groupCount}">Reset</button>
        </div>
        </div>
    `;

        // insert into the #groups container if present (rendered dynamically), otherwise fallback to scoreboard
        const target = document.getElementById('groups') || scoreboardContainer;
        target.insertAdjacentHTML('beforeend', newGroupHTML);

        // add a transient animation class to the newly created element so it fades/slides in
        const newEl = document.getElementById(`group-${groupCount}`);
        if (newEl) {
            // add the class that triggers the CSS animation
            newEl.classList.add('animate-enter');

            // remove the class after animation completes to keep DOM clean
            const removeClass = (ev) => {
                newEl.classList.remove('animate-enter');
                newEl.removeEventListener('animationend', removeClass);
            };
            newEl.addEventListener('animationend', removeClass);
        }

        // persist the new group
        if (window.readStateFromDOM && window.savestate) {
            window.savestate(window.readStateFromDOM());
        }
});