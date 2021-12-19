#ifndef PRELOAD_HH
#define PRELOAD_HH

constexpr auto gPreload = R"JS(
  const IPC = window._ipc = { nextSeq: 1, streams: {} }

  window._ipc.resolve = async (seq, status, value) => {
    try {
      value = decodeURIComponent(value)
    } catch (err) {
      console.error(`${err.message} (${value})`)
      return
    }

    try {
      value = JSON.parse(value)
    } catch (err) {
      console.error(`${err.message} (${value})`)
      return
    }

    if (!window._ipc[seq]) {
      console.error('inbound IPC message with unknown sequence:', seq, value)
      return
    }

    if (status === 0) {
      await window._ipc[seq].resolve(value)
    } else {
      const err = new Error(JSON.stringify(value))
      await window._ipc[seq].reject(err);
    }
    delete window._ipc[seq];
  }

  window._ipc.send = (name, value) => {
    const seq = window._ipc.nextSeq++

    const promise = new Promise((resolve, reject) => {
      window._ipc[seq] = {
        resolve: resolve,
        reject: reject
      }
    })

    try {
      let rawValue = value
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }

      value = new URLSearchParams({
        ...rawValue,
        index: window.process.index,
        seq,
        value
      }).toString()

      value = value.replace(/\+/g, '%20')

    } catch (err) {
      console.error(`${err.message} (${value})`)
      return Promise.reject(err.message)
    }

    window.external.invoke(`ipc://${name}?${value}`)
    return promise
  }

  window._ipc.emit = (name, value) => {
    console.log(value);
    let detail

    try {
      detail = JSON.parse(decodeURIComponent(value))
    } catch (err) {
      console.error(`${err.message} (${value})`)
      return
    }

    const event = new window.CustomEvent(name, { detail })
    window.dispatchEvent(event)
  }
)JS";

constexpr auto gPreloadDesktop = R"JS(
  window.system.send = o => window._ipc.send('send', o)
  window.system.exit = o => window._ipc.send('exit', o)
  window.system.openExternal = o => window._ipc.send('external', o)
  window.system.setTitle = o => window._ipc.send('title', o)
  window.system.hide = o => window._ipc.send('hide', o)

  window.system.dialog = async o => {
    const files = await window._ipc.send('dialog', o);
    return files.split('\n');
  }

  window.system.setContextMenu = o => {
    o = Object
      .entries(o)
      .flatMap(a => a.join(':'))
      .join('_')
    return window._ipc.send('context', o)
  };
)JS";

constexpr auto gPreloadMobile = R"JS(
  window.system.tcp = {}
  window.system.tcp.createServer = o => window._ipc.send('createServer', o)
  window.system.tcp.connection = o => window._ipc.send('connection', o)
  window.system.tcp.connect = o => window._ipc.send('connect', o)
  window.system.tcp.send = o => window._ipc.send('send', o)
  window.system.tcp.sendClose = o => window._ipc.send('sendClose', o)
  window.system.tcp.receiveClose = o => window._ipc.send('receiveClose', o)
  window.system.tcp.receiveEnd = o => window._ipc.send('receiveEnd', o)
  window.system.utp = {}
  window.system.dgram = {}
  window.system.getAddress = o => window._ipc.send('getAddress', o)
  window.system.openExternal = o => window._ipc.send('external', o)
)JS";

#endif
