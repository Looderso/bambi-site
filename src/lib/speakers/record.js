// Recording a microphone for the speakers tool, on the phone or on the computer: the microphone opened without the
// browser's voice processing, which would shape the sweeps, and a recording of a set length from it.

/** The microphone `deviceId` (or the default one), unprocessed. Asks for two channels, so an interface's second
 *  input can be chosen; a microphone with one gives one. */
export function openInput(deviceId) {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      channelCount: { ideal: 2 },
    },
  });
}

/** How many channels `stream` carries. */
export const channelsOf = (stream) => stream.getAudioTracks()[0]?.getSettings().channelCount ?? 1;

/** Records `channel` (0-based) of `stream` for `seconds` in `ctx`; `begins()` runs once the recording has started,
 *  so what it starts lands inside the recording. Resolves to { data: Float32Array, rate }. */
export function record(ctx, stream, seconds, begins, channel = 0) {
  return new Promise(async (resolve) => {
    await ctx.resume();
    const source = ctx.createMediaStreamSource(stream);
    const split = ctx.createChannelSplitter(Math.max(1, channelsOf(stream)));
    const node = ctx.createScriptProcessor(4096, 1, 1);
    const want = Math.round(seconds * ctx.sampleRate), data = new Float32Array(want);
    let at = 0, started = false;
    node.onaudioprocess = (e) => {
      if (!started) { started = true; begins(); }
      const input = e.inputBuffer.getChannelData(0), n = Math.min(input.length, want - at);
      data.set(input.subarray(0, n), at);
      at += n;
      if (at >= want) {
        node.disconnect();
        split.disconnect();
        source.disconnect();
        resolve({ data, rate: ctx.sampleRate });
      }
    };
    source.connect(split);
    split.connect(node, Math.min(channel, Math.max(1, channelsOf(stream)) - 1));
    node.connect(ctx.destination); // a script processor runs only when connected; it writes silence
  });
}

/** The loudest point of `data`, in dBFS. */
export const peakDb = (data) => 20 * Math.log10(data.reduce((x, v) => Math.max(x, Math.abs(v)), 0) + 1e-9);
