const devices_sizes = [
    {
        name: 'iphone_15_pro',
        width: 393,
        height: 852,
        // width: 590,
        // height: 1278,
        DPR: 3,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'iphone_15_plus',
        width: 430,
        height: 932,
        DPR: 3,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'iphone_14',
        width: 390,
        height: 844,
        DPR: 3,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'iphone_se',
        width: 375,
        height: 667,
        DPR: 2,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'pixel',
        width: 412,
        height: 915,
        DPR: 2.625,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'galaxy_s23',
        width: 360,
        height: 780,
        DPR: 3,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'galaxy_s23_ultra',
        width: 412,
        height: 915,
        DPR: 3,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'galaxy_z_flip',
        width: 412,
        height: 1004,
        DPR: 3,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'ipad',
        width: 768,
        height: 1024,
        DPR: 2,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'ipad_pro_11',
        width: 834,
        height: 1194,
        DPR: 2,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'ipad_pro_12',
        width: 1024,
        height: 1366,
        DPR: 2,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'galaxy_tab_s9',
        width: 800,
        height: 1280,
        DPR: 2,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'desktop_1280',
        width: 1280,
        height: 800,
        DPR: 1,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'desktop_1366',
        width: 1366,
        height: 768,
        DPR: 1,
        size: 200,
        top: 50,
        left: 100
    },
    {
        name: 'desktop_1440',
        width: 1440,
        height: 900,
        DPR: 1,
        size: 200,
        top: 50,
        left: 100
    }
]

const filesdata = []
const files = []
let closing = false

// this variable is very important , it's used to not to be writting in the same time
// but it's only for resize_elements function
let calling = null

// devises names to switch with
const current_devices = []
var current_device = devices_sizes[0]
var device_index = 0

// add/delete elements
var dragging = false
var dragged_element = null
var icon_calss = null
const icons_data = []
const elements = []
let elements_properties_and_style = []
let overall_style = true
let fileTitele = null

let the_target = null

// Copy/Paste system
let copiedElementData = null

// Undo/Redo system
const undoStack = []
const redoStack = []
const MAX_HISTORY = 50 // Limit stack size to prevent memory issues

// Track if we're currently applying history (prevent recursive saves)
let applyingHistory = false

let currentZoomLevel = 1.0
const ZOOM_STEP = 0.01

init()
const theIcons = document.getElementsByClassName('icon-item')
for (let i = 0; i < theIcons.length; i++) {
    icons_data.push(theIcons[i])
}

disabling()

const area_father = document.getElementById('area_father')

// Only zoom when scrolling over the design area
let lastWheelTime = 0
let wheelDeltaAccumulator = 0

area_father.addEventListener('wheel', (e) => {
    const now = Date.now()
    const timeDiff = now - lastWheelTime
    lastWheelTime = now

    // Reset accumulator if too much time passed (separate gesture)
    if (timeDiff > 100) {
        wheelDeltaAccumulator = 0
    }

    wheelDeltaAccumulator += Math.abs(e.deltaY)

    // Pinch gestures:
    // - Have ctrlKey set by browser
    // - Have small, continuous deltaY values (< 50)
    // - Have decimal values
    // - Happen in quick succession

    const isPinch =
        e.ctrlKey ||
        (Math.abs(e.deltaY) < 50 && timeDiff < 50 && e.deltaY % 1 !== 0)

    if (isPinch) {
        e.preventDefault()
        e.stopPropagation()
        handleZoomWheel(e)
    }
    // Otherwise it's normal two-finger scroll - allow default behavior
}, { passive: false })

// Allow normal scrolling elsewhere
const mainarea = document.getElementById('mainarea')
mainarea.addEventListener('click', de_click)

// get ratio of the device when you first open the file
current_devices.push(devices_sizes[0].name)
changeing_main_devise_size(devices_sizes[0], 0)

// _aing device functionality [Operation 3]
const add_device = document.getElementById('add_device')
add_device.addEventListener('change', create_device_size)

// add delete elments
const design_page = document.getElementById('design_page')
design_page.addEventListener('dragover', (e) => e.preventDefault())
design_page.addEventListener('drop', make_element)
const widgets = document.getElementsByClassName('widget-item')
for (let i = 0; i < widgets.length; i++) {
    widgets[i].addEventListener('dragstart', startdraging)
    widgets[i].addEventListener('dragend', enddraging)
}
const trash = document.getElementById('Delete')
trash.addEventListener('click', () => Delete(the_target, false))
// change propereties and style
const components = document.getElementsByClassName('Uiexpert_style')
for (let i = 0; i < components.length; i++) {
    if (components[i].nodeName == 'INPUT') {
        if (components[i].type == 'checkbox')
            components[i].addEventListener('change', (e) => {
                the_target_changing(components[i].id, e.target.checked)
            })
        else
            components[i].addEventListener('change', () => the_target_changing(components[i].id, components[i].value))

    }
    else
        components[i].addEventListener('change', () => the_target_changing(components[i].id, components[i].value))
}
const fast_css_elements = document.getElementsByClassName('fast_css')
for (let i = 0; i < fast_css_elements.length; i++) {
    if (fast_css_elements[i].id == 'font_family2' || fast_css_elements[i].id == 'font_size2'
        || fast_css_elements[i].id == 'font_color2' || fast_css_elements[i].id == 'background_color2')
        fast_css_elements[i].addEventListener('change', upper_css)
    else
        fast_css_elements[i].addEventListener('click', upper_css)
}

// icons
const icons = document.getElementById('icons')
icons.addEventListener('click', showIcons)

const iconSearch = document.getElementById('iconSearch')
iconSearch.addEventListener('keyup', search_for_icons)

const iconitem = document.getElementsByClassName('icon-item')
for (let i = 0; i < iconitem.length; i++) {
    iconitem[i].removeAttribute('title')
    iconitem[i].addEventListener('dragstart', startdraging_icon)
    iconitem[i].addEventListener('dragend', enddraging_icon)
}



//code
const code = document.getElementById('code')
code.onclick = () => {
    const result = generateCode()
    localStorage.setItem('UIExpertcode', result)
    window.open('/code', '_blank', 'noopener,noreferrer');
}

// analyze
const analyze = document.getElementById('analyze')
analyze.onclick = async () => {
    try {
        const results = await axe.run(design_page)
        // Convert the results object to a JSON string before storing
        localStorage.setItem('UIExpertanalyze', JSON.stringify(results))
        window.open('/analyze', '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('Accessibility analysis failed:', error)
        alert('Failed to run accessibility analysis. Please try again.')
    }
}

// ctrl+c ctrl+v, ctrl+z ctrl+y
// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', async (e) => {
    // Ctrl+C or Cmd+C - Copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
        // Only if not typing in an input
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault()
            copyElement()
        }
    }

    // Ctrl+V or Cmd+V - Paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey) {
        if (document.activeElement.tagName !== 'INPUT' &&
            document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault()
            pasteElement()
        }
    }

    // Ctrl+Z or Cmd+Z - Undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
    }

    // Ctrl+Y or Cmd+Shift+Z - Redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
    }
})


//                                      functions

// initializer
function init() {
    elements_properties_and_style = [
        {
            "elements": []
        },
        [
            {
                "device": {
                    "name": "iphone_15_pro",
                    "width": 393,
                    "height": 852,
                    "DPR": 3,
                    "size": 200,
                    "top": 50,
                    "left": 100
                },
                "children": []
            }
        ]
    ]
    const id = "iphone_15_pro"
    const devices_area = document.getElementById('devices_area')

    const father = document.createElement('div')
    father.setAttribute('class', 'device active')
    father.addEventListener('click', swap_device)

    const x = document.createElement('spane')
    x.setAttribute('class', 'device-name')
    x.setAttribute('id', `${id}`)
    x.textContent = id

    const remove = document.createElement('button')
    remove.setAttribute('class', 'close-device')
    remove.setAttribute('id', `close_device${Math.random()}`)
    remove.addEventListener('click', remove_a_device)

    const icon = document.createElement('i')
    icon.setAttribute('id', `delete_icon${Math.random()}`)
    icon.setAttribute('class', 'fas fa-times')

    devices_area.appendChild(father)
    father.appendChild(x)
    father.appendChild(remove)
    remove.appendChild(icon)

    current_devices.push(id)

}

async function loadDesign() {
    // 1 - creating elements (Multi-pass Loading to resolve parent dependencies)
    // Fix Issue #18: Children created before parents caused crash.
    let pendingElements = [...elements_properties_and_style[0].elements]
    let loadedCount = 0
    let lastLoadedCount = -1

    while (pendingElements.length > 0 && loadedCount !== lastLoadedCount) {
        lastLoadedCount = loadedCount
        const nextPending = []

        for (let i = 0; i < pendingElements.length; i++) {
            const elData = pendingElements[i]
            const parent = document.getElementById(elData.parentID)

            // Check if parent exists in DOM (e.g. design_page or previously loaded element)
            if (parent) {
                let k = elData.kind
                let element_to_add
                if (k == 'div' || k == 'h1' || k == 'label' || k == 'button' || k == 'a' || k == 'p' || k == 'img' || k == 'video' || k == 'audio' || k == 'i') {
                    element_to_add = document.createElement(`${k}`)
                } else {
                    element_to_add = document.createElement(`input`)
                    element_to_add.type = k
                }
                if (k == 'div') {
                    // we can drop another elements on it
                    element_to_add.addEventListener('dragover', (e) => {
                        e.preventDefault()
                        e.stopPropagation();
                    })
                    element_to_add.addEventListener('drop', make_element)

                }
                if (k == 'label')
                    element_to_add.addEventListener('click', (e) => e.preventDefault())
                elements[elements.length] = element_to_add
                // enable spesific prpereties and styling
                element_to_add.addEventListener('click', enable)


                element_to_add.id = elData.properties.id
                parent.appendChild(element_to_add)
                the_target = document.getElementById(element_to_add.id)
                // Bug #1 Fix: Removed duplicate appendChild
                add_moveable({
                    "type": "add",
                    "id": element_to_add.id,
                    elements_properties_and_style: elements_properties_and_style
                })
                // Apply properties
                for (const key in elData.properties) {
                    if (key == 'textContent')
                        element_to_add.textContent = elData.properties[key]
                    else if (key == 'class') {
                        if (k == 'i')
                            element_to_add.className = `${elData.properties[key]}`
                        else
                            element_to_add.classList.add(elData.properties[key])
                    }
                    else if (elData.properties[key] == false) {
                        delete elData.properties[key]
                    }
                    else
                        element_to_add.setAttribute(`${key}`, `${elData.properties[key]}`)
                }
                loadedCount++
            } else {
                nextPending.push(elData)
            }
        }
        pendingElements = nextPending
    }

    if (pendingElements.length > 0) {
        console.error("Critical: Some elements could not be loaded due to missing parents:", pendingElements)
    }

    // 2 - creating device sizes
    const first_device_size = elements_properties_and_style[1][0].device.name
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        const id = elements_properties_and_style[1][i].device.name
        const devices_area = document.getElementById('devices_area')


        const father = document.createElement('div')
        father.setAttribute('class', 'device')
        father.addEventListener('click', swap_device)

        const x = document.createElement('spane')
        x.setAttribute('class', 'device-name')
        x.setAttribute('id', `${id}`)
        x.textContent = id

        const remove = document.createElement('button')
        remove.setAttribute('class', 'close-device')
        remove.setAttribute('id', `close_device${Math.random()}`)
        remove.addEventListener('click', remove_a_device)

        const icon = document.createElement('i')
        icon.setAttribute('id', `delete_icon${Math.random()}`)
        icon.setAttribute('class', 'fas fa-times')

        devices_area.appendChild(father)
        father.appendChild(x)
        father.appendChild(remove)
        remove.appendChild(icon)

        current_devices.push(id)
    }

    // 3 - clicking the first device size
    document.getElementById(`${first_device_size}`).click()
}

// createing device size
function create_device_size(e) {
    console.log('function name is ' + ' create_device_size')

    const device_size = document.getElementById(`${e.target.value}`)
    if (device_size) {
        swap_device(false, device_size.id)
        return
    }
    const id = e.target.value
    const devices_area = document.getElementById('devices_area')

    const father = document.createElement('div')
    father.setAttribute('class', 'device active')
    father.addEventListener('click', swap_device)

    const x = document.createElement('spane')
    x.setAttribute('class', 'device-name')
    x.setAttribute('id', `${id}`)
    x.textContent = id

    const remove = document.createElement('button')
    remove.setAttribute('class', 'close-device')
    remove.setAttribute('id', `close_device${Math.random()}`)
    remove.addEventListener('click', remove_a_device)

    const icon = document.createElement('i')
    icon.setAttribute('id', `delete_icon${Math.random()}`)
    icon.setAttribute('class', 'fas fa-times')

    devices_area.appendChild(father)
    father.appendChild(x)
    father.appendChild(remove)
    remove.appendChild(icon)

    current_devices.push(id)

    for (var i = 0; i < devices_sizes.length; i++)
        if (devices_sizes[i].name == id) {
            current_device = devices_sizes[i]
            device_index = i
            let distance = 10000
            let most_near_device_index = 0
            for (let j = 0; j < elements_properties_and_style[1].length; j++) {
                let new_distance = Math.abs(elements_properties_and_style[1][j].device.width - current_device.width)
                if (new_distance < distance) {
                    distance = new_distance
                    most_near_device_index = j
                }
            }

            // DEEP CLONE THE CHILDREN ARRAY
            const clonedChildren = elements_properties_and_style[1][most_near_device_index].children.map(child => ({
                id: child.id,
                style: { ...child.style } // Create new style object
            }))

            elements_properties_and_style[1].push({
                "device": current_device,
                "children": clonedChildren
            })
            device_index = i
            break
        }

    var device_data = swap_device(false, id)
    return device_data
}

// removing a device
function remove_a_device(e) {
    console.log('function name is ' + ' remove_a_device')
    const devices_area = document.getElementById('devices_area')
    if (devices_area.children.length == 1) return
    // just remove it from the interface but do not delete the file's data
    let element
    if (e.target.id.includes('delete_icon'))
        element = document.getElementById(e.target.id).parentNode
    else
        element = document.getElementById(e.target.id)
    const parent = element.parentNode
    for (var i = 0; i < current_devices.length; i++) {
        if (current_devices[i] == parent.children[0].id) {
            current_devices.splice(i, 1)
        }
    }
    if (current_devices[0] == parent.children[0].id)
        swap_device(false, current_devices[1].toString())
    else
        swap_device(false, current_devices[0].toString())
    devices_area.removeChild(parent)
    for (var i = 0; i < devices_sizes.length; i++)
        if (devices_sizes[i].name == current_devices[0]) {
            current_device = devices_sizes[i]
            device_index = i
            break
        }

    console.log(current_devices)

}

// swap between devices
function swap_device(e, id) {
    console.log('function name is ' + ' swap_device')

    if (id == undefined) {
        var class_name = e.target.getAttribute('class')
        if (class_name != 'device-name' && class_name != 'device' && class_name != 'devise active') return
        // if not out continue
        if (class_name == 'device-name')
            id = e.target.id
        else {
            id = e.target.children[0].id
        }
    }
    else {
        var class_name = document.getElementById(`${id}`).getAttribute('class')
        if (class_name != 'device-name' && class_name != 'device' && class_name != 'devise active') return
    }
    const device_name = document.getElementsByClassName('device-name')
    for (var i = 0; i < device_name.length; i++) {
        if (device_name[i].id == id) {
            device_name[i].parentNode.setAttribute('class', "device active")
            add_device.value = id
        }
        else {
            device_name[i].parentNode.setAttribute('class', "device")
        }
    }
    // find the device in the list
    for (var i = 0; i < devices_sizes.length; i++) {
        if (devices_sizes[i].name == id) {
            changeing_main_devise_size(devices_sizes[i], i)
            return
        }
    }
}

