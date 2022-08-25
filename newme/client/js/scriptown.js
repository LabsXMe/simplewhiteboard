var c;
var socket;
var pickr = null;
var thicnes = 1;
var color_ = '#42445a';
var windowsizer = {
    width:0,
    height:0
}
var type = 'free'
var boxstate = {
  x:-1,
  y:-1,
  w:-1,
  h:-1
}
function setup(){
    pickr = new Pickr({
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
    windowsizer.width = document.getElementById('myCanvas').clientWidth
    windowsizer.height = document.getElementById('myCanvas').clientHeight
    c = createCanvas(windowsizer.width,windowsizer.height)
    c.parent('myCanvas')
    background('white');
    socket = io.connect()
    socket.on('connect',function(){
        console.log('connect')
    })
    socket.on('DRAW', function(e){
        // if(mouseIsPressed){
            if(e.start){
              if(e.type == 'free'){
                stroke(e.color)
                strokeWeight(e.thickness)
                line(e.prev.x, e.prev.y, e.curr.x, e.curr.y)
              }else if(e.type == 'box'){
                // console.log(e.boxstate)
                fill(e.color)
                rect(e.boxstate.x, e.boxstate.y, e.boxstate.w, e.boxstate.h);
              }
            }
        // }
    })
    pickr.on('changestop', function(e, instance){
        // console.log(instance._color)
        color_ = instance._color.toHEXA().toString()
        // socket.emit('DRAW',{color:color, start:false})
    })
    $('.selecc').on('change', function(){
      type = $(this).val()
    })
}

function changeThicnes(ini){
  thicnes = ini.value
}

function removeall(){
  clear()
}

function draw(){
    if(mouseIsPressed){
      // console.log(type)
      if(type == 'free'){
        socket.emit('DRAW',{
            x: mouseX,
            y: mouseY,
            thickness:thicnes,
            color:color_,
            type:type,
            start:true
        })
      }else if(type == 'box'){
        // console.log(box)
        if(boxstate.x == -1 && boxstate.y == -1){
          boxstate.x = mouseX
          boxstate.y = mouseY
          socket.emit('DRAW',{
            xnow:boxstate.x,
            ynow:boxstate.y,
            thickness:thicnes,
            color:color_,
            type:type,
            start:true
          })
          console.log(box)
        }else{
          boxstate.w = mouseX - boxstate.x
          boxstate.h = mouseY - boxstate.y
          updatePixels();
          socket.emit('DRAW',{
            xnow:boxstate.x,
            ynow:boxstate.y,
            wnow:boxstate.w,
            hnow:boxstate.h,
            thickness:thicnes,
            color:color_,
            type:type,
            start:true
          })
        }
      }
    }else{
      if(type == 'free'){
        socket.emit('DRAW',{
            x: mouseX,
            y: mouseY,
            thickness:thicnes,
            color:color_,
            type:type,
            start:false
        })
      }else if(type == 'box'){
        boxstate = {
          x:-1,
          y:-1,
          h:-1,
          w:-1
        }
        socket.emit('DRAW',{
            xnow:boxstate.x,
            ynow:boxstate.y,
            wnow:boxstate.w,
            hnow:boxstate.h,
            thickness:thicnes,
            color:color_,
            type:type,
            start:false
        })
        loadPixels();
      }
    }
    // socket.emit('DRAW',{
    //     x: mouseX,
    //     y: mouseY,
    //     thickness:1
    // })
}

// function mousePressed(){
//     socket.emit('DRAW',{
//         x: mouseX,
//         y: mouseY,
//         thickness:1,
//         start:true
//     })
// }

// function mouseMoved(){
//     socket.emit('DRAW',{
//         x: mouseX,
//         y: mouseY,
//         thickness:1
//     })
//     // if(mouseIsPressed){
//     //     console.log("pressed")
//     // }
// }

function windowResized() {
    windowsizer.width = document.getElementById('myCanvas').clientWidth
    windowsizer.height = document.getElementById('myCanvas').clientHeight
    resizeCanvas(windowsizer.width, windowsizer.height);
}

function savewindow(){
  saveCanvas(c,'saveimage','png');
}