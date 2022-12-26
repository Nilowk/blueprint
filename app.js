const root = document.getElementById("root");
const contextMenu = document.getElementById("context-menu");
const optionNew = document.getElementById("new"); 
const uuids = new Array();
const blocks = {}

const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
ctx.canvas.width = root.offsetWidth;
ctx.canvas.height = root.offsetHeight;
ctx.strokeStyle = "#fff";
ctx.lineWidth = 2;

let selected = null;
let selectedPine = null;

class Block {

    constructor(id) {
        
        this.id = id;
        this.inpin = {
            block: null, 
            x1: 10, 
            y1: 10,
            x2: 0,
            y2: 0
        };
        this.outpin = {
            block: null,
            x1: 10,
            y1: 10,
            x2: 0,
            y2: 0
        };

    }

}

function generateUuid() {
    
    let uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    
    for (key in uuids) {

        if (uuid == key) return generateUuid();

    }

    if (!uuids.includes(uuid)) uuids.push(uuid);

    return uuid;

}

window.addEventListener("contextmenu", (event) => {

    event.preventDefault();
    contextMenu.style.display = "flex";
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;

});

window.addEventListener("click", (event) => {

    event.preventDefault();
    if (event.target != contextMenu && !Array.from(contextMenu.querySelectorAll("*")).includes(event.target)) {
        if (contextMenu.style.display == "flex") { 
            contextMenu.style.display = "none";
        }
    }

});

window.addEventListener("mousedown", (event) => {

    event.preventDefault();
    if (event.target.classList.contains("block")) {

        selected = event.target;
        let matrix = window.getComputedStyle(selected).transform.match(/matrix.*\((.+)\)/)[1].split(', ');
        selectedX = event.clientX - matrix[4];
        selectedY = event.clientY - matrix[5];

    }
    if (event.target.classList.contains("outpine")) {

        selectedPine = event.target;
        let objId = selectedPine.offsetParent.attributes.id.value;
        let obj = blocks[objId];
        if (obj.outpin.block) {
            let block = obj.outpin.block;
            block.inpin.block = null;
            obj.outpin.block = null;
        }
        obj.outpin.x2 = event.clientX;
        obj.outpin.y2 = event.clientY;
        drawConnection();


    }
    if (event.target.classList.contains("inpine")) {

        let blockId = event.target.offsetParent.attributes.id.value;
        let block = blocks[blockId];
        let obj = block.inpin.block;
        obj.outpin.block = null;
        block.inpin.block = null;
        drawConnection();

    }

})

window.addEventListener("mouseup", (event) => {

    event.preventDefault();
    selected = null;
    if (event.target.classList.contains("inpine")) {

        let blockId = event.target.offsetParent.attributes.id.value;
        let selectedId = selectedPine.offsetParent.attributes.id.value;
        let block = blocks[blockId];
        let obj = blocks[selectedId];
        if (block.inpin.block) block.inpin.block.outpin.block = null;
        obj.outpin.block = block;
        block.inpin.block = obj;


    }
    selectedPine = null;
    drawConnection();

});

window.addEventListener("mousemove", (event) => {

    if (selected) {

        let matrix = window.getComputedStyle(selected).transform.match(/matrix.*\((.+)\)/)[1].split(', ');
        let x = (event.clientX - selectedX) - ((event.clientX - selectedX) % 20);
        let y = (event.clientY - selectedY) - ((event.clientY - selectedY) % 20);
        if (matrix[4] != x || matrix[5] != y) {

            selected.style.transform = `translate(${x}px, ${y}px)`;
            drawConnection();

        }

    }

    if (selectedPine) {

        let selectedId = selectedPine.offsetParent.attributes.id.value;
        let obj = blocks[selectedId];
        obj.outpin.x2 = event.clientX;
        obj.outpin.y2 = event.clientY;
        drawConnection();

    }

});

optionNew.addEventListener("click", (event) => {

    event.preventDefault();
    contextMenu.style.display = "none";
    
    let uuid = generateUuid();
    let element = (event.target.nodeName == "DIV" ? event.target.lastElementChild.cloneNode(true) : event.target.nextElementSibling.cloneNode(true));
    element.setAttribute("id", uuid);

    let x = event.clientX - (event.clientX % 20);
    let y = event.clientY - (event.clientY % 20);
    
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.style.width = `220px`;
    element.style.height = `160px`;
    root.appendChild(element);
    blocks[uuid] = new Block(uuid);
    drawConnection()

});

function drawConnection() {

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let key of Object.keys(blocks)) {

        let obj = blocks[key];
        if (obj.outpin.block) {

            let element = document.getElementById(key);
            let matrix = window.getComputedStyle(element).transform.match(/matrix.*\((.+)\)/)[1].split(', ');
            let start = {
                x: parseInt(matrix[4]) + parseInt(element.style.width.split("px")[0]) - (obj.outpin.x1 + 8),
                y: parseInt(matrix[5]) + parseInt(element.style.height.split("px")[0]) - (obj.outpin.y1 + 5)
            };

            let block = obj.outpin.block;
            let element2 = document.getElementById(block.id);
            let matrix2 = window.getComputedStyle(element2).transform.match(/matrix.*\((.+)\)/)[1].split(', ');
            let end = {
                x: parseInt(matrix2[4]) + (block.inpin.x1 + 8),
                y: parseInt(matrix2[5]) + parseInt(element2.style.height.split("px")[0]) - (block.inpin.y1 + 5)
            }
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

        } else if (selectedPine) {

            let selectedId = selectedPine.offsetParent.attributes.id.value;
            if (selectedId == key) {

                let element = document.getElementById(key);
                let matrix = window.getComputedStyle(element).transform.match(/matrix.*\((.+)\)/)[1].split(', ');
                let start = {
                    x: parseInt(matrix[4]) + parseInt(element.style.width.split("px")[0]) - (obj.outpin.x1 + 8),
                    y: parseInt(matrix[5]) + parseInt(element.style.height.split("px")[0]) - (obj.outpin.y1 + 5)
                };
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(obj.outpin.x2, obj.outpin.y2);
                ctx.stroke();

            }

        }

    }


}