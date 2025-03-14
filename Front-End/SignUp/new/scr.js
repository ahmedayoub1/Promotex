
// Set vars.
const textDark = '#000000';
const textLight = '#ffffff';
let textDarkRatio;
let textLightRatio;
let highContrastText;
let canvas = document.createElement('canvas');
let context = canvas.getContext('2d');
canvas.height = 1;
canvas.width = 1;


/**
 * Convert byte to hex.
 *
 * Turns a number (0-255) into a 2-character hex number (00-ff).
 *
 * @param {type} byte number 0-255
 * @return {string} 2-character hex number
 */
function byteToHex(byte) {
    return ('0' + byte.toString(16)).slice(-2);
}

/**
 * Convert color to RGBA array.
 *
 * Turns any valid canvas fillStyle into a 4-element Uint8ClampedArray with bytes
 * for R, G, B, and A. Invalid styles will return [0, 0, 0, 0].
 *
 * Examples:
 * color_convert.toRgbaArray('red') = [255, 0, 0, 255]
 * color_convert.toRgbaArray('#ff0000') = [255, 0, 0, 255]
 * color_convert.toRgbaArray('garbagey') = [0, 0, 0, 0]
 *
 * @param {type} color Any valid canvas fillStyle.
 * @return {array} RGBA color array.
 */
function toRgbaArray(color) {
    context.fillStyle = 'rgba(0,0,0,0)';
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data;
}

/**
 * Convert color to RGBA string.
 *
 * Turns any valid canvas fill style into an rgba() string. Returns
 * 'rgba(0,0,0,0)' for invalid colors.
 *
 * Examples:
 * color_convert.toRgba('red') = 'rgba(255,0,0,1)'
 * color_convert.toRgba('#f00') = 'rgba(255,0,0,1)'
 * color_convert.toRgba('notacolor') = 'rgba(0,0,0,0)'
 *
 * @param {type} color A string, pattern, or gradient.
 * @return {string} A valid rgba color string
 */
function toRgba(color) {
    var a = toRgbaArray(color);
    return 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + (a[3] / 255) + ')';
}

/**
 * Convert color to 6 digit hex string.
 *
 * Turns any valid canvas fill style into an rgba() string. Returns
 * 'rgba(0,0,0,0)' for invalid colors.
 *
 * Examples:
 * color_convert.toHex('red') = '#ff0000'
 * color_convert.toHex('rgba(255,0,0,1)') = '#ff0000'
 * color_convert.toHex('notacolor') = '#000000'
 *
 * @param {type} color  A string, pattern, or gradient
 * @return {string} A valid rgba CSS color string
 */
function toHex(color) {
    var a = toRgbaArray(color);
    var hex = [0, 1, 2].map(function(i) {
        return byteToHex(a[i]);
    }).join('');

    return '#' + hex;
}

/**
 * Convert HEX to RGB Object.
 *
 * Accepts a 3 or 6 digit hex code, automatically strips
 * leading # tag and returns an RGB color object.
 *
 * Examples:
 * hexToRgb('000')      =  {r: 0, g: 0, b: 0}
 * hexToRgb('#ff0000')  =  {r: 255, g: 0, b: 0}
 *
 * @param {type} hex 3 or 6 digit hex code.
 * @return {object} RGB color object.
 *
 * Based on: https://stackoverflow.com/a/5624139/3695983
 */
function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Calculate relative luminance.
 *
 * Determines the relative luminance value of a color based on
 * the WCAG2 specification: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance.
 *
 * @param {type} r Value between 0 and 255
 * @param {type} g Value between 0 and 255
 * @param {type} b Value between 0 and 255
 * @return {number} Value between 0 and 1
 *
 * Based on: https://stackoverflow.com/a/9733420/3695983
 */
function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculate the contrast ratio between 2 colors.
 *
 * @param {type} color1 3 or 6 digit hex code
 * @param {type} color2 3 or 6 digit hex code
 * @return {number} Value between 0 and 1
 */