// changeing the work area size
// changeing_main_devise_size - Apply styles from storage
function changeing_main_devise_size(device_data, index) {
    console.log('function name is ' + ' changeing_main_devise_size')

    current_device = device_data
    device_index = index

    const design_page = document.getElementById('design_page')
    design_page.style.width = `${device_data.width}px`
    design_page.style.height = `${device_data.height}px`
    design_page.style.top = devices_sizes[index].top + 'px'
    design_page.style.left = devices_sizes[index].left + 'px'

    // Reset zoom to 100% when switching devices
    currentZoomLevel = 1.0
    design_page.style.transform = `scale(${currentZoomLevel})`
    design_page.style.transformOrigin = `top left`

    // Apply styles for current device
    let temp = the_target
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        if (elements_properties_and_style[1][i].device.name == current_device.name) {
            for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++) {
                the_target = document.getElementById(`${elements_properties_and_style[1][i].children[j].id}`)
                if (!the_target) continue

                // Apply each style property
                const styleObj = elements_properties_and_style[1][i].children[j].style
                if (styleObj.borderWidth && styleObj.borderStyle) {
                    const borderColor = styleObj.borderColor || '#000000'
                    const borderWidth = parseFloat(styleObj.borderWidth) || 0
                    the_target.style.border = `${borderWidth}px ${styleObj.borderStyle} ${borderColor}`
                }
                for (const key in styleObj) {
                    if (key == 'borderWidth' || key == 'borderStyle' || key == 'borderColor') continue
                    // Skip shadow components - we'll handle them as composite
                    if (key.startsWith('shadow') || key.startsWith('textShadow')) continue
                    applyStyleToElement(key, styleObj[key])
                }

                // Fix Issue #1: Reconstruct box-shadow from component values
                if (styleObj.shadowX !== undefined || styleObj.shadowY !== undefined ||
                    styleObj.shadowBlur !== undefined || styleObj.shadowColor) {
                    const parts = []
                    if (styleObj.shadowInset === true || styleObj.shadowInset === 'true') {
                        parts.push('inset')
                    }
                    parts.push(`${styleObj.shadowX || 0}px`)
                    parts.push(`${styleObj.shadowY || 0}px`)
                    parts.push(`${styleObj.shadowBlur || 0}px`)

                    let color = styleObj.shadowColor || '#000000'
                    if (styleObj.shadowOpacity !== undefined && styleObj.shadowOpacity < 1) {
                        color = hexToRgba(color, styleObj.shadowOpacity)
                    }
                    parts.push(color)

                    the_target.style.boxShadow = parts.join(' ')
                }

                // Fix Issue #1: Reconstruct text-shadow from component values
                if (styleObj.textShadowX !== undefined || styleObj.textShadowY !== undefined ||
                    styleObj.textShadowBlur !== undefined || styleObj.textShadowColor) {
                    const textParts = [
                        `${styleObj.textShadowX || 0}px`,
                        `${styleObj.textShadowY || 0}px`,
                        `${styleObj.textShadowBlur || 0}px`,
                        styleObj.textShadowColor || '#000000'
                    ]
                    the_target.style.textShadow = textParts.join(' ')
                }
            }
            break
        }
    }
    the_target = temp

}

/* ************************************************************** 
the end of the devices names area function
*/


/* ************************************************************** 
These functions are for adding Elemens/Icons and deleting them
*/

async function make_element(e) {
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length == 1) {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith("image/")) {
            // creating the image
            const element = document.createElement('img')
            e.target.appendChild(element)
            // id
            var index = 1
            for (var i = 0; i < elements.length; i++)
                if (elements[i].id.includes('built-it img')) index++
            element.id = `built-it img${index}`
            const reader = new FileReader()
            reader.onload = function (event) {
                element.src = event.target.result
            }
            reader.readAsDataURL(file)
            // add the element to the array
            elements[elements.length] = element

            // enable spesific prpereties and styling
            element.addEventListener('click', enable)
            the_target = document.getElementById(element.id)

            if (element.parentNode.id.includes('built-it')) {
                for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
                    if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                        // Bug #2 Fix: Add null check for thechildern
                        if (elements_properties_and_style[0].elements[i].thechildern)
                            elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                        else
                            elements_properties_and_style[0].elements[i].thechildern = [element.id]
                        break
                    }
                }
            }

            //  top left height and width
            element.style.position = 'absolute'
            // top and left
            element.style.top = e.offsetY - 50 + 'px'
            element.style.left = e.offsetX - 50 + 'px'

            add_moveable({
                "type": "add",
                "id": element.id,
                elements_properties_and_style: elements_properties_and_style
            })

            elements_properties_and_style[0].elements.push({
                "parentID": element.parentNode.id,
                "kind": 'img',
                "properties": {
                    'id': element.id,
                    'src': element.src
                }
            })
            for (let i = 0; i < elements_properties_and_style[1].length; i++) {
                elements_properties_and_style[1][i].children.push({
                    id: element.id,
                    style: {
                        'position': element.style.position,
                        'top': parseFloat(element.style.top),
                        'left': parseFloat(element.style.left),
                        'width': parseFloat(element.style.width),
                        'height': parseFloat(element.style.height),
                        'backgroundColor': element.style.backgroundColor
                    }
                })
            }



        }
    }
    if (!dragging || !e.isTrusted) return
    switch (dragged_element) {
        case 'Div':
            createDiv(e)
            break;
        case 'Label':
            createLabel(e)
            break;
        case 'Button':
            createButton(e)
            break;
        case 'Text Field':
            createTextbox(e)
            break;
        case 'Text Area':
            createTextArea(e)
            break;
        case 'Checkbox':
            createCheckbox(e)
            break;
        case 'Radio':
            createRadio(e)
            break;
        case 'Select':
            createSelect(e)
            break;
        case 'Date Input':
            createDateInput(e)
            break;
        case 'Heading':
            createHeading(e)
            break;
        case 'Paragraph':
            createParagraph(e)
            break;
        case 'Image':
            createimage(e)
            break;
        case 'Video':
            createVideo(e)
            break;
        case 'Audio':
            createAudio(e)
            break;
        case 'link':
            createLink(e)
            break;
        case 'icon':
            createIcon(e)
            break;
    }
}
function makeOption(e) {
    if (!dragging || !e.isTrusted) return
    e.stopPropagation()
    if (dragged_element == 'Option') createOption(e)
}
function startdraging(e) {
    dragging = true
    dragged_element = e.target.children[1].textContent
}
function enddraging(e) {
    dragging = false
    dragged_element = null
}
function startdraging_icon(e) {
    dragging = true
    dragged_element = 'icon'
    icon_calss = e.target.getAttribute('data-icon')
}
function enddraging_icon() {
    dragging = false
    dragged_element = null
    icon_calss = null
}


