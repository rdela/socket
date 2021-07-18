const Tonic = require('@optoolco/tonic')
const Components = require('@optoolco/components')

Components(Tonic)

window.addEventListener('contextmenu', e => {
  if (!process.debug) {
    e.preventDefault()
  }
})

//
// Menu item selection example... do whatever, await an ipc call, etc.
//
window.addEventListener('menuItemSelected', event => {
  document.querySelector('#menu-selection').value = event.detail.title

  if (event.detail.title.toLowerCase() === 'quit') {
    system.exit(0)
  }
})

//
// A keybinding example... if keyup is ctrl+q, quit the app
//
window.addEventListener('keyup', async event => {
  if (event.ctrlKey && event.key === 'q') {
    system.exit(0)
  }
})

//
// A keybinding example... if keyup is ctrl+q, quit the app
//
window.addEventListener('click', async event => {
  const el = Tonic.match(event.target, '#externalLink')
  if (!el) return

  event.preventDefault()

  await system.openExternal(el.props.url)
})

//
// Receive arbitrary/non-request-response data from the main process.
//
window.addEventListener('data', event => {
  if (event.detail.env) {
    console.log(event)
    return
  }

  if (event.detail.size !== event.detail.sending.length) {
    throw new Error('Not aligned: detail size not accurate')
  } else {
    console.log(`received ${event.detail.size} characters`)
  }

  AppContainer.setHeader(`${event.detail.counter} messages received`)
})

//
// Create some arbitrary components with our nifty component framework.
//
class AppHeader extends Tonic {
  render () {
    return this.html`
      <h1>${this.props.message}</h1>
    `
  }
}

Tonic.add(AppHeader)

class AppContainer extends Tonic {
  static setHeader (message) {
    const appHeader = document.querySelector('app-header')
    appHeader.reRender({
      message
    })
  }

  async click (e) {
    const el = Tonic.match(e.target, '#butt')
    if (!el) return

    const response = await system.dialog('open')
    this.querySelector('#opened').value = response.replace(',', '\n')
  }

  async input (e) {
    const el = Tonic.match(e.target, 'tonic-input')
    if (!el) return

    let response

    try {
      //
      // request-response (can send any arbitrary parameters)
      //
      const value = { input: e.target.value }
      response = await system.send(value)
    } catch (err) {
      console.log(err.message)
    }

    this.querySelector('#response').value =
      response.received.input

    return // system.setTitle({ e.target.value)
  }

  async contextmenu (e) {
    const el = Tonic.match(e.target, '.context-menu')
    if (!el) return

    e.preventDefault()

    const choice = await system.setContextMenu({
      'Download': 'd',
      'Wizard': 'w',
      '---': '',
      'Inspect': 'i'
    })

    if (choice.title === 'Inspect') {
      // system.inspect()
    }

    document.querySelector('#menu-selection').value = choice.title
  }

  async render () {
    // const settings = await system.getSettings()
    // console.log(settings)

    return this.html`
      <app-header>
      </app-header>

      <div class="grid">
        <tonic-input id="send" label="send">
        </tonic-input>

        <tonic-input id="response" label="recieve" readonly="true">
        </tonic-input>
      </div>

      <tonic-button id="butt">Open</tonic-button>

      <tonic-textarea id="opened" label="opened files/dirs"></tonic-textarea>

      <div class="grid">
        <tonic-input id="menu-selection" readonly="true" label="menu selection">
        </tonic-input>

        <div class="context-menu" draggable="true">
          Context Menu Enabled Area
        </div>
      </div>

      <tonic-button id="externalLink" url="https://example.com">External</tonic-button>

      <a id="dd" draggable="true" href="file:///Users/paolofragomeni/projects/optoolco/opkit/TODO.md" download>Draggable</a>
      <a id="dl" href="file:///Users/paolofragomeni/projects/optoolco/opkit/src/render.html" download>Download</a>
    `
  }
}

//
// An array of *full* paths can be collected by intercepting the drag event
// onto any input control. Split the value by new line to create an array.
//
function setupDrop (fn) {
  let textarea
  let timeout

  document.body.addEventListener('dragover', () => {
    clearTimeout(timeout)
    if (textarea) {
      textarea.style.zIndex = 10000
      document.body.appendChild(textarea)
      return
    }

    textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.style.opacity = 0
    textarea.style.position = 'fixed'
    textarea.style.top = '0px'
    textarea.style.left = '0px'
    textarea.style.right = '0px'
    textarea.style.bottom = '0px'
    textarea.style.zIndex = 10000

    textarea.addEventListener('input', () => {
      textarea.style.zIndex = -1
      fn && fn(textarea.value.split('\n'))
      textarea.value = ''
      document.body.removeChild(textarea)
    })
  })

  document.body.addEventListener('dragleave', () => {
    timeout = setTimeout(() => {
      textarea.style.zIndex = -1
      document.body.removeChild(textarea)
    }, 128)
  })
}

//
// Hook up a drag and drop example
//
window.onload = async () => {
  Tonic.add(AppContainer)

  setupDrop(paths => {
    console.log(paths)
  })

  // https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/SafariJSProgTopics/DragAndDrop.html

  // await invokeIPC('onload')
}
