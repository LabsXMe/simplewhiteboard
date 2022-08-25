const pickr = new Pickr({
  el: '.color-picker',
  container: 'body',
  theme: 'classic',
  closeOnScroll: false,
  appClass: 'custom-class',
  useAsButton: false,
  padding: 8,
  inline: false,
  autoReposition: true,
  sliders: 'v',
  disabled: false,
  lockOpacity: false,
  outputPrecision: 0,
  comparison: false,
  default: '#42445a',
  swatches: null,
  defaultRepresentation: 'HEX',
  showAlways: false,
  closeWithKey: 'Escape',
  position: 'bottom-middle',
  adjustableNumbers: true,

  // Show or hide specific components.
  // By default only the palette (and the save button) is visible.
  // components: {

  //     // Defines if the palette itself should be visible.
  //     // Will be overwritten with true if preview, opacity or hue are true
  //     palette: true,

  //     preview: true, // Display comparison between previous state and new color
  //     opacity: true, // Display opacity slider
  //     hue: true,     // Display hue slider

  //     // show or hide components on the bottom interaction bar.
  //     interaction: {

  //         // Buttons, if you disable one but use the format in default: or setColor() - set the representation-type too!
  //         hex: false,  // Display 'input/output format as hex' button  (hexadecimal representation of the rgba value)
  //         rgba: false, // Display 'input/output format as rgba' button (red green blue and alpha)
  //         hsla: false, // Display 'input/output format as hsla' button (hue saturation lightness and alpha)
  //         hsva: false, // Display 'input/output format as hsva' button (hue saturation value and alpha)
  //         cmyk: false, // Display 'input/output format as cmyk' button (cyan mangenta yellow key )

  //         input: false, // Display input/output textbox which shows the selected color value.
  //                      // the format of the input is determined by defaultRepresentation,
  //                      // and can be changed by the user with the buttons set by hex, rgba, hsla, etc (above).
  //         cancel: false, // Display Cancel Button, resets the color to the previous state
  //         clear: false, // Display Clear Button; same as cancel, but keeps the window open
  //         save: false,  // Display Save Button,
  //     },
  // },
  components: {

      // Main components
      // preview: true,
      opacity: true,
      hue: true,

      // Input / output Options
      interaction: {
          hex: true,
          input: true
      }
  },

  // Translations, these are the default values.
  i18n: {

      // Strings visible in the UI
     'ui:dialog': 'color picker dialog',
     'btn:toggle': 'toggle color picker dialog',
     'btn:swatch': 'color swatch',
     'btn:last-color': 'use previous color',
     'btn:save': 'Save',
     'btn:cancel': 'Cancel',
     'btn:clear': 'Clear',

     // Strings used for aria-labels
     'aria:btn:save': 'save and close',
     'aria:btn:cancel': 'cancel and close',
     'aria:btn:clear': 'clear and close',
     'aria:input': 'color input field',
     'aria:palette': 'color selection area',
     'aria:hue': 'hue selection slider',
     'aria:opacity': 'selection slider'
  }
});

let mode = 'free'
let color = '';
let thicnes = "1";

let fab = new fabric.Canvas('myCanvas',{ preserveObjectStacking: true })
fab.backgroundColor='white'
fab.allowTouchScrolling = true
fab.selection = false

fab.setDimensions({width:1200,height:700})
let isLoadedFromJson = false
setMode()
function setMode(){
  // fab.clear()
  if(mode == 'free'){
    fab.freeDrawingBrush = new fabric.PencilBrush(fab);
    fab.freeDrawingBrush.width = thicnes;
    fab.freeDrawingBrush.color = color;
    fab.freeDrawingBrush.limitedToCanvasSize = true;
    fab.isDrawingMode = true
  }else if(mode == "round"){
    drawcle()
    fab.isDrawingMode = false
  }else{
    removeEvents()
    fab.isDrawingMode = false
  }
}
function drawcle() {

  var circle, isDown, origX, origY;

  fab.on('mouse:down', function(o) {
    isDown = true;
    var pointer = fab.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
    circle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 1,
      strokeWidth: 2,
      stroke: null,
      fill: color,
      selectable: true,
      originX: 'center',
      originY: 'center'
    });
    fab.add(circle);
  });

  fab.on('mouse:move', function(o) {
    if (!isDown) return;
    var pointer = fab.getPointer(o.e);
    circle.set({
      radius: Math.abs(origX - pointer.x)
    });
    fab.renderAll()
  });

  fab.on('mouse:up', function(o) {
    isDown = false;
  });
}
function removeall(){
  fab.clear()
}

pickr.on('init',function(instance){
  console.log(instance._color.toHEXA().toString())
  color = instance._color.toHEXA().toString()
  setMode()
})

pickr.on('changestop',function(e, instance){
  console.log(instance._color.toHEXA().toString())
  color = instance._color.toHEXA().toString()
  console.log(color)
  setMode()
})

function savewindow(){
  const link = document.createElement('a');
  link.download = 'download.png';
  link.href = fab.toDataURL();
  link.click();
  link.delete;
}
function changeThicnes(ini){
  thicnes = $(ini).val()
  setMode()
}
function removeEvents(){
  fab.off('mouse:down');
  fab.off('mouse:up');
  fab.off('mouse:move');
}

$('.selecc').on('change',function(){
  mode = $(this).val()
  console.log(mode)
  removeEvents();
  setMode()
})

var socket = io();

function emitEvent() {
  let aux = fab;
  let json = aux.toJSON();
  let data = {
      from: socket.id,
      data: json
  };
  socket.emit('drawing', data);
}

fab.on('after:render',function(e){
  if (! isLoadedFromJson) {
    emitEvent();
  }
  isLoadedFromJson = false;
  // console.log(canvas.toJSON());
})

// $(window).on('resize',function(){
//   fab.setDimensions({width:$('.drawingpage').width(),height:$('.drawingpage').height()})
// })


fab.renderAll()

socket.on('connect',function(){
  console.log('Connected')
  socket.on('drawing', function (obj) {
    //set this flag, to disable infinite rendering loop
    isLoadedFromJson = true
    if(obj.from != socket.id){
      fab.loadFromJSON(obj.data);
    }
  });
})