async function createDiv(e) {
    const element = document.createElement('div')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it div')) index++
    element.id = `built-it div${index}`

    // add the element to the array
    elements[elements.length] = element

    // we can drop another elements on it
    element.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation();
    })
    element.addEventListener('drop', make_element)

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    // background color    
    element.style.backgroundColor = '#c6c6c6ff'

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '100px'
    // ***


    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'div',
        "properties": {
            'id': element.id
        },
        "thechildern": []
    })

    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor
            }
        })
    }

    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })
    saveToHistory('create_element', element.id)

}
async function createHeading(e) {
    const element = document.createElement('h1')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it h1')) index++
    element.id = `built-it h1${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    // background color    
    element.style.backgroundColor = '#c6c6c6ff'

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '50px'
    // ***




    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'h1',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor
            }
        })
    }
    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })
    saveToHistory('create_element', element.id)

}
async function createLabel(e) {
    const element = document.createElement('label')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it label')) index++
    element.id = `built-it label${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    element.addEventListener('click', (e) => e.preventDefault())
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    // background color    
    element.style.backgroundColor = '#c6c6c6ff'

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '50px'
    // ***



    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'label',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor
            }
        })
    }

    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })
    saveToHistory('create_element', element.id)

}
async function createButton(e) {
    const element = document.createElement('button')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it button')) index++
    element.id = `built-it button${index}`
    element.textContent = 'Button'

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    // background color    
    element.style.backgroundColor = '#c6c6c6ff'

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '60px'

    // Fix Issue #3: Remove default browser borders
    element.style.border = 'none'
    element.style.outline = 'none'
    element.style.cursor = 'pointer'
    // ***


    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'button',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor,
                'borderStyle': 'none',
                'borderWidth': 0,
                'cursor': 'pointer'
            }
        })
    }



    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createTextbox(e) {
    const element = document.createElement('input')
    // element.addEventListener('focus', (e) => {
    //     e.preventDefault()
    //     e.target.blur()
    // })
    element.type = 'text'
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it input_text')) index++
    element.id = `built-it input_text${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // Fix Issue #3: Remove default browser borders
    element.style.border = 'none'
    element.style.outline = 'none'
    element.style.backgroundColor = '#ffffff'

    // Fix Issue #2: Add width/height for better Moveable handling
    element.style.width = '150px'
    element.style.height = '30px'

    // Fix Issue #2 & #17: Prevent typing but allow selection for Moveable
    element.setAttribute('readonly', 'true')
    element.style.userSelect = 'none'



    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'text',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': '#ffffff',
                'borderStyle': 'none',
                'borderWidth': 0,
                'outline': 'none'
            }
        })
    }


    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createCheckbox(e) {
    const element = document.createElement('input')
    // element.addEventListener('focus', (e) => {
    //     e.preventDefault()
    //     e.target.blur()
    // })
    element.type = 'checkbox'
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it input_checkbox')) index++
    element.id = `built-it input_checkbox${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '50px'
    element.style.height = '50px'
    // ***




    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'checkbox',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height)
            }
        })
    }
    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createRadio(e) {
    const element = document.createElement('input')
    // element.addEventListener('focus', (e) => {
    //     e.preventDefault()
    //     e.target.blur()
    // })
    element.type = 'radio'
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it input_radio')) index++
    element.id = `built-it input_radio${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '50px'
    element.style.height = '50px'
    // ***



    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'radio',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height)
            }
        })
    }

    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createSelect(e) {
    const element = document.createElement('select')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it select')) index++
    element.id = `built-it select${index}`

    // add the element to the array
    elements[elements.length] = element

    // we can ONLY drop OPTION elements on it
    element.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation();
    })
    element.addEventListener('drop', makeOption)

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '50px'
    // ***


    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'select',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height)
            }
        })
    }


    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createDateInput(e) {
    const element = document.createElement('input')
    element.type = 'Date'
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it input_date')) index++
    element.id = `built-it input_date${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '50px'
    // ***



    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'date',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height)
            }
        })
    }


    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createLink(e) {
    const element = document.createElement('a')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it a')) index++
    element.id = `built-it a${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    // background color    
    element.style.backgroundColor = '#c6c6c6ff'

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '50px'
    // ***


    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'a',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor
            }
        })
    }


    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })


    saveToHistory('create_element', element.id)

}
async function createParagraph(e) {
    const element = document.createElement('p')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it p')) index++
    element.id = `built-it p${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    // background color    
    element.style.backgroundColor = '#c6c6c6ff'

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // width and height
    // element.style.width = '100px'
    // element.style.height = '100px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '50px'
    // ***




    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'p',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor
            }
        })
    }


    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createimage(e) {
    const element = document.createElement('img')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it img')) index++
    element.id = `built-it img${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // width and height
    // element.style.width = '100px'
    // element.style.height = '100px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '100px'
    // ***


    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'img',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height)
            }
        })
    }


    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })


    saveToHistory('create_element', element.id)

}
async function createVideo(e) {
    // Bug #5 Fix: 'vedio' corrected to 'video'
    const element = document.createElement('video')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it video')) index++
    element.id = `built-it video${index}`

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    // background color    
    element.style.backgroundColor = '#c6c6c6ff'

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '100px'
    element.style.height = '100px'
    // ***


    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'video',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor
            }
        })
    }

    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createAudio(e) {
    const container = document.createElement('div')
    const element = document.createElement('audio')
    element.controls = true
    container.appendChild(element)
    e.target.appendChild(container)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it audio')) index++
    element.id = `built-it audio${index}`

    // add the element to the array
    elements[elements.length] = element



    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    let width_after_calculating = getRightDimentions(250, 'width', false)
    let height_after_calculating = getRightDimentions(50, 'width', false)
    element.style.width = `${width_after_calculating}px`
    element.style.height = `${height_after_calculating}px`
    // ***

    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'audio',
        "properties": {
            'id': element.id
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height),
                'backgroundColor': element.style.backgroundColor
            }
        })
    }


    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })

    saveToHistory('create_element', element.id)

}
async function createOption(e) {
    const element = document.createElement('option')
    element.textContent = `option ${e.target.children.length}`
    e.target.appendChild(element)
}
async function createIcon(e) {
    const element = document.createElement('i')
    e.target.appendChild(element)
    // id
    var index = 1
    for (var i = 0; i < elements.length; i++)
        if (elements[i].id.includes('built-it i')) index++
    element.id = `built-it i${index}`
    element.className = icon_calss

    // add the element to the array
    elements[elements.length] = element

    // enable spesific prpereties and styling
    element.addEventListener('click', enable)
    the_target = document.getElementById(element.id)

    if (element.parentNode.id.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id == element.parentNode.id) {
                // Bug #2 Fix: Add null check for thechildern
                if (elements_properties_and_style[0].elements[i].thechildern)
                    elements_properties_and_style[0].elements[i].thechildern.push(element.id)
                else
                    elements_properties_and_style[0].elements[i].thechildern = [element.id]
                break
            }
        }
    }

    //  top left height and width
    element.style.position = 'absolute'
    // top and left
    element.style.top = e.offsetY - 50 + 'px'
    element.style.left = e.offsetX - 50 + 'px'

    // the heighted stuff is after changing the size of the workspace
    element.style.width = '50px'
    element.style.height = '50px'
    // ***


    elements_properties_and_style[0].elements.push({
        "parentID": element.parentNode.id,
        "kind": 'i',
        "properties": {
            'id': element.id,
            'class': icon_calss
        }
    })
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        elements_properties_and_style[1][i].children.push({
            id: element.id,
            style: {
                'position': element.style.position,
                'top': parseFloat(element.style.top),
                'left': parseFloat(element.style.left),
                'width': parseFloat(element.style.width),
                'height': parseFloat(element.style.height)
            }
        })
    }




    add_moveable({
        "type": "add",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })


    icon_calss = null

    saveToHistory('create_element', element.id)

}

function Delete(element, child) {
    if (the_target == null) return
    if (element.children.length > 0) {
        for (let i = 0; i < element.children.length; i++)
            Delete(element.children[i], true)
    }
    // delete from elements
    for (let i = 0; i < elements.length; i++)
        if (elements[i].id == element.id) {
            elements.splice(i, 1)
            break
        }

    // delete from elements_properties_and_style
    for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
        if (elements_properties_and_style[0].elements[i].properties.id == element.id) {
            if (elements_properties_and_style[0].elements[i].parentID.includes('built-it')) {
                for (let d = 0; d < elements_properties_and_style[0].elements.length; d++) {
                    if (elements_properties_and_style[0].elements[d].properties.id == elements_properties_and_style[0].elements[i].parentID) {
                        // Bug #14 Fix: Add null check for thechildern
                        if (elements_properties_and_style[0].elements[d].thechildern) {
                            for (let t = 0; t < elements_properties_and_style[0].elements[d].thechildern.length; t++) {
                                if (elements_properties_and_style[0].elements[d].thechildern[t] == element.id) {
                                    elements_properties_and_style[0].elements[d].thechildern.splice(t, 1)
                                    break
                                }
                            }
                        }
                        break
                    }
                }
            }
            elements_properties_and_style[0].elements.splice(i, 1)
            for (let j = 0; j < elements_properties_and_style[1].length; j++) {
                for (let k = 0; k < elements_properties_and_style[1][j].children.length; k++) {
                    if (elements_properties_and_style[1][j].children[k].id == element.id) {
                        elements_properties_and_style[1][j].children.splice(k, 1)
                        break
                    }
                }
            }
            break
        }
    }
    // elementProps
    add_moveable({
        "type": "delete",
        "id": element.id,
        elements_properties_and_style: elements_properties_and_style
    })
    element.parentNode.removeChild(element)
    if (!child) {
        de_click()
        saveToHistory('delete_element', element.id)

    }
}

function showIcons(e) {
    const icons_div = document.getElementById('iconsGrid')
    if (icons_div.style.display == 'block')
        icons_div.style.display = 'none'
    else
        icons_div.style.display = 'block'
}

function search_for_icons() {
    const icons_inside_grid = document.getElementById('icons_inside_grid')
    const iconSearch = document.getElementById('iconSearch')
    for (let i = 0; i < icons_inside_grid.children.length;) {
        icons_inside_grid.removeChild(icons_inside_grid.children[i])
    }
    if (iconSearch.value === '') {
        for (let i = 0; i < icons_data.length; i++)
            icons_inside_grid.appendChild(icons_data[i])
    } else {
        for (let i = 0; i < icons_data.length; i++) {
            let x = icons_data[i].children[1].textContent.toLowerCase()
            let y = iconSearch.value.toLowerCase()
            if (x.includes(`${y}`)) {
                icons_inside_grid.appendChild(icons_data[i])
            }
        }
    }
}

/* ************************************************************** 
the end of the functions for adding/deleting  Elemens/Icons
*/


/* ************************************************************** 
These functions are for saving data
*/

/**
 * Create a deep copy snapshot of current state
 */
// ============================================
// UNDO/REDO HISTORY SYSTEM (SIMPLIFIED & RELIABLE)
// ============================================

/**
 * Create a deep copy snapshot of current state
 * Stores: full data + target ID for re-selection
 */
function createHistorySnapshot(actionType, targetId = null) {
    return {
        timestamp: Date.now(),
        actionType: actionType,
        targetId: targetId,
        // Complete deep clone of the data structure
        data: JSON.parse(JSON.stringify(elements_properties_and_style))
    }
}

/**
 * Save current state to undo stack
 * Called after every user action (add/delete/style/property change)
 */
function saveToHistory(actionType, targetId = null) {
    if (applyingHistory) return // Prevent saving during undo/redo

    const snapshot = createHistorySnapshot(actionType, targetId)
    undoStack.push(snapshot)

    // Limit stack size to prevent memory issues
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift() // Remove oldest
    }

    // Clear redo stack when new action is performed
    redoStack.length = 0

    console.log(`✓ History saved: ${actionType} | Stack: ${undoStack.length} | Target: ${targetId || 'none'}`)
}

/**
 * Restore state from snapshot
 * Complete cleanup and rebuild approach
 */
async function restoreFromSnapshot(snapshot) {
    if (!snapshot) {
        console.error('Cannot restore: snapshot is null')
        return
    }

    applyingHistory = true

    try {
        console.log(`Restoring: ${snapshot.actionType} (${new Date(snapshot.timestamp).toLocaleTimeString()})`)

        // STEP 1: Clear all devices from UI
        const devices_area = document.getElementById('devices_area')
        if (devices_area) {
            devices_area.innerHTML = ''
        }
        current_devices.length = 0

        // STEP 2: Clear all moveable instances and elements from design_page
        const design_page = document.getElementById('design_page')

        // Collect all element IDs first (since we're modifying during iteration)
        const elementIds = []
        for (let i = 0; i < design_page.children.length; i++) {
            if (design_page.children[i].id) {
                elementIds.push(design_page.children[i].id)
            }
        }

        // Delete moveable instances for each element
        for (let i = 0; i < elementIds.length; i++) {
            add_moveable({
                type: "delete",
                id: elementIds[i],
                elements_properties_and_style: elements_properties_and_style
            })
        }

        // Now clear the DOM elements
        while (design_page.firstChild) {
            design_page.removeChild(design_page.firstChild)
        }

        // STEP 3: Clear elements array
        elements.length = 0

        // STEP 4: Restore data (deep clone to avoid reference issues)
        elements_properties_and_style = JSON.parse(JSON.stringify(snapshot.data))

        // STEP 5: Rebuild everything using loadDesign
        await loadDesign(elements_properties_and_style, fileTitele)

        // STEP 6: Re-select the target element if it exists
        if (snapshot.targetId) {
            const targetElement = document.getElementById(snapshot.targetId)
            if (targetElement) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    targetElement.click()
                }, 50)
            } else {
                de_click()
            }
        } else {
            de_click()
        }

        // STEP 7: Save to file


        console.log(`✓ Restored successfully`)

    } catch (error) {
        console.error('Error restoring history:', error)
        // alert(`Undo/Redo Error: ${error.message}`)
    } finally {
        applyingHistory = false
    }
}

/**
 * Undo last action
 */
async function undo() {
    if (undoStack.length <= 1) {
        console.log('Nothing to undo (at initial state)')
        return
    }

    console.log(`Undo triggered | Stack size: ${undoStack.length}`)

    // Move current state to redo stack
    const currentSnapshot = undoStack.pop()
    redoStack.push(currentSnapshot)

    // Restore previous state (now at top of undo stack)
    const prevSnapshot = undoStack[undoStack.length - 1]
    await restoreFromSnapshot(prevSnapshot)

    updateHistoryStatus('Undone')
    console.log(`Undo complete | Undo stack: ${undoStack.length} | Redo stack: ${redoStack.length}`)
}

/**
 * Redo last undone action
 */
async function redo() {
    if (redoStack.length === 0) {
        console.log('Nothing to redo')
        return
    }

    console.log(`Redo triggered | Redo stack size: ${redoStack.length}`)

    // Get next state from redo stack
    const nextSnapshot = redoStack.pop()

    // Move it back to undo stack
    undoStack.push(nextSnapshot)

    // Restore that state
    await restoreFromSnapshot(nextSnapshot)

    updateHistoryStatus('Redone')
    console.log(`Redo complete | Undo stack: ${undoStack.length} | Redo stack: ${redoStack.length}`)
}

// ============================================
// COPY/PASTE SYSTEM
// ============================================

/**
 * Copy selected element data
 */
function copyElement() {
    if (!the_target || the_target.id === 'design_page') {
        console.log('No element selected to copy')
        return
    }

    // Find element in properties array
    let elementProps = null
    for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
        if (elements_properties_and_style[0].elements[i].properties.id === the_target.id) {
            elementProps = elements_properties_and_style[0].elements[i]
            break
        }
    }

    if (!elementProps) {
        console.error('Element properties not found')
        return
    }

    // Find element styles for all devices
    const elementStyles = []
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++) {
            if (elements_properties_and_style[1][i].children[j].id === the_target.id) {
                elementStyles.push({
                    deviceName: elements_properties_and_style[1][i].device.name,
                    style: JSON.parse(JSON.stringify(elements_properties_and_style[1][i].children[j].style))
                })
            }
        }
    }

    // Store copy data
    copiedElementData = {
        properties: JSON.parse(JSON.stringify(elementProps)),
        styles: elementStyles,
        copiedAt: Date.now()
    }

    console.log('Element copied:', the_target.id)

    // Visual feedback (optional)
    // const originalBorder = the_target.style.outline
    // the_target.style.outline = '2px dashed #4CAF50'
    // setTimeout(() => {
    //     the_target.style.outline = originalBorder
    // }, 300)
    updateHistoryStatus('Copied')
}

/**
 * Paste copied element
 */
async function pasteElement() {
    if (!copiedElementData) {
        console.log('Nothing to paste')
        return
    }

    const data = copiedElementData
    const kind = data.properties.kind

    // Generate new unique ID
    let newIndex = 1
    const baseId = `built-it ${kind}`
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].id.includes(baseId)) {
            const num = parseInt(elements[i].id.replace(baseId, ''))
            if (num >= newIndex) newIndex = num + 1
        }
    }
    const newId = `${baseId}${newIndex}`

    // Create the element
    let newElement
    if (['div', 'h1', 'label', 'button', 'a', 'p', 'img', 'video', 'audio', 'i'].includes(kind)) {
        newElement = document.createElement(kind)
        if (kind == 'label')
            newElement.addEventListener('click', (e) => e.preventDefault())
    } else {
        newElement = document.createElement('input')
        newElement.type = kind
    }

    newElement.id = newId

    // Offset position by 20px so it's visible as a new element
    const baseTop = parseFloat(data.styles[0]?.style?.top || 0)
    const baseLeft = parseFloat(data.styles[0]?.style?.left || 0)

    newElement.style.position = 'absolute'
    newElement.style.top = (baseTop + 20) + 'px'
    newElement.style.left = (baseLeft + 20) + 'px'

    // Apply all properties except id
    for (const key in data.properties.properties) {
        if (key === 'id') continue

        if (key === 'textContent') {
            newElement.textContent = data.properties.properties[key]
        } else if (key === 'class') {
            newElement.classList.add(data.properties.properties[key])
        } else {
            newElement.setAttribute(key, data.properties.properties[key])
        }
    }

    // Append to parent or design_page
    let parentElement = document.getElementById(data.properties.parentID)
    if (!parentElement) {
        parentElement = document.getElementById('design_page')
    }
    parentElement.appendChild(newElement)

    // Add to elements array
    elements.push(newElement)

    // Setup event listeners
    if (kind === 'div') {
        newElement.addEventListener('dragover', (e) => {
            e.preventDefault()
            e.stopPropagation()
        })
        newElement.addEventListener('drop', make_element)
    }
    newElement.addEventListener('click', enable)

    // Update parent's children list if parent is built-it element
    if (data.properties.parentID.includes('built-it')) {
        for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
            if (elements_properties_and_style[0].elements[i].properties.id === data.properties.parentID) {
                if (!elements_properties_and_style[0].elements[i].thechildern) {
                    elements_properties_and_style[0].elements[i].thechildern = []
                }
                elements_properties_and_style[0].elements[i].thechildern.push(newId)
                break
            }
        }
    }

    // Add moveable
    add_moveable({
        type: "add",
        id: newId,
        elements_properties_and_style: elements_properties_and_style
    })

    // Add to properties array
    const newProps = JSON.parse(JSON.stringify(data.properties))
    newProps.properties.id = newId
    newProps.parentID = data.properties.parentID
    if (newProps.thechildern) {
        newProps.thechildern = [] // Don't copy children
    }
    elements_properties_and_style[0].elements.push(newProps)

    // Add styles for all devices
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        const deviceName = elements_properties_and_style[1][i].device.name

        // Find matching style from copied data
        let styleData = data.styles.find(s => s.deviceName === deviceName)
        if (!styleData) {
            styleData = data.styles[0] // Fallback to first device
        }

        const newStyle = JSON.parse(JSON.stringify(styleData.style))
        newStyle.top = baseTop + 20
        newStyle.left = baseLeft + 20

        elements_properties_and_style[1][i].children.push({
            id: newId,
            style: newStyle
        })
    }

    // Apply initial styles
    the_target = newElement
    const activeDevice = document.getElementsByClassName('device active')[0].children[0].id
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        if (elements_properties_and_style[1][i].device.name === activeDevice) {
            for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++) {
                if (elements_properties_and_style[1][i].children[j].id === newId) {
                    const styleObj = elements_properties_and_style[1][i].children[j].style
                    if (styleObj.borderWidth && styleObj.borderStyle) {
                        const borderColor = styleObj.borderColor || '#000000'
                        const borderWidth = parseFloat(styleObj.borderWidth) || 1
                        the_target.style.border = `${borderWidth}px ${styleObj.borderStyle} ${borderColor}`
                    }
                    for (const key in styleObj) {
                        if (key == 'borderWidth' || key == 'borderStyle' || key == 'borderColor') continue
                        applyStyleToElement(key, styleObj[key])
                    }
                    break
                }
            }
            break
        }
    }

    // Save and select
    saveToHistory('paste_element', newId)


    // Auto-select the pasted element
    newElement.click()

    console.log('Element pasted:', newId)
    updateHistoryStatus('Pasted')
}

// Update history status display
function updateHistoryStatus(message = '') {
    const statusDiv = document.getElementById('history_status')
    const undoCount = document.getElementById('undo_count')
    const redoCount = document.getElementById('redo_count')

    if (!statusDiv) return

    if (undoCount) undoCount.textContent = `Undo: ${undoStack.length}`
    if (redoCount) redoCount.textContent = `Redo: ${redoStack.length}`

    if (message) {
        statusDiv.style.display = 'block'
        statusDiv.style.opacity = '1'

        setTimeout(() => {
            statusDiv.style.opacity = '0'
            setTimeout(() => {
                statusDiv.style.display = 'none'
            }, 300)
        }, 2000)
    }
}

/* ************************************************************** 
the end of functions are for saving data
*/



/* ************************************************************** 
the wheel functions 
*/
// resize main area function
// make a sizing list for every device
// check function   changeing_main_devise_size
function handleZoomWheel(e) {
    e.preventDefault()

    // Check if it's a trackpad pinch (has decimal values) or mouse wheel
    const isPinch = e.deltaY - Math.trunc(e.deltaY) !== 0

    if (e.deltaY < 0) {
        // Zoom in
        if (currentZoomLevel < 3.0) { // Max 300%
            currentZoomLevel += ZOOM_STEP
            applyZoomTransform()
        }
    } else {
        // Zoom out
        if (currentZoomLevel > 0.1) { // Min 10%
            currentZoomLevel -= ZOOM_STEP
            applyZoomTransform()
        }
    }

    // Optional: Show zoom percentage
    console.log(`Zoom: ${(currentZoomLevel * 100).toFixed(0)}%`)
}

function applyZoomTransform() {
    const design_page = document.getElementById('design_page')
    design_page.style.transform = `scale(${currentZoomLevel})`
    design_page.style.transformOrigin = 'top left'

    // Optional: Update UI with current zoom level
    updateZoomDisplay()
}

// Optional: Add zoom display in UI
function updateZoomDisplay() {
    let zoomDisplay = document.getElementById('zoom-display')
    if (!zoomDisplay) {
        zoomDisplay = document.createElement('div')
        zoomDisplay.id = 'zoom-display'
        zoomDisplay.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
            transition: opacity 0.3s;
        `
        document.body.appendChild(zoomDisplay)
    }

    zoomDisplay.textContent = `${(currentZoomLevel * 100).toFixed(0)}%`
    zoomDisplay.style.opacity = '1'

    // Hide after 1 second
    clearTimeout(zoomDisplay.timeout)
    zoomDisplay.timeout = setTimeout(() => {
        zoomDisplay.style.opacity = '0'
    }, 1000)
}



/* ************************************************************** 
the end of the wheel functions
*/

function de_click(e) {
    the_target = null
    const iconsGrid = document.getElementById('iconsGrid')
    if (iconsGrid)
        iconsGrid.style.display = 'none'
    disabling()
}

function enable(e) {
    the_target = e.target
    let name = e.target.nodeName
    if (name == 'INPUT') name = e.target.type
    switch (name) {
        case 'DIV':
            enabling(true, true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false)
            break;
        case 'BUTTON':
            enabling(true, true, true, true, false, true, true, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false)
            break;
        case 'text':
            enabling(true, true, false, true, false, true, true, true, true, false, false, false, true, true, true, true, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false)
            break;
        case 'checkbox':
            enabling(true, true, false, true, false, true, true, false, true, false, false, false, false, true, true, false, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false)
            break;
        case 'radio':
            enabling(true, true, false, true, false, true, true, false, true, false, false, false, false, true, true, false, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false)
            break;
        case 'SELECT':
            enabling(true, true, false, true, false, true, false, false, false, false, false, false, false, true, true, false, false, true, true, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false)
            break;
        case 'date':
            enabling(true, true, false, true, false, true, true, false, true, false, false, false, false, true, true, true, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false)
            break;
        case 'H1':
            enabling(true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false)
            break;
        case 'LABEL':
            enabling(true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, true)
            break;
        case 'A':
            enabling(true, true, true, true, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false)
            break;
        case 'P':
            enabling(true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false)
            break;
        case 'IMG':
            enabling(true, true, false, true, true, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false)
            break;
        case 'I':
            enabling(true, true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, true, true, true, false, false, false, false, false, false, false, false)
            break
    }
}

// Assuming readMyFile function exists elsewhere and this is its end.
// If readMyFile is not present, this code will be placed at the end of the file.
// If it's part of another function, please provide the full function context.
// For the purpose of this edit, I'm placing it where the instruction implies
// it should be, which is after the `enable` function's switch statement,
// assuming there's a `readMyFile` function that ends here.
// However, based on the provided snippet, the user's intended insertion point
// seems to be within the `enable` function, which would be syntactically incorrect
// given the `}, true, true, ...` part.
// I will assume the user wants to add this block at the end of the file,
// as a standalone block, if `readMyFile` is not explicitly defined in the provided content.
// If `readMyFile` is defined elsewhere, this placement might be wrong.

// 3 - update the target
// the_target = null
// enabling(false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false)

// // Clear history and save initial state
// undoStack.length = 0
// redoStack.length = 0
// saveToHistory('initial')


