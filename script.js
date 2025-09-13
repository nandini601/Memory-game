const THEMES = {
  emoji: ['🍕','🎧','🎮','🚀','🌟','⚽','🐱','🍩','🍉','🎲','📚','💻','🖊️','🚗','✈️','🎵','🕹️','📷','🎬','🏆'],
  fruits: ['🍎','🍐','🍊','🍋','🍇','🍓','🍒','🍑','🥭','🍍','🥝','🍉'],
  animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵']
};

let deck=[], first=null, second=null, lock=false;
let moves=0, matches=0, timer=0, timerInt=null;
let gridSize=4, theme='emoji';

const board=document.getElementById('board');
const movesEl=document.getElementById('moves');
const timerEl=document.getElementById('timer');
const leaderboardBody=document.getElementById('leaderboard-body');

function init(){
  reset();
  buildDeck();
  renderBoard();
  startTimer();
}

function reset(){
  first=second=null; lock=false;
  moves=0; matches=0; timer=0;
  movesEl.textContent='0'; timerEl.textContent='00:00';
  clearInterval(timerInt);
}

function buildDeck(){
  const needed=(gridSize*gridSize)/2;
  let values=[...THEMES[theme]].slice(0,needed);
  deck=shuffle(values.concat(values)).map((v,i)=>({id:i,value:v,matched:false}));
}

function renderBoard(){
  board.innerHTML='';
  board.style.gridTemplateColumns=`repeat(${gridSize},1fr)`;
  deck.forEach((c,i)=>{
    const el=document.createElement('div'); el.className='card'; el.dataset.index=i;
    el.innerHTML=`
      <div class="card-inner">
        <div class="card-face card-front"></div>
        <div class="card-face card-back">${c.value}</div>
      </div>`;
    el.addEventListener('click',()=>onCardClick(el,i));
    board.appendChild(el);
  });
}

function onCardClick(el,i){
  if(lock||deck[i].matched||el.classList.contains('is-flipped')) return;
  flip(el);
  if(!first){ first={el,i}; return; }
  second={el,i}; moves++; movesEl.textContent=moves;
  lock=true;
  if(deck[first.i].value===deck[second.i].value){
    deck[first.i].matched=deck[second.i].matched=true;
    matches++;
    resetTurn();
    if(matches===deck.length/2){ gameOver(); }
  }else{
    setTimeout(()=>{ unflip(first.el); unflip(second.el); resetTurn(); },800);
  }
}

function flip(el){ el.classList.add('is-flipped'); }
function unflip(el){ el.classList.remove('is-flipped'); }
function resetTurn(){ [first,second]=[null,null]; lock=false; }

function startTimer(){
  timerInt=setInterval(()=>{ timer++; timerEl.textContent=format(timer); },1000);
}
function format(s){ let m=Math.floor(s/60); let sec=s%60; return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function gameOver(){
  clearInterval(timerInt);
  let stars=(moves<=gridSize*2)?3:(moves<=gridSize*3)?2:1;
  let bonus=Math.max(0,(gridSize*gridSize*5)-timer);
  alert(`🎉 You won!\nMoves: ${moves}\nTime: ${format(timer)}\nStars: ${stars}\nBonus: ${bonus}`);
  saveScore({level:gridSize,theme,time:timer,moves,stars});
  renderLeaderboard();
}

function saveScore(result){
  let key='memoryGameScores';
  let data=JSON.parse(localStorage.getItem(key))||[];
  let existing=data.find(d=>d.level===result.level && d.theme===result.theme);
  if(!existing || result.time<existing.time){
    if(existing){ existing.time=result.time; existing.moves=result.moves; existing.stars=result.stars; }
    else data.push(result);
  }
  localStorage.setItem(key,JSON.stringify(data));
}

function renderLeaderboard(){
  let key='memoryGameScores';
  let data=JSON.parse(localStorage.getItem(key))||[];
  leaderboardBody.innerHTML='';
  data.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${r.level}x${r.level}</td><td>${r.theme}</td><td>${format(r.time)}</td><td>${r.moves}</td><td>${r.stars}</td>`;
    leaderboardBody.appendChild(tr);
  });
}

document.getElementById('restart').onclick=init;
document.getElementById('level').onchange=e=>{ gridSize=+e.target.value; init(); };
document.getElementById('theme').onchange=e=>{ theme=e.target.value; init(); };

init();
renderLeaderboard();
