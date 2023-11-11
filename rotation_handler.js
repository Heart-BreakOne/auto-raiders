//Declaring style constant
const rotateMessageCont = `
    position: absolute;
    width: 0;
    height: 0;
    z-index: 0;
    display: none;
    background-color: transparent;
`;

let unitContainerStyles = `
-webkit-transform: unset;
transform: unset;
position: relative;
height: inherit;
`;
let rotationDelay = ms => new Promise(res => setTimeout(res, ms));
let unset;

//Make rotate warning and children invisible
function hideContainer(mainContainer) {
  mainContainer.style.cssText = rotateMessageCont;
  let children = mainContainer.children;
  for (let i = 0; i < children.length; i++) {
    children[i].style.cssText = rotateMessageCont;
  }
}

function setScroll() {
  let viewContainer = document.querySelector(".viewContainer");
  if (viewContainer) {
    viewContainer.style.scrollY = "auto";
  }
}

let defaultStyles = `
-webkit-transform: translateY(calc(100% + 560px));
transform: translateY(calc(100% + 560px));
position: absolute;
height: calc(100% - 560px);
`;


async function setUnitContainer() {
  let container = document.querySelector(".unitSelCont");
  let openedContainer = document.querySelector(".unitSelCont.unitSelOpen");
  let closedContainer = document.querySelector(".unitSelCont.unitSelClosed");
  if (openedContainer && !closedContainer) {
      const computedStyles = window.getComputedStyle(container);
      unset = computedStyles.getPropertyValue("transform");
    if (unset === "none") {
      return;
    }
    await rotationDelay(5);
    container.style.cssText = unitContainerStyles;
  } else {
    closedContainer = document.querySelector(".unitSelCont.unitSelClosed");
    let unset;
    try {
      const computedStyles = window.getComputedStyle(closedContainer);
      unset = computedStyles.getPropertyValue("transform");
    } catch (error) {
      return
    }
    if (closedContainer && !openedContainer && unset === "none") {
      container.style.cssText = defaultStyles;
    }
  }
}

//An event listener for when the page loads 
window.addEventListener('load', async function () {
  let mainContainer = document.querySelector(".rotateMessageCont");
  if (mainContainer) {
    hideContainer(mainContainer);
  }
  setScroll();

});