function disabling() {
    const components = document.getElementsByClassName('Uiexpert_style')
    for (let i = 0; i < components.length; i++)
        if (components[i].parentNode.id == 'text_style_toolbar' || components[i].parentNode.parentNode.id == 'text_style_toolbar')
            // Bug #6 Fix: Use removeAttribute instead of setAttribute(false)
            components[i].removeAttribute('disabled')
        else
            components[i].parentNode.style.display = 'none'
}

// ============================================
// ID VALIDATION SYSTEM
// ============================================

/* Check if ID already exists in the project*/
function isIdDuplicate(newId, excludeCurrentElement = false) {
    const checkId = newId.startsWith('built-it ') ? newId : `built-it ${newId}`

    for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
        const elementId = elements_properties_and_style[0].elements[i].properties.id

        // Skip the current element being edited
        if (excludeCurrentElement && the_target && elementId === the_target.id) {
            continue
        }

        if (elementId === checkId) {
            return true
        }
    }

    return false
}

/* Show error message to user */
function showIdError(message) {
    // Visual feedback on the input
    const idInput = document.getElementById('id')
    if (idInput) {
        const originalBorder = idInput.style.border
        idInput.style.border = '2px solid #f44336'
        setTimeout(() => {
            idInput.style.border = originalBorder
        }, 2000)
    }
}

async function the_target_changing(type, value, save = undefined) {
    // Property updates (stored in elements_properties_and_style[0].elements)
    const propertyUpdates = {
        id: () => {
            const newId = value.startsWith('built-it ') ? value : `built-it ${value}`

            // Check for duplicates (excluding current element)
            if (isIdDuplicate(newId, true)) {
                showIdError(`ID "${value}" is already used by another element. Please choose a unique ID.`)

                // Revert input to current ID
                const idInput = document.getElementById('id')
                if (idInput && the_target) {
                    idInput.value = the_target.id.split('built-it ')[1]
                }
                return // Don't proceed with change
            }

            const oldId = the_target.id

            // Update in properties array
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
                if (elements_properties_and_style[0].elements[i].properties.id === oldId) {
                    elements_properties_and_style[0].elements[i].properties.id = newId
                    break
                }
            }

            // Update in all device styles
            for (let i = 0; i < elements_properties_and_style[1].length; i++) {
                for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++) {
                    if (elements_properties_and_style[1][i].children[j].id === oldId) {
                        elements_properties_and_style[1][i].children[j].id = newId
                    }
                }
            }

            // Update parent's children references
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
                if (elements_properties_and_style[0].elements[i].thechildern) {
                    const childIndex = elements_properties_and_style[0].elements[i].thechildern.indexOf(oldId)
                    if (childIndex !== -1) {
                        elements_properties_and_style[0].elements[i].thechildern[childIndex] = newId
                    }
                }
            }

            // Update DOM
            the_target.setAttribute('id', newId)

            // Update moveable reference
            add_moveable({ "type": "update_id", oldId, newId, elements_properties_and_style })

            console.log(`ID changed: ${oldId} → ${newId}`)
        },
        for: () => {
            const finalValue = value.startsWith('built-it ') ? value : `built-it ${value}`
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.for = finalValue
                    break
                }
            the_target.setAttribute('for', finalValue)
        },
        classname: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.classname = value
                    break
                }
            the_target.classList.add(`${value}`)
        },
        textContent: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++) {
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.textContent = value
                    break
                }
            }
            the_target.textContent = value
        },
        title: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.title = value
                    break
                }
            the_target.setAttribute('title', value)
        },
        alt: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.alt = value
                    break
                }
            the_target.setAttribute('alt', value)
        },
        name: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.name = value
                    break
                }
            the_target.setAttribute('name', value)
        },
        value: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.value = value
                    break
                }
            the_target.setAttribute('value', value)
        },
        placeholder: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.placeholder = value
                    break
                }
            the_target.setAttribute('placeholder', value)
        },
        type: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.type = value
                    break
                }
            the_target.setAttribute('type', value)
        },
        target: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.target = value
                    break
                }
            the_target.setAttribute('target', value)
        },
        href: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.href = value
                    break
                }
            the_target.setAttribute('href', value)
        },
        src: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.src = value
                    break
                }
            the_target.setAttribute('src', value)
        },
        maxlength: () => {
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.maxlength = value
                    break
                }
            the_target.setAttribute('maxlength', value)
        },
        required: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.required = boolValue
                    break
                }
            the_target.required = boolValue
        },
        disabled: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.disabled = boolValue
                    break
                }
            the_target.disabled = boolValue
        },
        readonly: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.readonly = boolValue
                    break
                }
            the_target.readOnly = boolValue
        },
        checked: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.checked = boolValue
                    break
                }
            the_target.checked = boolValue
        },
        selected: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.selected = boolValue
                    break
                }
            the_target.selected = boolValue
        },
        multiple: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.multiple = boolValue
                    break
                }
            the_target.multiple = boolValue
        },
        autoplay: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.autoplay = boolValue
                    break
                }
            the_target.autoplay = boolValue
        },
        controls: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.controls = boolValue
                    break
                }
            the_target.controls = boolValue
        },
        loop: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.loop = boolValue
                    break
                }
            the_target.loop = boolValue
        },
        muted: () => {
            // Fix Issue #4: Explicit boolean conversion
            const boolValue = value === true || value === 'true'
            for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
                if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
                    elements_properties_and_style[0].elements[i].properties.muted = boolValue
                    break
                }
            the_target.muted = boolValue
        }
    }

    // Style updates with camelCase keys for direct application
    const styleUpdates = {
        // Simple value styles
        display: () => {
            updateStyleInStorage('display', value)
            the_target.style.display = value
        },
        position: () => {
            updateStyleInStorage('position', value)
            the_target.style.position = value

            // If changing away from absolute, remove moveable
            if (value !== 'absolute' && value !== 'fixed') {
                // Remove draggable capability
                add_moveable({
                    type: "disable_drag",
                    id: the_target.id,
                    elements_properties_and_style: elements_properties_and_style
                })

                // Reset position values
                the_target.style.top = 'auto'
                the_target.style.left = 'auto'
                updateStyleInStorage('top', 'auto')
                updateStyleInStorage('left', 'auto')
            } else {
                // Re-enable moveable for absolute/fixed
                add_moveable({
                    type: "enable_drag",
                    id: the_target.id,
                    elements_properties_and_style: elements_properties_and_style
                })
            }
        },
        flex_direction: () => {
            updateStyleInStorage('flexDirection', value)
            the_target.style.flexDirection = value
        },
        flex_wrap: () => {
            updateStyleInStorage('flexWrap', value)
            the_target.style.flexWrap = value
        },
        flex_justify_content: () => {
            updateStyleInStorage('justifyContent', value)
            the_target.style.justifyContent = value
        },
        flex_align_items: () => {
            updateStyleInStorage('alignItems', value)
            the_target.style.alignItems = value
        },
        flex_grow: () => {
            updateStyleInStorage('flexGrow', value)
            the_target.style.flexGrow = value
        },
        flex_shrink: () => {
            updateStyleInStorage('flexShrink', value)
            the_target.style.flexShrink = value
        },
        background_size: () => {
            updateStyleInStorage('backgroundSize', value)
            the_target.style.backgroundSize = value
        },
        background_position: () => {
            updateStyleInStorage('backgroundPosition', value)
            the_target.style.backgroundPosition = value
        },
        background_repeat: () => {
            updateStyleInStorage('backgroundRepeat', value)
            the_target.style.backgroundRepeat = value
        },
        border_style: () => {
            updateStyleInStorage('borderStyle', value)
            the_target.style.borderStyle = value
        },
        font_family: () => {
            updateStyleInStorage('fontFamily', value)
            document.getElementById('font_family2').value = value
            the_target.style.fontFamily = value
        },
        font_weight: () => {
            updateStyleInStorage('fontWeight', value)
            the_target.style.fontWeight = value
        },
        text_align: () => {
            updateStyleInStorage('textAlign', value)
            the_target.style.textAlign = value
        },
        text_decoration: () => {
            updateStyleInStorage('textDecoration', value)
            the_target.style.textDecoration = value
        },
        text_transform: () => {
            updateStyleInStorage('textTransform', value)
            the_target.style.textTransform = value
        },
        timing_function: () => {
            updateStyleInStorage('transitionTimingFunction', value)
            the_target.style.transitionTimingFunction = value
        },
        overflow_x: () => {
            updateStyleInStorage('overflowX', value)
            the_target.style.overflowX = value
        },
        overflow_y: () => {
            updateStyleInStorage('overflowY', value)
            the_target.style.overflowY = value
        },
        visibility: () => {
            updateStyleInStorage('visibility', value)
            the_target.style.visibility = value
        },
        cursor: () => {
            updateStyleInStorage('cursor', value)
            the_target.style.cursor = value
        },
        pointer_events: () => {
            updateStyleInStorage('pointerEvents', value)
            the_target.style.pointerEvents = value
        },
        user_select: () => {
            updateStyleInStorage('userSelect', value)
            the_target.style.userSelect = value
        },
        grid_autoflow: () => {
            updateStyleInStorage('gridAutoFlow', value)
            the_target.style.gridAutoFlow = value
        },
        grid_justify_items: () => {
            updateStyleInStorage('gridJustifyItems', value)
            the_target.style.gridJustifyItems = value
        },
        grid_alain_items: () => {
            updateStyleInStorage('gridAlignItems', value)
            the_target.style.gridAlignItems = value
        },
        opacity: () => {
            updateStyleInStorage('opacity', value)
            the_target.style.opacity = value
        },
        z_index: () => {
            updateStyleInStorage('zIndex', value)
            the_target.style.zIndex = value
        },
        transition: () => {
            updateStyleInStorage('transition', value)
            the_target.style.transition = value
        },
        font_style_toggle: () => {
            updateStyleInStorage('fontStyle', value)
            the_target.style.fontStyle = value
        },

        // Pixel value styles
        top: () => {
            updateStyleInStorage('top', value)
            the_target.style.top = value + 'px'
        },
        right: () => {
            updateStyleInStorage('right', value)
            the_target.style.right = value + 'px'
        },
        bottom: () => {
            updateStyleInStorage('bottom', value)
            the_target.style.bottom = value + 'px'
        },
        left: () => {
            updateStyleInStorage('left', value)
            the_target.style.left = value + 'px'
        },
        width: () => {
            updateStyleInStorage('width', value)
            the_target.style.width = value + 'px'
        },
        height: () => {
            updateStyleInStorage('height', value)
            the_target.style.height = value + 'px'
        },
        min_width: () => {
            updateStyleInStorage('minWidth', value)
            the_target.style.minWidth = value + 'px'
        },
        max_width: () => {
            updateStyleInStorage('maxWidth', value)
            the_target.style.maxWidth = value + 'px'
        },
        gap: () => {
            updateStyleInStorage('gap', value)
            the_target.style.gap = value + 'px'
        },
        margin_top: () => {
            updateStyleInStorage('marginTop', value)
            the_target.style.marginTop = value + 'px'
        },
        margin_right: () => {
            updateStyleInStorage('marginRight', value)
            the_target.style.marginRight = value + 'px'
        },
        margin_bottom: () => {
            updateStyleInStorage('marginBottom', value)
            the_target.style.marginBottom = value + 'px'
        },
        margin_left: () => {
            updateStyleInStorage('marginLeft', value)
            the_target.style.marginLeft = value + 'px'
        },
        padding_top: () => {
            updateStyleInStorage('paddingTop', value)
            the_target.style.paddingTop = value + 'px'
        },
        padding_right: () => {
            updateStyleInStorage('paddingRight', value)
            the_target.style.paddingRight = value + 'px'
        },
        padding_bottom: () => {
            updateStyleInStorage('paddingBottom', value)
            the_target.style.paddingBottom = value + 'px'
        },
        padding_left: () => {
            updateStyleInStorage('paddingLeft', value)
            the_target.style.paddingLeft = value + 'px'
        },
        border_width: () => {
            updateStyleInStorage('borderWidth', value)
            the_target.style.borderWidth = value + 'px'
        },
        border_radius: () => {
            console.log('borderRadius')
            updateStyleInStorage('borderRadius', value)
            the_target.style.borderRadius = value + 'px'
        },
        right_border_width: () => {
            updateStyleInStorage('borderRightWidth', value)
            the_target.style.borderRightWidth = value + 'px'
        },
        top_border_width: () => {
            updateStyleInStorage('borderTopWidth', value)
            the_target.style.borderTopWidth = value + 'px'
        },
        left_border_width: () => {
            updateStyleInStorage('borderLeftWidth', value)
            the_target.style.borderLeftWidth = value + 'px'
        },
        bottom_border_width: () => {
            updateStyleInStorage('borderBottomWidth', value)
            the_target.style.borderBottomWidth = value + 'px'
        },
        font_size: () => {
            updateStyleInStorage('fontSize', value)
            document.getElementById('font_size2').value = value
            the_target.style.fontSize = value + 'px'
        },
        line_height: () => {
            updateStyleInStorage('lineHeight', value)
            the_target.style.lineHeight = value + 'px'
        },
        letter_spacing: () => {
            updateStyleInStorage('letterSpacing', value)
            the_target.style.letterSpacing = value + 'px'
        },
        word_spacing: () => {
            updateStyleInStorage('wordSpacing', value)
            the_target.style.wordSpacing = value + 'px'
        },
        border_radius: () => {
            updateStyleInStorage('borderRadius', value)
            the_target.style.borderRadius = value + 'px'
        },
        top_right_border_radius: () => {
            updateStyleInStorage('borderTopRightRadius', value)
            the_target.style.borderTopRightRadius = value + 'px'
        },
        top_left_border_radius: () => {
            updateStyleInStorage('borderTopLeftRadius', value)
            the_target.style.borderTopLeftRadius = value + 'px'
        },
        bottom_right_border_radius: () => {
            updateStyleInStorage('borderBottomRightRadius', value)
            the_target.style.borderBottomRightRadius = value + 'px'
        },
        bottom_left_border_radius: () => {
            updateStyleInStorage('borderBottomLeftRadius', value)
            the_target.style.borderBottomLeftRadius = value + 'px'
        },
        duration: () => {
            updateStyleInStorage('transitionDuration', value)
            the_target.style.transitionDuration = value + 'ms'
        },

        // Color styles
        background_color: () => {
            updateStyleInStorage('backgroundColor', value)
            document.getElementById('background_color2').value = value
            the_target.style.backgroundColor = value
        },
        font_color: () => {
            updateStyleInStorage('color', value)
            the_target.style.color = value
        },
        border_color: () => {
            updateStyleInStorage('borderColor', value)
            the_target.style.borderColor = value
        },
        right_border_color: () => {
            updateStyleInStorage('borderRightColor', value)
            the_target.style.borderRightColor = value
        },
        top_border_color: () => {
            updateStyleInStorage('borderTopColor', value)
            the_target.style.borderTopColor = value
        },
        left_border_color: () => {
            updateStyleInStorage('borderLeftColor', value)
            the_target.style.borderLeftColor = value
        },
        bottom_border_color: () => {
            updateStyleInStorage('borderBottomColor', value)
            the_target.style.borderBottomColor = value
        },

        // URL style
        background_image: () => {
            updateStyleInStorage('backgroundImage', value)
            the_target.style.backgroundImage = `url(${value})`
        },

        // Grid styles
        grid_template_columns: () => {
            updateStyleInStorage('gridTemplateColumns', value)
            the_target.style.gridTemplateColumns = value
        },
        grid_template_rows: () => {
            updateStyleInStorage('gridTemplateRows', value)
            the_target.style.gridTemplateRows = value
        },
        grid_column: () => {
            updateStyleInStorage('gridColumn', value)
            the_target.style.gridColumn = value
        },
        grid_row: () => {
            updateStyleInStorage('gridRow', value)
            the_target.style.gridRow = value
        },
        grid_gap: () => {
            updateStyleInStorage('gridGap', value)
            the_target.style.gridGap = value
        }
    }

    // Composite styles (box shadow)
    if (['shadow_color', 'shadow_x', 'shadow_y', 'shadow_blur', 'shadow_opacity', 'shadow_inset'].includes(type)) {
        // Map input name to storage key
        const storageKey = type === 'shadow_opacity' ? 'shadowOpacity' :
            type === 'shadow_inset' ? 'shadowInset' :
                type === 'shadow_color' ? 'shadowColor' :
                    type === 'shadow_x' ? 'shadowX' :
                        type === 'shadow_y' ? 'shadowY' :
                            'shadowBlur'

        // CRITICAL: Update storage first
        updateStyleInStorage(storageKey, value)
        if (type == 'shadow_inset') {
            console.log(value)
        }
        // Get fresh style object
        const style = getElementStyle()
        if (!style) return

        // Reconstruct box-shadow
        const parts = []
        if (style.shadowInset) {
            // console.log(document.getElementById('shadow_inset').getAttribute('checked'))
            // console.log(style)
            // console.log(value)
            parts.push('inset')
        }
        parts.push(`${style.shadowX || 0}px`)
        parts.push(`${style.shadowY || 0}px`)
        parts.push(`${style.shadowBlur || 0}px`)

        let color = style.shadowColor || '#000000'
        if (style.shadowOpacity !== undefined && style.shadowOpacity < 1) {
            color = hexToRgba(color, style.shadowOpacity)
        }
        parts.push(color)

        the_target.style.boxShadow = parts.join(' ')



        return
    }

    // Composite styles (text shadow)
    if (['text_shadow_color', 'text_shadow_x', 'text_shadow_y', 'text_shadow_blur'].includes(type)) {
        // Map input name to storage key
        const storageKey = type === 'text_shadow_color' ? 'textShadowColor' :
            type === 'text_shadow_x' ? 'textShadowX' :
                type === 'text_shadow_y' ? 'textShadowY' :
                    'textShadowBlur'

        // CRITICAL: Update storage first
        updateStyleInStorage(storageKey, value)

        // Get fresh style object after update
        const style = getElementStyle()
        if (!style) return

        // Reconstruct full text-shadow CSS
        const parts = [
            `${style.textShadowX || 0}px`,
            `${style.textShadowY || 0}px`,
            `${style.textShadowBlur || 0}px`,
            style.textShadowColor || '#000000'
        ]

        the_target.style.textShadow = parts.join(' ')



        return
    }

    // Composite styles (gradient)
    if (type.startsWith('gradiant_')) {
        // Convert snake_case to camelCase
        const camelKey = type.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase())

        // CRITICAL: Update storage first
        updateStyleInStorage(camelKey, value)

        // Get fresh style object
        const style = getElementStyle()
        if (!style) return

        // Reconstruct gradient
        const stops = []
        if (style.gradiantColor1) {
            stops.push(`${style.gradiantColor1} ${style.gradiantPersentFrom1 || 0}%`)
            if (style.gradiantPersentTo1 && style.gradiantPersentTo1 !== style.gradiantPersentFrom1) {
                stops.push(`${style.gradiantColor1} ${style.gradiantPersentTo1}%`)
            }
        }
        if (style.gradiantColor2) {
            stops.push(`${style.gradiantColor2} ${style.gradiantPersentFrom2 || 0}%`)
            if (style.gradiantPersentTo2 && style.gradiantPersentTo2 !== style.gradiantPersentFrom2) {
                stops.push(`${style.gradiantColor2} ${style.gradiantPersentTo2}%`)
            }
        }
        if (style.gradiantColor3) {
            stops.push(`${style.gradiantColor3} ${style.gradiantPersentFrom3 || 0}%`)
            if (style.gradiantPersentTo3 && style.gradiantPersentTo3 !== style.gradiantPersentFrom3) {
                stops.push(`${style.gradiantColor3} ${style.gradiantPersentTo3}%`)
            }
        }

        if (stops.length > 0) {
            the_target.style.backgroundImage = `linear-gradient(to right, ${stops.join(', ')})`
        }



        return
    }

    // Composite styles (filter)
    if (type.startsWith('filter_')) {
        const camelKey = type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

        // CRITICAL: Update storage first
        updateStyleInStorage(camelKey, value)

        // Get fresh style object
        const style = getElementStyle()
        if (!style) return

        const filters = []
        if (style.filterBlur) filters.push(`blur(${style.filterBlur}px)`)
        if (style.filterBrightness) filters.push(`brightness(${style.filterBrightness}%)`)
        if (style.filterContrast) filters.push(`contrast(${style.filterContrast}%)`)
        if (style.filterGrayscale) filters.push(`grayscale(${style.filterGrayscale}%)`)
        if (style.filterSepia) filters.push(`sepia(${style.filterSepia}%)`)
        if (style.filterSaturate) filters.push(`saturate(${style.filterSaturate}%)`)
        if (style.filterShadow) filters.push(`drop-shadow(${style.filterShadow})`)

        if (filters.length > 0) {
            the_target.style.filter = filters.join(' ')
        }



        return
    }

    // Composite styles (backdrop filter)
    if (type.startsWith('backdrop_filter_')) {
        const camelKey = type.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())

        // CRITICAL: Update storage first
        updateStyleInStorage(camelKey, value)

        // Get fresh style object
        const style = getElementStyle()
        if (!style) return

        const filters = []
        if (style.backdropFilterBlur) filters.push(`blur(${style.backdropFilterBlur}px)`)
        if (style.backdropFilterBrightness) filters.push(`brightness(${style.backdropFilterBrightness}%)`)
        if (style.backdropFilterContrast) filters.push(`contrast(${style.backdropFilterContrast}%)`)
        if (style.backdropFilterGrayscale) filters.push(`grayscale(${style.backdropFilterGrayscale}%)`)
        if (style.backdropFilterSepia) filters.push(`sepia(${style.backdropFilterSepia}%)`)
        if (style.backdropFilterSaturate) filters.push(`saturate(${style.backdropFilterSaturate}%)`)
        if (style.backdropFilterShadow) filters.push(`drop-shadow(${style.backdropFilterShadow})`)

        if (filters.length > 0) {
            the_target.style.backdropFilter = filters.join(' ')
        }



        return
    }

    // Execute property or style update
    if (propertyUpdates[type]) {
        propertyUpdates[type]()
    } else if (styleUpdates[type]) {
        styleUpdates[type]()
    }

    if (save != undefined) return
    if (the_target) {
        saveToHistory('style_change', the_target.id)
    }

}

