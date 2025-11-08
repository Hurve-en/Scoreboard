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

        // persist the new group
        if (window.readStateFromDOM && window.savestate) {
            window.savestate(window.readStateFromDOM());
        }
});