function calculateRatio(color1, color2) {
    const color1rgb = hexToRgb(color1);
    const color2rgb = hexToRgb(color2);

    // Get the relative luminance.
    const color1luminance = luminance(color1rgb.r, color1rgb.g, color1rgb.b);
    const color2luminance = luminance(color2rgb.r, color2rgb.g, color2rgb.b);

    // Calculate the color contrast ratio.
    const ratio = color1luminance > color2luminance
                ? ((color2luminance + 0.05) / (color1luminance + 0.05))
                : ((color1luminance + 0.05) / (color2luminance + 0.05));

    return ratio;
}

/**
 * Get highest contrast text color.
 *
 * Returns white or black text depending on which color
 * has a higher contrast ratio with the background color.
 *
 * @param {type} boxBackgroundColor A 3 or 6 digit hex code
 * @return {string} #000000 or #ffffff
 */
function getHigherContrastText(boxBackgroundColor) {
    textDarkRatio = calculateRatio(boxBackgroundColor, textDark);
    textLightRatio = calculateRatio(boxBackgroundColor, textLight);

    if (textDarkRatio > textLightRatio) {
        highContrastText = textLight;
    } else {
        highContrastText = textDark;
    }

    return highContrastText;
}



//DOM elements
const DOMstrings = {
    stepsBtnClass: 'multisteps-form__progress-btn',
    stepsBtns: document.querySelectorAll(`.multisteps-form__progress-btn`),
    stepsBar: document.querySelector('.multisteps-form__progress'),
    stepsForm: document.querySelector('.multisteps-form__form'),
    stepsFormTextareas: document.querySelectorAll('.multisteps-form__textarea'),
    stepFormPanelClass: 'multisteps-form__panel',
    stepFormPanels: document.querySelectorAll('.multisteps-form__panel'),
    stepPrevBtnClass: 'js-btn-prev',
    stepNextBtnClass: 'js-btn-next'
};


//remove class from a set of items
const removeClasses = (elemSet, className) => {
    elemSet.forEach(elem => {
        elem.classList.remove(className);
    });
};

//return exect parent node of the element
const findParent = (elem, parentClass) => {
    let currentNode = elem;
    while(! (currentNode.classList.contains(parentClass))) {
        currentNode = currentNode.parentNode;
    }
    return currentNode;
};

//get active button step number
const getActiveStep = elem => {
    return Array.from(DOMstrings.stepsBtns).indexOf(elem);
};

//set all steps before clicked (and clicked too) to active
const setActiveStep = (activeStepNum) => {

    //remove active state from all the state
    removeClasses(DOMstrings.stepsBtns, 'js-active');

    //set picked items to active
    DOMstrings.stepsBtns.forEach((elem, index) => {
        if(index <= (activeStepNum) ) {
            elem.classList.add('js-active');
        }
    });
};

//get active panel
const getActivePanel = () => {
    let activePanel;
    DOMstrings.stepFormPanels.forEach(elem => {
        if(elem.classList.contains('js-active')) {
            activePanel = elem;
        }
    });

    return activePanel;
};

//open active panel (and close unactive panels)
const setActivePanel = activePanelNum => {

    //remove active class from all the panels
    removeClasses(DOMstrings.stepFormPanels, 'js-active');

    //show active panel
    DOMstrings.stepFormPanels.forEach((elem, index) => {
        if(index === (activePanelNum)) {
            elem.classList.add('js-active');
            setFormHeight(elem);
        }
    })
};

//set form height equal to current panel height
const formHeight = (activePanel) => {
    const activePanelHeight = activePanel.offsetHeight;
    DOMstrings.stepsForm.style.height = `${activePanelHeight}px`;
};

const setFormHeight = () => {
    const activePanel = getActivePanel();
    formHeight(activePanel);
}

