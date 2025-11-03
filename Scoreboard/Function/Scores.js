const scoreboard = document.getElementById('scoreboard'); 


scoreboard.addEventListener('click',function(event) {
  const button = event.target; 


  const groupNum = button.getAttribute('data-group'); 

  if(!groupNum) return; 


  const scoreElement = document.getElementById(`score-` + groupNum);

  if(!scoreElement) return; 


  // reads text to value
  let currentScore = parseInt(scoreElement.textContent); 

  if(button.classList.contains('btn-add'))
  {
    currentScore += 10; 
    scoreElement.textContent = currentScore; 
  }

    if(button.classList.contains('btn-minus'))
  {
    currentScore -= 10; 
    scoreElement.textContent = currentScore; 
  }


    if(button.classList.contains('btn-reset'))
  {
    scoreElement.textContent = 0; 
  }
})