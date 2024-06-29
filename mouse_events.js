//If the unit is in a valid marker that is in use, by taping the unit container it forces a button recheck on mouseup/touchend
function tapUnit() {
	//Attemps to tap the selected unit to force a valid placement check
	try {
		const placerUnitCont = document.querySelector('.placerUnitCont');
		const event = new Event('mouseup', { bubbles: true, cancelable: true });
		placerUnitCont.dispatchEvent(event);
		return true;
	} catch (error) {
		return false;
	}
}

function simulateMouseEvent(element, eventName, clientX, clientY) {
	const event = new MouseEvent(eventName, {
		bubbles: true,
		cancelable: true,
		clientX: clientX,
		clientY: clientY
	});
	element.dispatchEvent(event);
}

function clickHoldAndScroll(element, deltaY, duration) {
	try {
		const rect = element.getBoundingClientRect();
		const clientX = rect.left + rect.width / 2;
		const clientY = rect.top + rect.height / 2;

		simulateMouseEvent(element, "mousedown", clientX, clientY);

		const interval = 10;
		const steps = Math.ceil(duration / interval);
		const stepSize = deltaY / steps;
		let cumulativeDeltaY = 0;
		let step = 0;
		const scrollInterval = setInterval(() => {
			if (step < steps) {
				cumulativeDeltaY += stepSize;
				simulateMouseEvent(element, "mousemove", clientX, clientY + cumulativeDeltaY);
				step++;
			} else {
				clearInterval(scrollInterval);
				simulateMouseEvent(element, "mouseup", clientX, clientY + cumulativeDeltaY);
			}
		}, interval);
	} catch (error) {
		console.log(error);
	}

}