//STEPS BAR CLICK FUNCTION
DOMstrings.stepsBar.addEventListener('click', e => {

    //check if click target is a step button
    const eventTarget = e.target;
    if(!eventTarget.classList.contains(`${DOMstrings.stepsBtnClass}`)) {
        return;
    }

    //get active button step number
    const activeStep = getActiveStep(eventTarget);

    //set all steps before clicked (and clicked too) to active
    setActiveStep(activeStep);

    //open active panel
    setActivePanel(activeStep);
});

/**
 * Handle name setting.
 *
 * Watches the storeName input for changes and
 * updates the preview text as a user types.
 */
document.querySelector('#storeName').addEventListener('input', function() {
    let storeName = document.querySelector('#storeName').value;
    let storeNamePreview = document.querySelector("#preview-storeName");
    storeNamePreview.textContent = storeName;
});

/**
 * Handle color settings.
 *
 * Watches the storeColor inputs for changes and updates
 * an inline CSS variable when valid color is entered.
 */
document.querySelectorAll('.storeColor').forEach(function(color) {
    color.addEventListener('input', function() {
        let colorOption = color.id;
        let colorValue = color.value;
        let colorToHex = toHex(colorValue);
        let storePreviewColor = document.querySelector("#preview");

        if(colorOption == "storeColor1") {
            storePreviewColor.style.setProperty("--lmsco-preview-color1", colorToHex);
            storePreviewColor.style.setProperty("--lmsco-preview-text", getHigherContrastText(colorToHex));
        }
        if(colorOption == "storeColor2") {
            storePreviewColor.style.setProperty("--lmsco-preview-color2", colorToHex);
        }
    });
});



/**
 * Handle image settings.
 *
 * Watches the image inputs for changes
 * and loads the images into the preview.
 */
document.querySelectorAll('.preview-image').forEach(function(image) {
    let imageTarget = image.getAttribute('data-target');
    image.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            var img = document.querySelector("#"+imageTarget);
            img.src = URL.createObjectURL(this.files[0]);
            //img.onload = imageIsLoaded;
        }
    });
});

/**
 * Handle course layout setting.
 *
 * Watches the storeCourse input for changes
 * and updates the preview layout.
 */
document.querySelector('#storeCourse').addEventListener('change', function() {

    let courseLayout = document.querySelector('input[name=inlineRadioOptions]:checked').value;
    let storePreview = document.querySelector("#preview");

    if (courseLayout == "option1") {
        storePreview.classList.add("course-layout-list");
        storePreview.classList.remove("course-layout-grid");
    } else {
        storePreview.classList.add("course-layout-grid");
        storePreview.classList.remove("course-layout-list");
    }
});



/**
 * Handle PREV/NEXT buttons.
 *
 * Watches the buttons for clicks and
 * and sets the active panel and steps.
 */
DOMstrings.stepsForm.addEventListener('click', e => {
    const eventTarget = e.target;

    // Check if user clicked on `PREV` or NEXT` buttons.
    if(!((eventTarget.classList.contains(`${DOMstrings.stepPrevBtnClass}`)) || (eventTarget.classList.contains(`${DOMstrings.stepNextBtnClass}`)))) {
        return;
    }

    // Find the active panel.
    const activePanel = findParent(eventTarget, `${DOMstrings.stepFormPanelClass}`);
    let activePanelNum = Array.from(DOMstrings.stepFormPanels).indexOf(activePanel);

    // Set active panel and step onclick.
    if(eventTarget.classList.contains(`${DOMstrings.stepPrevBtnClass}`)) {
        activePanelNum--;
    } else {
        activePanelNum++;
    }
    setActiveStep(activePanelNum);
    setActivePanel(activePanelNum);
});

// Handle form height on load and resize.
['load', 'resize'].forEach(function(e) {
    window.addEventListener(e, setFormHeight, false);
});



// Component loading - removes the loading class from component when DOM is ready.
let lmscoStore = document.querySelector('.store-creation-wrap');
//console.log(lmscoStore);
lmscoStore.className.replace("lmsco-loading", "");