/*  The connection between the computer and the phone in one session: messages in order, some carrying bytes (a
    picture, a recording), peer to peer over WebRTC. A meeting point passes the handshake between the two and
    nothing else: pictures and recordings go straight from the phone to the computer. */

export const MEETING_POINT = 'wss://bambi.haeusler-lorenz.workers.dev';

/** Opens `me`'s end of `session` ('computer' or 'phone'), through the meeting point at `signal`. */
export function openLink(session, me, signal = MEETING_POINT) {
  return direct(session, me, signal);
}

/** Hands each message to the handler one at a time, in order, however long the handler takes. */
function inOrder() {
  let handler = () => {}, chain = Promise.resolve();
  return {
    set: (f) => { handler = f; },
    deliver: (message, bytes) => { chain = chain.then(() => handler(message, bytes)).catch((e) => console.error(e)); },
  };
}

const CHUNK = 16 * 1024; // the largest message every browser's data channel takes
const REACH = 12000; // ms the two may take to reach each other directly once both are there, before it counts as failed

function direct(session, me, signal) {
  const handler = inOrder(), offers = me === 'computer';
  let ws = null, pc = null, channel = null, closed = false, pending = [], incoming = null, reaching = 0;
  const outbox = []; // what was sent while no channel was open, in order
  let state = () => {};

  function connect() {
    ws = new WebSocket(`${signal}/session/${session}?role=${me}`);
    ws.onmessage = async (e) => {
      const m = JSON.parse(e.data);
      if (m.type === 'peer') {
        state(m.present ? 'connecting' : 'away');
        if (m.present && offers) await start();
      }
      if (m.type === 'description') {
        if (m.description.type === 'offer') await start(m.description);
        else await pc?.setRemoteDescription(m.description);
        for (const c of pending.splice(0)) await pc.addIceCandidate(c).catch(() => {});
      }
      if (m.type === 'candidate') {
        if (pc?.remoteDescription) await pc.addIceCandidate(m.candidate).catch(() => {});
        else pending.push(m.candidate);
      }
    };
    ws.onclose = (e) => { if (!closed && e.code !== 4000) setTimeout(connect, 1000); };
  }
  const tell = (m) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify(m));

  //  a fresh connection each time the other side arrives: the computer offers, the phone answers
  async function start(offer) {
    pc?.close();
    channel = null;
    pending = [];
    pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] });
    const mine = pc;
    let opened = false;
    pc.onicecandidate = (e) => e.candidate && tell({ type: 'candidate', candidate: e.candidate });
    //  'failed': the two found each other at the meeting point but cannot reach each other directly (a VPN, or a
    //  network that keeps its devices apart); 'lost': a connection that was open has gone
    pc.onconnectionstatechange = () => {
      if (pc !== mine) return;
      if (pc.connectionState === 'connected') opened = true;
      if (['failed', 'disconnected'].includes(pc.connectionState)) state(opened ? 'lost' : 'failed');
    };
    clearTimeout(reaching);
    reaching = setTimeout(() => pc === mine && !opened && !channel && state('failed'), REACH);
    if (offer) {
      pc.ondatachannel = (e) => open(e.channel);
      await pc.setRemoteDescription(offer);
      await pc.setLocalDescription(await pc.createAnswer());
    } else {
      open(pc.createDataChannel('link', { ordered: true }));
      await pc.setLocalDescription(await pc.createOffer());
    }
    tell({ type: 'description', description: pc.localDescription });
  }

  function open(c) {
    c.binaryType = 'arraybuffer';
    c.bufferedAmountLowThreshold = 1 << 20;
    c.onopen = async () => {
      clearTimeout(reaching);
      channel = c;
      state('open');
      while (outbox.length && channel === c) await outbox.shift()();
    };
    c.onclose = () => { if (channel === c) channel = null; };
    c.onmessage = (e) => {
      if (typeof e.data === 'string') {
        const m = JSON.parse(e.data);
        if (m.$bytes === undefined) return handler.deliver(m);
        const { $bytes, ...message } = m;
        incoming = { message, bytes: new Uint8Array($bytes), at: 0 };
      } else {
        incoming.bytes.set(new Uint8Array(e.data), incoming.at);
        incoming.at += e.data.byteLength;
      }
      if (incoming && incoming.at === incoming.bytes.length) {
        handler.deliver(incoming.message, incoming.bytes.buffer);
        incoming = null;
      }
    };
  }

  //  sends now if the channel is open and nothing waits before it, else after what waits
  function queue(job) {
    if (channel?.readyState === 'open' && !outbox.length) return job();
    return new Promise((resolve, reject) => outbox.push(() => job().then(resolve, reject)));
  }
  async function room(c) {
    if (c.bufferedAmount > 4 << 20) await new Promise((r) => c.addEventListener('bufferedamountlow', r, { once: true }));
  }

  connect();
  return {
    send: (message) => queue(async () => channel.send(JSON.stringify(message))),
    sendData: (message, bytes) => queue(async () => {
      const data = new Uint8Array(bytes instanceof Blob ? await bytes.arrayBuffer() : bytes), c = channel;
      c.send(JSON.stringify({ ...message, $bytes: data.length }));
      for (let at = 0; at < data.length; at += CHUNK) {
        await room(c);
        c.send(data.slice(at, at + CHUNK));
      }
    }),
    onMessage: handler.set,
    /** How the connection stands: 'connecting', 'open', 'away' (the other side left), 'failed' (the two cannot reach
     *  each other directly) or 'lost' (an open connection went). */
    onState: (f) => { state = f; },
    close: () => { closed = true; ws?.close(); pc?.close(); },
  };
}