function applyStyleToElement(styleKey, storedValue) {
    if (!the_target || storedValue === undefined || storedValue === null || storedValue === '') return

    const pixelStyles = [
        'top', 'right', 'bottom', 'left',
        'width', 'height', 'minWidth', 'maxWidth',
        'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'borderWidth', 'borderRadius',
        'borderRightWidth', 'borderTopWidth', 'borderLeftWidth', 'borderBottomWidth',
        'borderTopRightRadius', 'borderTopLeftRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius',
        'fontSize', 'lineHeight', 'letterSpacing', 'wordSpacing',
        'gap', 'gridGap'
    ]

    if (pixelStyles.includes(styleKey)) {
        the_target.style[styleKey] = storedValue + 'px'
    } else if (styleKey === 'transitionDuration') {
        the_target.style[styleKey] = storedValue + 'ms'
    } else if (styleKey === 'backgroundImage' && !storedValue.startsWith('url(')) {
        the_target.style[styleKey] = `url(${storedValue})`
    } else {
        the_target.style[styleKey] = storedValue
    }
}


// Helper to get element style object from storage - Return a copy, not reference
const getElementStyle = () => {
    console.log('function name is ' + ' getElementStyle')

    const active_device_id = document.getElementsByClassName('device active')[0].children[0].id

    // Bug #7 Fix: Always find the ACTIVE device's style, even if overall_style is true
    // When writing, we update all. When reading, we only show the current view.
    for (let i = 0; i < elements_properties_and_style[1].length; i++)
        if (elements_properties_and_style[1][i].device.name == active_device_id) {
            for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++)
                if (elements_properties_and_style[1][i].children[j].id == the_target.id)
                    // Return a copy
                    return { ...elements_properties_and_style[1][i].children[j].style }
            break
        }
    return null
}

// Helper function to update style in elements_properties_and_style[1]
const updateStyleInStorage = (cssKey, storageValue) => {
    console.log('function name is updateStyleInStorage')
    const active_device_id = document.getElementsByClassName('device active')[0].children[0].id
    console.log('before:')
    console.log(JSON.parse(JSON.stringify(elements_properties_and_style))) // Deep log

    if (overall_style) {
        console.log('Updating ALL devices (overall_style = true)')
        // Update style for ALL devices
        for (let i = 0; i < elements_properties_and_style[1].length; i++) {
            for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++) {
                if (elements_properties_and_style[1][i].children[j].id === the_target.id) {
                    // Create new style object
                    elements_properties_and_style[1][i].children[j].style = {
                        ...elements_properties_and_style[1][i].children[j].style,
                        [cssKey]: storageValue
                    }
                }
            }
        }
    } else {
        console.log(`Updating ONLY device: ${active_device_id} (overall_style = false)`)
        // Update style for ONLY the active device
        for (let i = 0; i < elements_properties_and_style[1].length; i++) {
            if (elements_properties_and_style[1][i].device.name === active_device_id) {
                for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++) {
                    if (elements_properties_and_style[1][i].children[j].id === the_target.id) {
                        console.log('Found element, updating style')
                        // Create new style object
                        elements_properties_and_style[1][i].children[j].style = {
                            ...elements_properties_and_style[1][i].children[j].style,
                            [cssKey]: storageValue
                        }
                        break
                    }
                }
                break
            }
        }
    }

    console.log('after:')
    console.log(JSON.parse(JSON.stringify(elements_properties_and_style))) // Deep log
}

