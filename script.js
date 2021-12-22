import Deck, { Card } from "./deck.js";

// HTML Handlers
const dealerCardSlot = document.querySelector(".computer-card-slot");
const playerCardSlot = document.querySelector(".player-card-slot");
const deckElement = document.querySelector(".deck");
const text = document.querySelector(".text");
let bet = document.getElementById("player-bet");
let credits = document.getElementById("player-credits");

// button Handlers
var btnStart = document.getElementById("blackjack-start-button");
var btnHit = document.getElementById("blackjack-hit-button");
var btnStand = document.getElementById("blackjack-stand-button");

btnHit.disabled = true;
btnStand.disabled = true;

let deck,
  playerBet,
  dealerHand = [],
  playerHand = [];

document.querySelectorAll(".edittable").forEach(function (node) {
  node.ondblclick = function () {
    var val = this.textContent;
    var input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("min", 2);
    input.setAttribute("max", +credits.textContent);
    input.setAttribute("step", 2);
    input.value = val;
    input.onblur = function () {
      var val = this.value;

      if (val >= +credits.textContent || val <= 0)
        text.textContent = "Please enter a valid bet.";

      this.parentNode.textContent = val;
    };
    this.textContent = "";
    this.appendChild(input);
    input.focus();
  };
});

function displayCards(cardSlot) {
  var cards = document.getElementsByClassName("card"),
    cw = cardSlot.clientWidth,
    sw = cardSlot.scrollWidth,
    diff = sw - cw,
    offset = diff / (cards.length - 1);

  for (var i = 1; i < cards.length; i++) {
    cards[i].style.transform = "translateX(-" + offset * i + "px)";
  }
}

// REMOVE BEFORE DEPLOYMENT
function clgHands() {
  console.clear();
  console.table(dealerHand);
  console.table(playerHand);
  console.log(
    `D:${points(dealerHand)} P:${points(playerHand)}
${deck.cards[0].value} ${deck.cards[1].value} ${deck.cards[2].value}`
  );
}

function points(handArray) {
  var totalHandValue = 0;
  var aceCounter = 0;

  // loop through player or dealer hand and add up the values
  var index = 0;
  while (index < handArray.length) {
    var currentCard = handArray[index];

    totalHandValue += +currentCard.value
      ? +currentCard.value
      : currentCard.value == "A"
      ? 1
      : 10;

    if (currentCard.value == "A") {
      totalHandValue += 10;
      aceCounter += 1;
    }

    index += 1;
  }

  index = 0;
  while (index < aceCounter) {
    if (totalHandValue > 21) {
      totalHandValue = totalHandValue - 10;
    }
    index += 1;
  }

  return totalHandValue;
}

function addCredits(multiplier) {
  credits.textContent = +credits.textContent + playerBet * multiplier;
}

function dealerFinish(addCards) {
  let flippedCard = document.querySelector(".flip");
  let playerPoints = points(playerHand);

  console.log("Invoked dealerFinish()<br>");
  // dealer reveal flipped card
  flippedCard.classList.remove("flip");
  flippedCard.classList.remove("deck");
  flippedCard.classList.add("card");

  // dealer bj
  if (points(dealerHand) === 21 && dealerHand.length === 2) {
    //player also bj
    if (playerPoints === 21 && playerHand.length === 2) {
      text.textContent = "Blackjack push!";
      addCredits(1);
    } else text.textContent = "Dealer has blackjack!";
  } //player bj
  else if (playerPoints === 21 && playerHand.length === 2) {
    text.textContent = "You got blackjack!";
    addCredits(2.5);
  } //no bj
  else {
    // if player bust
    if (playerPoints > 21) text.textContent = "You bust!";
    else {
      // dealer hits till 17
      while (
        points(dealerHand) < 17 &&
        points(dealerHand) < playerPoints &&
        addCards === true
      ) {
        dealerHand.push(deck.pop());
        dealerCardSlot.appendChild(dealerHand[dealerHand.length - 1].getHTML());
      }
      // if dealer bust
      if (points(dealerHand) > 21) {
        text.textContent = "Dealer bust!";
        addCredits(2);
      } else {
        if (playerPoints === points(dealerHand)) {
          text.textContent = "You push!";
          addCredits(1);
        } else if (playerPoints > points(dealerHand)) {
          text.textContent = "You win!";
          addCredits(2);
        } else text.textContent = "You lose!";
      }
    }
  }

  // update deck count
  deckElement.textContent = deck.numberOfCards;

  enableBtnStart();
}

function enableBtnStart(message) {
  if (message) text.textContent = message;

  // enable start button
  btnStart.disabled = false;
  btnHit.disabled = true;
  btnStand.disabled = true;
}

btnStart.addEventListener("click", function () {
  deck = new Deck();
  deck.shuffle();

  // clean before round
  playerHand = [];
  dealerHand = [];
  dealerCardSlot.textContent = "";
  playerCardSlot.textContent = "";
  text.textContent = "Hit/Stand";
  console.clear();

  if (+bet.textContent >= +credits.textContent || +bet.textContent <= 0) {
    text.textContent = "Please enter a valid bet.";
    return;
  }

  // place bet
  playerBet = +bet.textContent;
  addCredits(-1);

  // REMOVE BEFORE DEPLOYMENT
  let bj = [new Card("☠", "A"), new Card("#", "K"), new Card("#", "Q")];

  // playerHand.push(bj[0]);
  // playerHand.push(bj[1]);
  // dealerHand.push(bj[0]);
  // dealerHand.push(bj[2]);

  // initial deal
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());
  playerHand.push(deck.pop());
  dealerHand.push(deck.pop());

  // update html
  playerHand.forEach((card) => playerCardSlot.appendChild(card.getHTML()));
  dealerCardSlot.appendChild(dealerHand[0].getHTML());
  dealerCardSlot.appendChild(dealerHand[1].getHTMLflipped());

  // update deck count
  deckElement.textContent = deck.numberOfCards;

  // if player bj, check if dealer bj
  if (points(playerHand) === 21) {
    if (points(dealerHand) === 21) dealerFinish(false);
    else {
      dealerFinish(false);
    }
  } else {
    // activate hit/stand buttons
    btnStart.disabled = true;
    btnHit.disabled = false;
    btnStand.disabled = false;
  }

  clgHands();
});

btnHit.addEventListener("click", function () {
  // check if >= 21 points
  if (points(playerHand) < 21) {
    playerHand.push(deck.pop());
    playerCardSlot.appendChild(playerHand[playerHand.length - 1].getHTML());
    displayCards(playerCardSlot);
    deckElement.textContent = deck.numberOfCards;

    points(playerHand) < 21
      ? (text.textContent = "Stand or you bust")
      : points(playerHand) === 21
      ? dealerFinish(true)
      : dealerFinish(false);
  }

  clgHands();
});

// button active only when player has <21 points
btnStand.addEventListener("click", function () {
  dealerFinish(true);

  clgHands();
});
