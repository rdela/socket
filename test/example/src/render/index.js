const Tonic = require('@optoolco/tonic')
const Components = require('@optoolco/components')

Components(Tonic)

//
// Menu item selection example... do whatever, await an ipc call, etc.
//
window.addEventListener('menuItemSelected', event => {
  document.querySelector('#menu-selection').value = event.detail.title

  if (event.detail.title.toLowerCase() === 'quit') {
    window.main.quit({})
  }
})

//
// A keybinding example... if keyup is ctrl+q, quit the app
//
window.addEventListener('keyup', async event => {
  if (event.ctrlKey && event.key === 'q') {
    window.main.quit({})
  }
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
    const el = Tonic.match(e.target, 'tonic-button')
    if (!el) return   

    const response = await window.main.dialog(e.target.value)
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
      response = await window.main.send(value)
    } catch (err) {
      console.log(err.message)
    }

    this.querySelector('#response').value =
      response.received.input

    return window.main.setTitle(e.target.value)
  }

  async contextmenu (e) {
    const el = Tonic.match(e.target, '.context-menu')
    if (!el) return

    e.preventDefault()

    const choice = await main.contextMenu({
      'Download': 'd',
      'Wizard': 'w',
      '---': '',
      'Share': 's'
    })

    document.querySelector('#menu-selection').value = choice.title
  }

  render () {
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

      <a id="dd" draggable="true" href="file:///Users/paolofragomeni/projects/optoolco/opkit/TODO.md" download>Draggable</a>
      <a id="dl" href="file:///Users/paolofragomeni/projects/optoolco/opkit/src/render.html" download>Download</a>
    `
  }
}

//
// Hook up a drag and drop example
//
window.onload = async () => {
  Tonic.add(AppContainer)

  // https://developer.apple.com/library/archive/documentation/AppleApplications/Conceptual/SafariJSProgTopics/DragAndDrop.html

  dd.addEventListener('dragover', e => {
    e.preventDefault()
    return true
  })

  dd.addEventListener('dragstart', e => {
    return true
  })

  dd.addEventListener('dragend', _ => {
    const data = event.dataTransfer.items
    return true
  })

  /* document.body.addEventListener('drag', (e) => {
    console.log(e)
  })

  document.body.addEventListener('dragover', (e) => {
    console.log(e)
    e.preventDefault()
    return true
  })

  document.body.addEventListener('drop', (e) => {
    console.log(e)
    e.preventDefault()
  })

  document.body.addEventListener('dragenter', (e) => {
    console.log(e)
    e.preventDefault()
    return true
  })

  document.body.addEventListener('dragstart', (e) => {
    console.log(e)
    return true
  })

  document.body.addEventListener('dragend', (e) => {
    console.log(e)
  }) */

  // await invokeIPC('onload')
}