function enabling(id, classname, textContent, title, alt, name, value, placeholder, type, target, href, src, maxlength,
    required, disabled, readonly, checked, selected, multiple, autoplay, controls, loop, muted, data_name, data_value, custom_name, custom_value,
    display, position, right, top, bottom, left, width, height, min_width, max_width, z_index,
    flex_direction, flex_justify_content, flex_align_items, flex_grow, flex_shrink, flex_wrap, gap,
    margin_right, margin_top, margin_left, margin_bottom, padding_right, padding_top, padding_left, padding_bottom,
    background_color, background_image, background_size, background_position, background_repeat, opacity,
    gradiant_persent_from_1, gradiant_color1, gradiant_persent_to_1, gradiant_persent_from_2, gradiant_color2, gradiant_persent_to_2, gradiant_persent_from_3, gradiant_color3, gradiant_persent_to_3,
    border_style, border_width, border_color, border_radius,
    right_border_style, right_border_width, right_border_color,
    top_border_style, top_border_width, top_border_color,
    left_border_style, left_border_width, left_border_color,
    bottom_border_style, bottom_border_width, bottom_border_color,
    top_right_border_radius, top_left_border_radius, bottom_right_border_radius, bottom_left_border_radius,
    shadow_color, shadow_x, shadow_y, shadow_blur, shadow_opacity, shadow_inset,
    font_family, font_size, font_weight, font_color, line_height, letter_spacing, text_align, text_decoration, text_transform, word_spacing, text_shadow_color, text_shadow_x, text_shadow_y, text_shadow_blur,
    filter_blur, filter_brightness, filter_contrast, filter_grayscale, filter_sepia, filter_saturate, filter_shadow,
    backdrop_filter_blur, backdrop_filter_brightness, backdrop_filter_contrast, backdrop_filter_grayscale, backdrop_filter_sepia, backdrop_filter_saturate, backdrop_filter_shadow,
    transition, duration, timing_function,
    overflow_x, overflow_y, visibility, cursor, pointer_events, user_select,
    grid_template_columns, grid_template_rows, grid_column, grid_row, grid_gap, grid_autoflow, grid_justify_items, grid_alain_items, label_for = the_target ? the_target.nodeName == 'LABEL' ? true : false : false
) {
    disabling()
    console.log('function name is ' + 'enabling')

    // Find element in storage
    console.log(document.getElementsByClassName('device active'))
    const active_device_id = document.getElementsByClassName('device active')[0].children[0].id
    let elementData = null
    for (let i = 0; i < elements_properties_and_style[1].length; i++)
        if (elements_properties_and_style[1][i].device.name == active_device_id) {
            for (let j = 0; j < elements_properties_and_style[1][i].children.length; j++)
                if (elements_properties_and_style[1][i].children[j].id == the_target.id) {
                    elementData = elements_properties_and_style[1][i].children[j]
                    break
                }
            break
        }

    // Find element in properties array
    let elementProps = null
    for (let i = 0; i < elements_properties_and_style[0].elements.length; i++)
        if (elements_properties_and_style[0].elements[i].properties.id == the_target.id) {
            elementProps = elements_properties_and_style[0].elements[i]
            break
        }
    console.log('testttttt')

    if (!elementData || !elementProps) return

    // Helper to enable and set value for input
    const enableInput = (inputId, storageValue, splitId = false) => {
        const input = document.getElementById(inputId)
        if (!input) return
        input.parentNode.style.display = 'block'
        // input.disabled = false
        input.value = splitId ? storageValue.split('built-it ')[1] : (storageValue || '')
    }

    // Helper to enable and set checkbox
    const enableCheckbox = (inputId, storageValue) => {
        const input = document.getElementById(inputId)
        if (!input) return

        input.parentNode.style.display = 'block'
        // input.disabled = false
        input.checked = storageValue || false
    }

    // Properties
    if (id) {
        enableInput('id', elementProps.properties.id, true)
    }
    else document.getElementById('id').value = ''

    if (label_for) enableInput('for', elementProps.properties.for, true)
    else document.getElementById('for').value = ''

    if (classname) enableInput('classname', elementProps.properties.classname)
    else document.getElementById('classname').value = ''

    if (textContent) enableInput('textContent', elementProps.properties.textContent)
    else document.getElementById('textContent').value = ''

    if (title) enableInput('title', elementProps.properties.title)
    else document.getElementById('title').value = ''

    if (alt) enableInput('alt', elementProps.properties.alt)
    else document.getElementById('alt').value = ''

    if (name) enableInput('name', elementProps.properties.name)
    else document.getElementById('name').value = ''

    if (value) enableInput('value', elementProps.properties.value)
    else document.getElementById('value').value = ''

    if (placeholder) enableInput('placeholder', elementProps.properties.placeholder)
    else document.getElementById('placeholder').value = ''

    if (target) enableInput('target', elementProps.properties.target)
    else document.getElementById('target').value = ''

    if (href) enableInput('href', elementProps.properties.href)
    else document.getElementById('href').value = ''

    if (src) enableInput('src', elementProps.properties.src)
    else document.getElementById('src').value = ''

    if (maxlength) enableInput('maxlength', elementProps.properties.maxlength)
    else document.getElementById('maxlength').value = ''

    if (required) enableCheckbox('required', elementProps.properties.required)
    else document.getElementById('required').checked = false

    if (disabled) enableCheckbox('disabled', elementProps.properties.disabled)
    else document.getElementById('disabled').checked = false

    if (readonly) enableCheckbox('readonly', elementProps.properties.readonly)
    else document.getElementById('readonly').checked = false

    if (checked) enableCheckbox('checked', elementProps.properties.checked)
    else document.getElementById('checked').checked = false

    if (selected) enableCheckbox('selected', elementProps.properties.selected)
    else document.getElementById('selected').checked = false

    if (multiple) enableCheckbox('multiple', elementProps.properties.multiple)
    else document.getElementById('multiple').checked = false

    if (autoplay) enableCheckbox('autoplay', elementProps.properties.autoplay)
    else document.getElementById('autoplay').checked = false

    if (controls) enableCheckbox('controls', elementProps.properties.controls)
    else document.getElementById('controls').checked = false

    if (loop) enableCheckbox('loop', elementProps.properties.loop)
    else document.getElementById('loop').checked = false

    if (muted) enableCheckbox('muted', elementProps.properties.muted)
    else document.getElementById('muted').checked = false

    // Styles - using camelCase keys
    if (display) enableInput('display', elementData.style.display)
    else document.getElementById('display').value = ''

    if (position) enableInput('position', elementData.style.position)
    else document.getElementById('position').value = ''

    if (top) enableInput('top', elementData.style.top)
    else document.getElementById('top').value = ''

    if (right) enableInput('right', elementData.style.right)
    else document.getElementById('right').value = ''

    if (bottom) enableInput('bottom', elementData.style.bottom)
    else document.getElementById('bottom').value = ''

    if (left) enableInput('left', elementData.style.left)
    else document.getElementById('left').value = ''

    if (width) enableInput('width', elementData.style.width)
    else document.getElementById('width').value = ''

    if (height) enableInput('height', elementData.style.height)
    else document.getElementById('height').value = ''

    if (min_width) enableInput('min_width', elementData.style.minWidth)
    else document.getElementById('min_width').value = ''

    if (max_width) enableInput('max_width', elementData.style.maxWidth)
    else document.getElementById('max_width').value = ''

    if (z_index) enableInput('z_index', elementData.style.zIndex)
    else document.getElementById('z_index').value = ''

    if (flex_direction) enableInput('flex_direction', elementData.style.flexDirection)
    else document.getElementById('flex_direction').value = ''

    if (flex_justify_content) enableInput('flex_justify_content', elementData.style.justifyContent)
    else document.getElementById('flex_justify_content').value = ''

    if (flex_align_items) enableInput('flex_align_items', elementData.style.alignItems)
    else document.getElementById('flex_align_items').value = ''

    if (flex_grow) enableInput('flex_grow', elementData.style.flexGrow)
    else document.getElementById('flex_grow').value = ''

    if (flex_shrink) enableInput('flex_shrink', elementData.style.flexShrink)
    else document.getElementById('flex_shrink').value = ''

    if (flex_wrap) enableInput('flex_wrap', elementData.style.flexWrap)
    else document.getElementById('flex_wrap').value = ''

    if (gap) enableInput('gap', elementData.style.gap)
    else document.getElementById('gap').value = ''

    if (margin_top) enableInput('margin_top', elementData.style.marginTop)
    else document.getElementById('margin_top').value = ''

    if (margin_right) enableInput('margin_right', elementData.style.marginRight)
    else document.getElementById('margin_right').value = ''

    if (margin_bottom) enableInput('margin_bottom', elementData.style.marginBottom)
    else document.getElementById('margin_bottom').value = ''

    if (margin_left) enableInput('margin_left', elementData.style.marginLeft)
    else document.getElementById('margin_left').value = ''

    if (padding_top) enableInput('padding_top', elementData.style.paddingTop)
    else document.getElementById('padding_top').value = ''

    if (padding_right) enableInput('padding_right', elementData.style.paddingRight)
    else document.getElementById('padding_right').value = ''

    if (padding_bottom) enableInput('padding_bottom', elementData.style.paddingBottom)
    else document.getElementById('padding_bottom').value = ''

    if (padding_left) enableInput('padding_left', elementData.style.paddingLeft)
    else document.getElementById('padding_left').value = ''

    if (background_color) {
        const input = document.getElementById('background_color')
        input.disabled = false
        input.value = elementData.style.backgroundColor || ''
        const input2 = document.getElementById('background_color2')
        input2.disabled = false
        input2.value = elementData.style.backgroundColor || ''
    } else document.getElementById('background_color').value = ''

    if (background_image) enableInput('background_image', elementData.style.backgroundImage)
    else document.getElementById('background_image').value = ''

    if (background_size) enableInput('background_size', elementData.style.backgroundSize)
    else document.getElementById('background_size').value = ''

    if (background_position) enableInput('background_position', elementData.style.backgroundPosition)
    else document.getElementById('background_position').value = ''

    if (background_repeat) enableInput('background_repeat', elementData.style.backgroundRepeat)
    else document.getElementById('background_repeat').value = ''

    if (opacity) enableInput('opacity', elementData.style.opacity)
    else document.getElementById('opacity').value = ''

    // Gradient
    if (gradiant_persent_from_1) enableInput('gradiant_persent_from_1', elementData.style.gradiantPersentFrom1)
    else document.getElementById('gradiant_persent_from_1').value = ''

    if (gradiant_color1) enableInput('gradiant_color1', elementData.style.gradiantColor1)
    else document.getElementById('gradiant_color1').value = ''

    if (gradiant_persent_to_1) enableInput('gradiant_persent_to_1', elementData.style.gradiantPersentTo1)
    else document.getElementById('gradiant_persent_to_1').value = ''

    if (gradiant_persent_from_2) enableInput('gradiant_persent_from_2', elementData.style.gradiantPersentFrom2)
    else document.getElementById('gradiant_persent_from_2').value = ''

    if (gradiant_color2) enableInput('gradiant_color2', elementData.style.gradiantColor2)
    else document.getElementById('gradiant_color2').value = ''

    if (gradiant_persent_to_2) enableInput('gradiant_persent_to_2', elementData.style.gradiantPersentTo2)
    else document.getElementById('gradiant_persent_to_2').value = ''

    if (gradiant_persent_from_3) enableInput('gradiant_persent_from_3', elementData.style.gradiantPersentFrom3)
    else document.getElementById('gradiant_persent_from_3').value = ''

    if (gradiant_color3) enableInput('gradiant_color3', elementData.style.gradiantColor3)
    else document.getElementById('gradiant_color3').value = ''

    if (gradiant_persent_to_3) enableInput('gradiant_persent_to_3', elementData.style.gradiantPersentTo3)
    else document.getElementById('gradiant_persent_to_3').value = ''

    // Border
    if (border_style) enableInput('border_style', elementData.style.borderStyle)
    else document.getElementById('border_style').value = ''

    if (border_width) enableInput('border_width', elementData.style.borderWidth)
    else document.getElementById('border_width').value = ''

    if (border_color) enableInput('border_color', elementData.style.borderColor)
    else document.getElementById('border_color').value = ''

    if (border_radius) enableInput('border_radius', elementData.style.borderRadius)
    else document.getElementById('border_radius').value = ''

    if (right_border_width) enableInput('right_border_width', elementData.style.borderRightWidth)
    else document.getElementById('right_border_width').value = ''

    if (right_border_color) enableInput('right_border_color', elementData.style.borderRightColor)
    else document.getElementById('right_border_color').value = ''

    if (top_border_width) enableInput('top_border_width', elementData.style.borderTopWidth)
    else document.getElementById('top_border_width').value = ''

    if (top_border_color) enableInput('top_border_color', elementData.style.borderTopColor)
    else document.getElementById('top_border_color').value = ''

    if (left_border_width) enableInput('left_border_width', elementData.style.borderLeftWidth)
    else document.getElementById('left_border_width').value = ''

    if (left_border_color) enableInput('left_border_color', elementData.style.borderLeftColor)
    else document.getElementById('left_border_color').value = ''

    if (bottom_border_width) enableInput('bottom_border_width', elementData.style.borderBottomWidth)
    else document.getElementById('bottom_border_width').value = ''

    if (bottom_border_color) enableInput('bottom_border_color', elementData.style.borderBottomColor)
    else document.getElementById('bottom_border_color').value = ''

    if (top_right_border_radius) enableInput('top_right_border_radius', elementData.style.borderTopRightRadius)
    else document.getElementById('top_right_border_radius').value = ''

    if (top_left_border_radius) enableInput('top_left_border_radius', elementData.style.borderTopLeftRadius)
    else document.getElementById('top_left_border_radius').value = ''

    if (bottom_right_border_radius) enableInput('bottom_right_border_radius', elementData.style.borderBottomRightRadius)
    else document.getElementById('bottom_right_border_radius').value = ''

    if (bottom_left_border_radius) enableInput('bottom_left_border_radius', elementData.style.borderBottomLeftRadius)
    else document.getElementById('bottom_left_border_radius').value = ''

    // Shadow
    if (shadow_color) enableInput('shadow_color', elementData.style.shadowColor)
    else document.getElementById('shadow_color').value = ''

    if (shadow_x) enableInput('shadow_x', elementData.style.shadowX)
    else document.getElementById('shadow_x').value = ''

    if (shadow_y) enableInput('shadow_y', elementData.style.shadowY)
    else document.getElementById('shadow_y').value = ''

    if (shadow_blur) enableInput('shadow_blur', elementData.style.shadowBlur)
    else document.getElementById('shadow_blur').value = ''

    if (shadow_opacity) enableInput('shadow_opacity', elementData.style.shadowOpacity)
    else document.getElementById('shadow_opacity').value = ''

    if (shadow_inset) enableCheckbox('shadow_inset', elementData.style.shadowInset)
    else document.getElementById('shadow_inset').checked = false

    // Font
    if (font_family) {
        const input = document.getElementById('font_family')
        input.disabled = false
        input.value = elementData.style.fontFamily || ''
        const input2 = document.getElementById('font_family2')
        input2.disabled = false
        input2.value = elementData.style.fontFamily || ''
    } else document.getElementById('font_family').value = ''

    if (font_size) {
        const input = document.getElementById('font_size')
        input.disabled = false
        input.value = elementData.style.fontSize || ''
        const input2 = document.getElementById('font_size2')
        input2.disabled = false
        input2.value = elementData.style.fontSize || ''
    } else document.getElementById('font_size').value = ''

    if (font_weight) enableInput('font_weight', elementData.style.fontWeight)
    else document.getElementById('font_weight').value = ''

    if (font_color) enableInput('font_color', elementData.style.color)
    else document.getElementById('font_color').value = ''

    if (line_height) enableInput('line_height', elementData.style.lineHeight)
    else document.getElementById('line_height').value = ''

    if (letter_spacing) enableInput('letter_spacing', elementData.style.letterSpacing)
    else document.getElementById('letter_spacing').value = ''

    if (text_align) enableInput('text_align', elementData.style.textAlign)
    else document.getElementById('text_align').value = ''

    // In your enabling function, add this after enabling text decoration:
    // In your enabling function, after enabling text_decoration, add:
    if (text_decoration) {
        const input = document.getElementById('text_decoration')
        // input.parentNode.style.display = 'block'
        input.value = elementData.style.textDecoration || ''

        // document.getElementById('text_decoration2').parentNode.style.display = 'block'
        // document.getElementById('font_weight2').parentNode.style.display = 'block'
        // document.getElementById('font_style').parentNode.style.display = 'block'
        // document.getElementById('text_align_justify').parentNode.style.display = 'block'
        // document.getElementById('text_align_left').parentNode.style.display = 'block'
        // document.getElementById('text_align_right').parentNode.style.display = 'block'
        // document.getElementById('text_align_center').parentNode.style.display = 'block'

        // Set active states for toggle buttons
        const hasUnderline = elementData.style.textDecoration && elementData.style.textDecoration.includes('underline')
        const isBold = elementData.style.fontWeight === 'bold' || elementData.style.fontWeight === '700' || parseInt(elementData.style.fontWeight) >= 700
        const isItalic = elementData.style.fontStyle === 'italic' || elementData.style.fontStyle === 'oblique'

        const underlineBtn = document.getElementById('text_decoration2')
        const boldBtn = document.getElementById('font_weight2')
        const italicBtn = document.getElementById('font_style')

        if (underlineBtn) {
            if (hasUnderline) underlineBtn.classList.add('active')
            else underlineBtn.classList.remove('active')
        }
        if (boldBtn) {
            if (isBold) boldBtn.classList.add('active')
            else boldBtn.classList.remove('active')
        }
        if (italicBtn) {
            if (isItalic) italicBtn.classList.add('active')
            else italicBtn.classList.remove('active')
        }

        // Set active state for text align
        const textAlign = elementData.style.textAlign || 'left'
        document.querySelectorAll('[id^="text_align_"]').forEach(btn => {
            btn.classList.remove('active')
        })
        const activeAlignBtn = document.getElementById(`text_align_${textAlign}`)
        if (activeAlignBtn) activeAlignBtn.classList.add('active')
    } else document.getElementById('text_decoration').value = ''

    if (text_transform) enableInput('text_transform', elementData.style.textTransform)
    else document.getElementById('text_transform').value = ''

    if (word_spacing) enableInput('word_spacing', elementData.style.wordSpacing)
    else document.getElementById('word_spacing').value = ''

    // Text shadow
    if (text_shadow_color) enableInput('text_shadow_color', elementData.style.textShadowColor)
    else document.getElementById('text_shadow_color').value = ''

    if (text_shadow_x) enableInput('text_shadow_x', elementData.style.textShadowX)
    else document.getElementById('text_shadow_x').value = ''

    if (text_shadow_y) enableInput('text_shadow_y', elementData.style.textShadowY)
    else document.getElementById('text_shadow_y').value = ''

    if (text_shadow_blur) enableInput('text_shadow_blur', elementData.style.textShadowBlur)
    else document.getElementById('text_shadow_blur').value = ''

    // Filters
    if (filter_blur) enableInput('filter_blur', elementData.style.filterBlur)
    else document.getElementById('filter_blur').value = ''

    if (filter_brightness) enableInput('filter_brightness', elementData.style.filterBrightness)
    else document.getElementById('filter_brightness').value = ''

    if (filter_contrast) enableInput('filter_contrast', elementData.style.filterContrast)
    else document.getElementById('filter_contrast').value = ''

    if (filter_grayscale) enableInput('filter_grayscale', elementData.style.filterGrayscale)
    else document.getElementById('filter_grayscale').value = ''

    if (filter_sepia) enableInput('filter_sepia', elementData.style.filterSepia)
    else document.getElementById('filter_sepia').value = ''

    if (filter_saturate) enableInput('filter_saturate', elementData.style.filterSaturate)
    else document.getElementById('filter_saturate').value = ''

    if (filter_shadow) enableInput('filter_shadow', elementData.style.filterShadow)
    else document.getElementById('filter_shadow').value = ''

    // Backdrop filters
    if (backdrop_filter_blur) enableInput('backdrop_filter_blur', elementData.style.backdropFilterBlur)
    else document.getElementById('backdrop_filter_blur').value = ''

    if (backdrop_filter_brightness) enableInput('backdrop_filter_brightness', elementData.style.backdropFilterBrightness)
    else document.getElementById('backdrop_filter_brightness').value = ''

    if (backdrop_filter_contrast) enableInput('backdrop_filter_contrast', elementData.style.backdropFilterContrast)
    else document.getElementById('backdrop_filter_contrast').value = ''

    if (backdrop_filter_grayscale) enableInput('backdrop_filter_grayscale', elementData.style.backdropFilterGrayscale)
    else document.getElementById('backdrop_filter_grayscale').value = ''

    if (backdrop_filter_sepia) enableInput('backdrop_filter_sepia', elementData.style.backdropFilterSepia)
    else document.getElementById('backdrop_filter_sepia').value = ''

    if (backdrop_filter_saturate) enableInput('backdrop_filter_saturate', elementData.style.backdropFilterSaturate)
    else document.getElementById('backdrop_filter_saturate').value = ''

    if (backdrop_filter_shadow) enableInput('backdrop_filter_shadow', elementData.style.backdropFilterShadow)
    else document.getElementById('backdrop_filter_shadow').value = ''

    // Transition
    if (transition) enableInput('transition', elementData.style.transition)
    else document.getElementById('transition').value = ''

    if (duration) enableInput('duration', elementData.style.transitionDuration)
    else document.getElementById('duration').value = ''

    if (timing_function) enableInput('timing_function', elementData.style.transitionTimingFunction)
    else document.getElementById('timing_function').value = ''

    // Other
    if (overflow_x) enableInput('overflow_x', elementData.style.overflowX)
    else document.getElementById('overflow_x').value = ''

    if (overflow_y) enableInput('overflow_y', elementData.style.overflowY)
    else document.getElementById('overflow_y').value = ''

    if (visibility) enableInput('visibility', elementData.style.visibility)
    else document.getElementById('visibility').value = ''

    if (cursor) enableInput('cursor', elementData.style.cursor)
    else document.getElementById('cursor').value = ''

    if (pointer_events) enableInput('pointer_events', elementData.style.pointerEvents)
    else document.getElementById('pointer_events').value = ''

    if (user_select) enableInput('user_select', elementData.style.userSelect)
    else document.getElementById('user_select').value = ''

    // Grid
    if (grid_template_columns) enableInput('grid_template_columns', elementData.style.gridTemplateColumns)
    else document.getElementById('grid_template_columns').value = ''

    if (grid_template_rows) enableInput('grid_template_rows', elementData.style.gridTemplateRows)
    else document.getElementById('grid_template_rows').value = ''

    if (grid_column) enableInput('grid_column', elementData.style.gridColumn)
    else document.getElementById('grid_column').value = ''

    if (grid_row) enableInput('grid_row', elementData.style.gridRow)
    else document.getElementById('grid_row').value = ''

    if (grid_gap) enableInput('grid_gap', elementData.style.gridGap)
    else document.getElementById('grid_gap').value = ''

    if (grid_autoflow) enableInput('grid_autoflow', elementData.style.gridAutoFlow)
    else document.getElementById('grid_autoflow').value = ''

    if (grid_justify_items) enableInput('grid_justify_items', elementData.style.gridJustifyItems)
    else document.getElementById('grid_justify_items').value = ''

    if (grid_alain_items) enableInput('grid_alain_items', elementData.style.gridAlignItems)
    else document.getElementById('grid_alain_items').value = ''
}

