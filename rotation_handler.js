//Declaring style constants
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

let defaultStyles = `
-webkit-transform: translateY(calc(100% + 560px));
transform: translateY(calc(100% + 560px));
position: absolute;
height: calc(100% - 560px);
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

//Allow scrolling so some of the tables in the game can be scrolled
function setScroll() {
	let viewContainer = document.querySelector(".viewContainer");
	if (viewContainer) viewContainer.style.scrollY = "auto";
}

//Makes the unit drawer container usable during battle placement.
async function setUnitContainer() {

	//Get the container
	let container = document.querySelector(".unitSelCont");
	//If this element exists it means the container is open.
	let openedContainer = document.querySelector(".unitSelCont.unitSelOpen");
	//If this element exists it means the container is closed
	let closedContainer = document.querySelector(".unitSelCont.unitSelClosed");

	//Check if container has been opened by the user
	if (openedContainer && !closedContainer) {
		//Get container property
		const computedStyles = window.getComputedStyle(container);
		unset = computedStyles.getPropertyValue("transform");
		//If none returns, else change it
		if (unset === "none") return;
		await rotationDelay(5);
		container.style.cssText = unitContainerStyles;
	}
	//Container has been closed by the user
	else {
		closedContainer = document.querySelector(".unitSelCont.unitSelClosed");
		let unset;
		//Attempt to get the properties of the container
		try {
			const computedStyles = window.getComputedStyle(closedContainer);
			unset = computedStyles.getPropertyValue("transform");
		} catch (error) {
			return;
		}
		//Check container properties after closing container, if they match "none", reset to default values
		if (closedContainer && !openedContainer && unset === "none") container.style.cssText = defaultStyles;
	}
}

//An event listener for when the page loads 
window.addEventListener('load', async function () {
	let mainContainer = document.querySelector(".rotateMessageCont");
	if (mainContainer) hideContainer(mainContainer);
	setScroll();
});