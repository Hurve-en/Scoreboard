// Calls the button to add a new group
const newGroupButton = document.querySelector('.New_Group');

const scoreboardContainer = document.getElementById('scoreboard');
// Counts how many groups currently exists
let groupCount = 1; 


newGroupButton.addEventListener('click', function() { 

    console.log('Button clicked! Current count: ',groupCount);
    groupCount++; 

    const newGroupHTML = `
    <div class="group_row" id="group-${groupCount}" data-group="${groupCount}">
        <div class="group-name">Group-${groupCount}</div>

        <div class="group-score">

          <span id="score-${groupCount}">0</span>
        </div>

         <div class="group_controls">
            <button type="button" class="btn-add" data-group="${groupCount}">+10</button>
            <button type="button" class="btn-minus" data-group="${groupCount}">-1</button>
            <button type="button" class="btn-reset" data-group="${groupCount}">Reset</button>
        </div>
        </div>
    `;

    scoreboardContainer.insertAdjacentHTML('beforeend', newGroupHTML);
});