function upper_css(e) {
    if (!the_target) return

    const inputId = e.target.id || e.currentTarget.id

    // Map input IDs to their corresponding style properties
    const styleMap = {
        'font_family2': {
            type: 'font_family',
            getValue: () => e.target.value
        },
        'font_size2': {
            type: 'font_size',
            getValue: () => e.target.value
        },
        'font_weight2': {
            type: 'font_weight',
            getValue: () => {
                // Get current value from storage
                const style = getElementStyle()
                const current = style?.fontWeight || 'normal'

                const isBold = current === 'bold' || current === '700' || parseInt(current) >= 700
                const newValue = isBold ? 'normal' : 'bold'

                console.log('Font weight toggle:', current, '->', newValue)
                return newValue
            }
        },
        'font_style': {
            type: 'font_style_toggle',
            getValue: () => {
                // Get current value from storage
                const style = getElementStyle()
                const current = style?.fontStyle || 'normal'

                const isItalic = current === 'italic' || current === 'oblique'
                const newValue = isItalic ? 'normal' : 'italic'

                console.log('Font style toggle:', current, '->', newValue)
                return newValue
            }
        },
        'text_decoration2': {
            type: 'text_decoration',
            getValue: () => {
                // Get current value from storage
                const style = getElementStyle()
                const current = style?.textDecoration || 'none'

                const hasUnderline = current && current.includes('underline')
                const newValue = hasUnderline ? 'none' : 'underline'

                console.log('Text decoration toggle:', current, '->', newValue)
                return newValue
            }
        },
        'text_align_left': { type: 'text_align', getValue: () => 'left' },
        'text_align_center': { type: 'text_align', getValue: () => 'center' },
        'text_align_right': { type: 'text_align', getValue: () => 'right' },
        'text_align_justify': { type: 'text_align', getValue: () => 'justify' },
        'background_color2': { type: 'background_color', getValue: () => e.target.value },
        'font_color2': { type: 'font_color', getValue: () => e.target.value }
    }

    const mapping = styleMap[inputId]
    if (!mapping) return

    const value = mapping.getValue()

    // Call the_target_changing to update the style
    the_target_changing(mapping.type, value)

    // Update the corresponding main input fields to stay in sync
    switch (inputId) {
        case 'font_family2':
            const fontFamilyInput = document.getElementById('font_family')
            if (fontFamilyInput) fontFamilyInput.value = value
            break

        case 'font_size2':
            const fontSizeInput = document.getElementById('font_size')
            if (fontSizeInput) fontSizeInput.value = value
            break

        case 'font_weight2':
            const fontWeightInput = document.getElementById('font_weight')
            if (fontWeightInput) fontWeightInput.value = value

            // Update button visual state (toggle 'active' class)
            const boldBtn = document.getElementById('font_weight2')
            if (boldBtn) {
                if (value === 'bold' || value === '700') {
                    boldBtn.classList.add('active')
                } else {
                    boldBtn.classList.remove('active')
                }
            }
            break

        case 'font_style':
            // Update button visual state
            const italicBtn = document.getElementById('font_style')
            if (italicBtn) {
                if (value === 'italic' || value === 'oblique') {
                    italicBtn.classList.add('active')
                } else {
                    italicBtn.classList.remove('active')
                }
            }
            break

        case 'text_decoration2':
            const textDecoInput = document.getElementById('text_decoration')
            if (textDecoInput) textDecoInput.value = value

            // Update button visual state
            const underlineBtn = document.getElementById('text_decoration2')
            if (underlineBtn) {
                if (value === 'underline') {
                    underlineBtn.classList.add('active')
                } else {
                    underlineBtn.classList.remove('active')
                }
            }
            break

        case 'text_align_left':
        case 'text_align_center':
        case 'text_align_right':
        case 'text_align_justify':
            const textAlignInput = document.getElementById('text_align')
            if (textAlignInput) textAlignInput.value = value

            // Update all text align buttons
            document.querySelectorAll('[id^="text_align_"]').forEach(btn => {
                btn.classList.remove('active')
            })
            e.target.classList.add('active')
            break

        case 'background_color2':
            const bgColorInput = document.getElementById('background_color')
            if (bgColorInput) bgColorInput.value = value
            break

        case 'font_color2':
            const fontColorInput = document.getElementById('font_color')
            if (fontColorInput) fontColorInput.value = value
            break
    }
}

function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '')
    let r, g, b
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        return hex;
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


const move = new Moveable(design_page.parentNode, {
    target: design_page,
    draggable: true,
    origin: false,
    useResizeObserver: true
}).on("drag", ({
    target, left, top
}) => {
    target.style.left = `${left}px`;
    target.style.top = `${top}px`;
}).on("dragEnd", () => {
    const device = document.getElementsByClassName('device active')
    var index = 0
    for (; index < devices_sizes.length; index++)
        if (devices_sizes[index].name == device[0].children[0].textContent) {
            devices_sizes[index].top = design_page.offsetTop
            devices_sizes[index].left = design_page.offsetLeft
            break;
        }
    for (let i = 0; i < elements_properties_and_style[1].length; i++) {
        // Bug #4 Fix: Compare with .name property, not the object itself
        if (elements_properties_and_style[1][i].device.name == devices_sizes[index].name) {
            elements_properties_and_style[1][i].device = devices_sizes[index]
            break;
        }
    }
})
move.target.parentNode.style.borderWidth = '0px'

move.selfElement.children[0].hidden = true
move.selfElement.children[1].hidden = true
move.selfElement.children[2].hidden = true
move.selfElement.children[3].hidden = true

const moveables_elements = []
design_page.addEventListener('click', de_activate)
mainarea.addEventListener('click', de_activate)


function add_moveable(data) {
    if (data.type == 'delete') {
        for (let i = 0; i < moveables_elements.length; i++)
            if (moveables_elements[i].target.id == data.id) {
                moveables_elements[i].target = null
                moveables_elements.splice(i, 1)
                break
            }
        return
    }
    else if (data.type == 'update_id') {
        const { oldId, newId } = data
        for (let i = 0; i < moveables_elements.length; i++) {
            if (moveables_elements[i].target && moveables_elements[i].target.id === oldId) {
                // The DOM element ID is already updated, just update reference
                moveables_elements[i].target = document.getElementById(newId)
                console.log(`Moveable updated: ${oldId} → ${newId}`)
                break
            }
        }
    }
    else if (data.type == 'disable_drag') {
        for (let i = 0; i < moveables_elements.length; i++) {
            if (moveables_elements[i].target.id == data.id) {
                moveables_elements[i].draggable = false
                moveables_elements[i].resizable = false
                moveables_elements[i].rotatable = false
                break
            }
        }
    }
    else if (data.type == 'enable_drag') {
        for (let i = 0; i < moveables_elements.length; i++) {
            if (moveables_elements[i].target.id == data.id) {
                moveables_elements[i].draggable = true
                moveables_elements[i].resizable = true
                moveables_elements[i].rotatable = true
                break
            }
        }
    }

    else {
        id = data.id
        const element = document.getElementById(id)
        // first
        de_activate()

        moveables_elements[moveables_elements.length] = new Moveable(element.parentNode, {
            target: element,
            draggable: true,
            rotatable: true,
            resizable: true,
            origin: false,
            useResizeObserver: true,
            hideDefaultLines: true,

            snappable: true,
            snapGap: true,
            snapThreshold: 5,
            snapDirections: {
                top: true,
                left: true,
                bottom: true,
                right: true,
                center: true,
                middle: true
            },
            elementSnapDirections: {
                top: true,
                left: true,
                bottom: true,
                right: true,
                center: true,
                middle: true
            },
            elementGuidelines: [...document.querySelectorAll(".canvas-element")]
        });
        // moveables_elements[moveables_elements.length - 1].target.parentNode.style.borderWidth = '0px'

        moveables_elements[moveables_elements.length - 1].selfElement.children[0].hidden = true
        moveables_elements[moveables_elements.length - 1].selfElement.children[1].hidden = true
        moveables_elements[moveables_elements.length - 1].selfElement.children[2].hidden = true
        moveables_elements[moveables_elements.length - 1].selfElement.children[3].hidden = true


        // Resizing
        moveables_elements[moveables_elements.length - 1]
            .on("resize", e => {
                e.target.style.width = `${(e.width)}px`;
                e.target.style.height = `${e.height}px`;
                e.target.style.transform = e.drag.transform;
                const the_width_input = document.getElementById('the_width_input')
                if (the_width_input)
                    the_width_input.value = getRightDimentions(parseFloat(e.target.style.width.split('px')[0]))
                const the_height_input = document.getElementById('the_height_input')
                if (the_height_input)
                    the_height_input.value = getRightDimentions(parseFloat(e.target.style.height.split('px')[0]))

                let top, left
                try {
                    top = parseFloat(e.target.style.transform.split('translate(')[1].split(',')[1].split('px')[0])
                } catch (err) {
                    top = 0
                }
                try {
                    left = parseFloat(e.target.style.transform.split('translate(')[1].split(',')[0].split('px')[0])
                } catch (err) {
                    left = 0
                }
                top = parseFloat(e.target.style.top.split('px')[0]) + top
                left = parseFloat(e.target.style.left.split('px')[0]) + left

                const the_top_input = document.getElementById('the_top_input')
                if (the_top_input)
                    the_top_input.value = getRightDimentions(top)
                const the_left_input = document.getElementById('the_left_input')
                if (the_left_input)
                    the_left_input.value = getRightDimentions(left)
            }).on('resizeEnd', ({ target }) => {
                // Fix Issue #6: Improved transform parsing with NaN protection
                let top = 0, left = 0, rotate = 0
                const transform = target.style.transform || ''

                // Parse translate values
                const translateMatch = transform.match(/translate\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/)
                if (translateMatch) {
                    left = parseFloat(translateMatch[1]) || 0
                    top = parseFloat(translateMatch[2]) || 0
                }

                // Parse rotate value
                const rotateMatch = transform.match(/rotate\(\s*([^)]+)\s*\)/)
                if (rotateMatch) {
                    rotate = parseFloat(rotateMatch[1]) || 0
                }

                // Update position
                const currentTop = parseFloat(target.style.top) || 0
                const currentLeft = parseFloat(target.style.left) || 0
                target.style.top = (currentTop + top) + 'px'
                target.style.left = (currentLeft + left) + 'px'

                // Preserve rotation only
                target.style.transform = rotate !== 0 ? `rotate(${rotate}deg)` : ''

                updateStyleInStorage('width', the_target.offsetWidth)
                updateStyleInStorage('height', the_target.offsetHeight)
                updateStyleInStorage('top', the_target.offsetTop)
                updateStyleInStorage('left', the_target.offsetLeft)
            })

        // Rotating
        moveables_elements[moveables_elements.length - 1]
            .on("rotate", ({ target, beforeDelta, delta, dist, transform, clientX, clientY }) => {
                target.style.transform = transform
            }).on("rotateEnd", (e) => {
                updateStyleInStorage('transform', the_target.style.transform)
            })

        // Dragging
        moveables_elements[moveables_elements.length - 1]
            .on("drag", ({
                target, transform,
                left, top, right, bottom,
                beforeDelta, beforeDist, delta, dist,
                clientX, clientY,
            }) => {
                target.style.left = `${left}px`;
                target.style.top = `${top}px`;
                const the_top_input = document.getElementById('the_top_input')
                if (the_top_input)
                    the_top_input.value = getRightDimentions(top)
                const the_left_input = document.getElementById('the_left_input')
                if (the_left_input)
                    the_left_input.value = getRightDimentions(left)
            }).on("dragEnd", ({ target, isDrag, clientX, clientY }) => {
                updateStyleInStorage('top', the_target.offsetTop)
                updateStyleInStorage('left', the_target.offsetLeft)
            })

        element.addEventListener('click', make_element_moveable)
        element.addEventListener('dblclick', make_element_moveable)
        element.addEventListener('mousedown', make_element_moveable)
        enable({ target: element })
        element.click()
        element.click()
        element.click()
    }
}

function make_element_moveable(e) {
    e.stopPropagation()
    let index
    for (let i = 0; i < moveables_elements.length; i++) {
        if (moveables_elements[i].target.id == e.target.id) {
            index = i
            moveables_elements[i].draggable = true
            moveables_elements[i].resizable = true
            moveables_elements[i].rotatable = true
            moveables_elements[i].snappable = true
            moveables_elements[i].snapGap = true
            moveables_elements[i].snapThreshold = 5
            moveables_elements[i].snapDirections = {
                top: true,
                left: true,
                bottom: true,
                right: true,
                center: true,
                middle: true
            }
            moveables_elements[i].elementSnapDirections = {
                top: true,
                left: true,
                bottom: true,
                right: true,
                center: true,
                middle: true
            }
            moveables_elements[i].target.classList.remove('canvas-element')
        }
        else {
            moveables_elements[i].draggable = false
            moveables_elements[i].resizable = false
            moveables_elements[i].rotatable = false
            // moveables_elements[i].snappable = false
            // moveables_elements[i].snapGap = false
            // moveables_elements[i].snapThreshold = 0
            // moveables_elements[i].snapDirections = {
            //     top: false,
            //     left: false,
            //     bottom: false,
            //     right: false,
            //     center: false,
            //     middle: false
            // }
            // moveables_elements[i].elementSnapDirections = {
            //     top: false,
            //     left: false,
            //     bottom: false,
            //     right: false,
            //     center: false,
            //     middle: false
            // }
            moveables_elements[i].target.classList.add('canvas-element')
        }
    }
    moveables_elements[index].elementGuidelines = [...document.querySelectorAll(".canvas-element")]

    // Input Selection Workaround
    if (e.target.tagName === 'INPUT' && !e.target.fixing_click) {
        e.target.fixing_click = true
        setTimeout(() => {
            const controls = document.getElementsByClassName('moveable-control')
            if (controls.length > 0) {
                // Click a handle twise to insure(usually the first one is fine, or specifically a corner)
                controls[0].click()
                controls[0].click()
                // Re-click the input to restore focus/selection
                e.target.click()
                e.target.click()
            }
            e.target.fixing_click = false
        }, 50)
    }
}

function de_activate() {
    for (let i = 0; i < moveables_elements.length; i++) {
        moveables_elements[i].draggable = false
        moveables_elements[i].resizable = false
        moveables_elements[i].rotatable = false
        // moveables_elements[i].snappable = false
        // moveables_elements[i].snapGap = false
        // moveables_elements[i].snapThreshold = 0
        // moveables_elements[i].snapDirections = {
        //     top: false,
        //     left: false,
        //     bottom: false,
        //     right: false,
        //     center: false,
        //     middle: false
        // }
        // moveables_elements[i].elementSnapDirections = {
        //     top: false,
        //     left: false,
        //     bottom: false,
        //     right: false,
        //     center: false,
        //     middle: false
        // }
        moveables_elements[i].target.classList.add('canvas-element')
    }
}


// needs fix
function getRightDimentions(value) {
    // go for all the list and change the size by %
    const area_data = {
        max_height: 10000,
        max_width: 10000,
        min_height: area_father.offsetHeight * 2,
        min_width: area_father.offsetWidth * 2
    }
    const heightdiff = mainarea.offsetHeight / area_data.max_height
    value = parseInt(value / heightdiff)
    return value
}

/**
 * CLEAN CODE GENERATOR
 * 
 * No zoom calculations needed!
 * Storage contains true dimensions at 100% zoom always.
 * Export is straightforward - just output what's stored.
 */

function generateCode() {
    if (!elements_properties_and_style || elements_properties_and_style.length < 2) {
        console.error('Invalid elements_properties_and_style structure')
        return null
    }

    const devices = elements_properties_and_style[1]

    // Generate CSS with media queries for all devices
    const css = generateResponsiveCSS(elements_properties_and_style[0].elements, devices)

    // Generate HTML
    const html = generateHTML(elements_properties_and_style[0].elements)

    // Generate full document
    const fullCode = generateFullDocument(html, css)

    return fullCode
}

/**
 * Generate responsive CSS for all devices
 * SIMPLIFIED - No zoom ratio calculations!
 */
function generateResponsiveCSS(elements, devices) {
    let css = ''

    if (devices.length === 1) {
        // Single device - generate global CSS
        css += generateCSSForDevice(elements, devices[0].children)
    } else {
        // Multiple devices - largest gets global, others get media queries
        const sortedDevices = [...devices].sort((a, b) => b.device.width - a.device.width)

        // Largest device gets global CSS
        css += '/* Global styles (largest device) */\n'
        css += generateCSSForDevice(elements, sortedDevices[0].children)
        css += '\n'

        // Other devices get media queries
        for (let i = 1; i < sortedDevices.length; i++) {
            const device = sortedDevices[i]
            css += `/* Styles for ${device.device.name} */\n`
            css += `@media (max-width: ${device.device.width}px) {\n`
            css += generateCSSForDevice(elements, device.children, 1)
            css += '}\n\n'
        }
    }

    return css
}

/**
 * Generate CSS for a specific device
 * Just export dimensions as-is from storage
 */
function generateCSSForDevice(elements, deviceStyles, indentLevel = 0) {
    let css = ''
    const indent = '  '.repeat(indentLevel)

    // Create a map of element IDs to their styles
    const styleMap = new Map()
    deviceStyles.forEach(styleEntry => {
        styleMap.set(styleEntry.id, styleEntry.style)
    })

    // Generate CSS for each element
    elements.forEach(element => {
        const elementId = element.properties.id.replace('built-it ', '')
        const style = styleMap.get(element.properties.id)

        if (style && Object.keys(style).length > 0) {
            css += `${indent}#${elementId} {\n`
            css += convertStyleToCSS(style, indentLevel + 1)
            css += `${indent}}\n\n`
        }
    })

    return css
}

/**
 * Convert JavaScript style object to CSS text
 */
function convertStyleToCSS(style, indentLevel = 1) {
    const indent = '  '.repeat(indentLevel)
    let cssText = ''

    // Style property mapping
    const styleHandlers = {
        // Position & Layout
        position: (val) => `${indent}position: ${val};\n`,
        display: (val) => `${indent}display: ${val};\n`,
        top: (val) => `${indent}top: ${val}px;\n`,
        right: (val) => `${indent}right: ${val}px;\n`,
        bottom: (val) => `${indent}bottom: ${val}px;\n`,
        left: (val) => `${indent}left: ${val}px;\n`,
        width: (val) => `${indent}width: ${val}px;\n`,
        height: (val) => `${indent}height: ${val}px;\n`,
        minWidth: (val) => `${indent}min-width: ${val}px;\n`,
        maxWidth: (val) => `${indent}max-width: ${val}px;\n`,
        minHeight: (val) => `${indent}min-height: ${val}px;\n`,
        maxHeight: (val) => `${indent}max-height: ${val}px;\n`,
        zIndex: (val) => `${indent}z-index: ${val};\n`,

        // Flexbox
        flexDirection: (val) => `${indent}flex-direction: ${val};\n`,
        flexWrap: (val) => `${indent}flex-wrap: ${val};\n`,
        justifyContent: (val) => `${indent}justify-content: ${val};\n`,
        alignItems: (val) => `${indent}align-items: ${val};\n`,
        flexGrow: (val) => `${indent}flex-grow: ${val};\n`,
        flexShrink: (val) => `${indent}flex-shrink: ${val};\n`,
        gap: (val) => `${indent}gap: ${val}px;\n`,

        // Grid
        gridTemplateColumns: (val) => `${indent}grid-template-columns: ${val};\n`,
        gridTemplateRows: (val) => `${indent}grid-template-rows: ${val};\n`,
        gridColumn: (val) => `${indent}grid-column: ${val};\n`,
        gridRow: (val) => `${indent}grid-row: ${val};\n`,
        gridGap: (val) => `${indent}grid-gap: ${val}px;\n`,
        columnGap: (val) => `${indent}column-gap: ${val}px;\n`,
        rowGap: (val) => `${indent}row-gap: ${val}px;\n`,
        gridAutoFlow: (val) => `${indent}grid-auto-flow: ${val};\n`,
        gridJustifyItems: (val) => `${indent}grid-justify-items: ${val};\n`,
        gridAlignItems: (val) => `${indent}grid-align-items: ${val};\n`,

        // Margin
        marginTop: (val) => `${indent}margin-top: ${val}px;\n`,
        marginRight: (val) => `${indent}margin-right: ${val}px;\n`,
        marginBottom: (val) => `${indent}margin-bottom: ${val}px;\n`,
        marginLeft: (val) => `${indent}margin-left: ${val}px;\n`,

        // Padding
        paddingTop: (val) => `${indent}padding-top: ${val}px;\n`,
        paddingRight: (val) => `${indent}padding-right: ${val}px;\n`,
        paddingBottom: (val) => `${indent}padding-bottom: ${val}px;\n`,
        paddingLeft: (val) => `${indent}padding-left: ${val}px;\n`,

        // Background
        backgroundColor: (val) => `${indent}background-color: ${val};\n`,
        backgroundImage: (val) => `${indent}background-image: url('${val}');\n`,
        backgroundSize: (val) => `${indent}background-size: ${val};\n`,
        backgroundPosition: (val) => `${indent}background-position: ${val};\n`,
        backgroundRepeat: (val) => `${indent}background-repeat: ${val};\n`,
        opacity: (val) => `${indent}opacity: ${val};\n`,

        // Border
        borderStyle: (val) => `${indent}border-style: ${val};\n`,
        borderWidth: (val) => `${indent}border-width: ${val}px;\n`,
        borderColor: (val) => `${indent}border-color: ${val};\n`,
        borderRadius: (val) => `${indent}border-radius: ${val}px;\n`,
        borderRightWidth: (val) => `${indent}border-right-width: ${val}px;\n`,
        borderRightColor: (val) => `${indent}border-right-color: ${val};\n`,
        borderTopWidth: (val) => `${indent}border-top-width: ${val}px;\n`,
        borderTopColor: (val) => `${indent}border-top-color: ${val};\n`,
        borderLeftWidth: (val) => `${indent}border-left-width: ${val}px;\n`,
        borderLeftColor: (val) => `${indent}border-left-color: ${val};\n`,
        borderBottomWidth: (val) => `${indent}border-bottom-width: ${val}px;\n`,
        borderBottomColor: (val) => `${indent}border-bottom-color: ${val};\n`,
        borderTopRightRadius: (val) => `${indent}border-top-right-radius: ${val}px;\n`,
        borderTopLeftRadius: (val) => `${indent}border-top-left-radius: ${val}px;\n`,
        borderBottomRightRadius: (val) => `${indent}border-bottom-right-radius: ${val}px;\n`,
        borderBottomLeftRadius: (val) => `${indent}border-bottom-left-radius: ${val}px;\n`,

        // Typography
        fontFamily: (val) => `${indent}font-family: ${val};\n`,
        fontSize: (val) => `${indent}font-size: ${val}px;\n`,
        fontWeight: (val) => `${indent}font-weight: ${val};\n`,
        fontStyle: (val) => `${indent}font-style: ${val};\n`,
        color: (val) => `${indent}color: ${val};\n`,
        lineHeight: (val) => `${indent}line-height: ${val}px;\n`,
        letterSpacing: (val) => `${indent}letter-spacing: ${val}px;\n`,
        wordSpacing: (val) => `${indent}word-spacing: ${val}px;\n`,
        textAlign: (val) => `${indent}text-align: ${val};\n`,
        textDecoration: (val) => `${indent}text-decoration: ${val};\n`,
        textTransform: (val) => `${indent}text-transform: ${val};\n`,

        // Transform & Transition
        transform: (val) => `${indent}transform: ${val};\n`,
        transition: (val) => `${indent}transition: ${val};\n`,
        transitionDuration: (val) => `${indent}transition-duration: ${val}ms;\n`,
        transitionTimingFunction: (val) => `${indent}transition-timing-function: ${val};\n`,

        // Other
        overflowX: (val) => `${indent}overflow-x: ${val};\n`,
        overflowY: (val) => `${indent}overflow-y: ${val};\n`,
        visibility: (val) => `${indent}visibility: ${val};\n`,
        cursor: (val) => `${indent}cursor: ${val};\n`,
        pointerEvents: (val) => `${indent}pointer-events: ${val};\n`,
        userSelect: (val) => `${indent}user-select: ${val};\n`,
        outline: (val) => `${indent}outline: ${val};\n`,
        outlineWidth: (val) => `${indent}outline-width: ${val}px;\n`,
        outlineOffset: (val) => `${indent}outline-offset: ${val}px;\n`
    }

    // Handle composite properties

    // Box Shadow
    if (style.shadowX !== undefined || style.shadowY !== undefined || style.shadowBlur !== undefined) {
        const parts = []
        if (style.shadowInset) parts.push('inset')
        parts.push(`${style.shadowX || 0}px`)
        parts.push(`${style.shadowY || 0}px`)
        parts.push(`${style.shadowBlur || 0}px`)
        if (style.shadowSpread !== undefined) {
            parts.push(`${style.shadowSpread}px`)
        }

        let color = style.shadowColor || '#000000'
        if (style.shadowOpacity !== undefined && style.shadowOpacity < 1) {
            color = hexToRgba(color, style.shadowOpacity)
        }
        parts.push(color)

        cssText += `${indent}box-shadow: ${parts.join(' ')};\n`
    }

    // Text Shadow
    if (style.textShadowX !== undefined || style.textShadowY !== undefined) {
        const parts = [
            `${style.textShadowX || 0}px`,
            `${style.textShadowY || 0}px`,
            `${style.textShadowBlur || 0}px`,
            style.textShadowColor || '#000000'
        ]
        cssText += `${indent}text-shadow: ${parts.join(' ')};\n`
    }

    // Gradient
    if (style.gradiantColor1) {
        const stops = []
        if (style.gradiantColor1) {
            stops.push(`${style.gradiantColor1} ${style.gradiantPersentFrom1 || 0}%`)
            if (style.gradiantPersentTo1 && style.gradiantPersentTo1 !== style.gradiantPersentFrom1) {
                stops.push(`${style.gradiantColor1} ${style.gradiantPersentTo1}%`)
            }
        }
        if (style.gradiantColor2) {
            stops.push(`${style.gradiantColor2} ${style.gradiantPersentFrom2 || 0}%`)
            if (style.gradiantPersentTo2 && style.gradiantPersentTo2 !== style.gradiantPersentFrom2) {
                stops.push(`${style.gradiantColor2} ${style.gradiantPersentTo2}%`)
            }
        }
        if (style.gradiantColor3) {
            stops.push(`${style.gradiantColor3} ${style.gradiantPersentFrom3 || 0}%`)
            if (style.gradiantPersentTo3 && style.gradiantPersentTo3 !== style.gradiantPersentFrom3) {
                stops.push(`${style.gradiantColor3} ${style.gradiantPersentTo3}%`)
            }
        }
        if (stops.length > 0) {
            const direction = style.gradiantDirection || 'to right'
            cssText += `${indent}background-image: linear-gradient(${direction}, ${stops.join(', ')});\n`
        }
    }

    // Filter
    const filters = []
    if (style.filterBlur) filters.push(`blur(${style.filterBlur}px)`)
    if (style.filterBrightness) filters.push(`brightness(${style.filterBrightness}%)`)
    if (style.filterContrast) filters.push(`contrast(${style.filterContrast}%)`)
    if (style.filterGrayscale) filters.push(`grayscale(${style.filterGrayscale}%)`)
    if (style.filterSepia) filters.push(`sepia(${style.filterSepia}%)`)
    if (style.filterSaturate) filters.push(`saturate(${style.filterSaturate}%)`)
    if (style.filterHueRotate) filters.push(`hue-rotate(${style.filterHueRotate}deg)`)
    if (style.filterInvert) filters.push(`invert(${style.filterInvert}%)`)
    if (style.filterShadow) filters.push(`drop-shadow(${style.filterShadow})`)
    if (filters.length > 0) {
        cssText += `${indent}filter: ${filters.join(' ')};\n`
    }

    // Backdrop Filter
    const backdropFilters = []
    if (style.backdropFilterBlur) backdropFilters.push(`blur(${style.backdropFilterBlur}px)`)
    if (style.backdropFilterBrightness) backdropFilters.push(`brightness(${style.backdropFilterBrightness}%)`)
    if (style.backdropFilterContrast) backdropFilters.push(`contrast(${style.backdropFilterContrast}%)`)
    if (style.backdropFilterGrayscale) backdropFilters.push(`grayscale(${style.backdropFilterGrayscale}%)`)
    if (style.backdropFilterSepia) backdropFilters.push(`sepia(${style.backdropFilterSepia}%)`)
    if (style.backdropFilterSaturate) backdropFilters.push(`saturate(${style.backdropFilterSaturate}%)`)
    if (style.backdropFilterHueRotate) backdropFilters.push(`hue-rotate(${style.backdropFilterHueRotate}deg)`)
    if (style.backdropFilterInvert) backdropFilters.push(`invert(${style.backdropFilterInvert}%)`)
    if (style.backdropFilterShadow) backdropFilters.push(`drop-shadow(${style.backdropFilterShadow})`)
    if (backdropFilters.length > 0) {
        cssText += `${indent}backdrop-filter: ${backdropFilters.join(' ')};\n`
    }

    // Apply all other styles
    for (const [key, value] of Object.entries(style)) {
        if (value !== undefined && value !== null && value !== '' && styleHandlers[key]) {
            // Skip composite properties already handled
            if (key.startsWith('shadow') || key.startsWith('textShadow') ||
                key.startsWith('gradiant') || key.startsWith('filter') ||
                key.startsWith('backdropFilter')) {
                continue
            }
            cssText += styleHandlers[key](value)
        }
    }

    return cssText
}

/**
 * Generate HTML structure
 */
function generateHTML(elements) {
    const processed = new Set()
    let html = '<body>\n'

    // Find root elements
    const rootElements = elements.filter(el => el.parentID === 'design_page')

    rootElements.forEach(element => {
        html += generateElementHTML(element, elements, processed, 1)
    })

    html += '</body>'
    return html
}

/**
 * Generate HTML for a single element and its children
 */
function generateElementHTML(element, allElements, processed, depth) {
    if (processed.has(element.properties.id)) return ''
    processed.add(element.properties.id)

    const indent = '  '.repeat(depth)
    const elementId = element.properties.id.replace('built-it ', '')
    const kind = element.kind

    let html = ''

    // Self-closing tags
    if (['text', 'checkbox', 'radio', 'date'].includes(kind)) {
        html += `${indent}<input`
        html += ` id="${elementId}"`
        html += ` type="${kind}"`
        html += generateAttributes(element.properties)
        html += ' />\n'
    }
    // Regular tags
    else {
        html += `${indent}<${kind}`
        html += ` id="${elementId}"`
        html += generateAttributes(element.properties)
        html += '>'

        if (element.properties.textContent) {
            html += element.properties.textContent
        }

        if (element.thechildern && element.thechildern.length > 0) {
            html += '\n'
            element.thechildern.forEach(childId => {
                const childElement = allElements.find(el => el.properties.id === childId)
                if (childElement) {
                    html += generateElementHTML(childElement, allElements, processed, depth + 1)
                }
            })
            html += indent
        }

        html += `</${kind}>\n`
    }

    return html
}

/**
 * Generate HTML attributes
 */
function generateAttributes(properties) {
    let attrs = ''

    const attrMap = {
        classname: 'class',
        class: 'class',
        name: 'name',
        title: 'title',
        alt: 'alt',
        src: 'src',
        href: 'href',
        target: 'target',
        placeholder: 'placeholder',
        value: 'value',
        maxlength: 'maxlength',
        for: 'for'
    }

    for (const [key, attrName] of Object.entries(attrMap)) {
        if (properties[key]) {
            attrs += ` ${attrName}="${properties[key]}"`
        }
    }

    const boolAttrs = ['required', 'disabled', 'readonly', 'checked', 'selected', 'multiple', 'autoplay', 'controls', 'loop', 'muted']
    boolAttrs.forEach(attr => {
        if (properties[attr] === true) {
            attrs += ` ${attr}`
        }
    })

    return attrs
}

/**
 * Generate complete HTML document
 */
function generateFullDocument(html, css) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <style>
${css}
  </style>
</head>
${html}
</html>`
}
