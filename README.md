# expo-video: a muted video makes the app's audio session mixable (iOS)

Minimal repro. `App.tsx` configures the session with expo-audio, plays audio, and mounts a muted, looping `VideoView`. A local module (`modules/session-probe`) shows `AVAudioSession` category / mode / options on screen every 500 ms and logs each change.

## Run

```sh
npm install
npx expo run:ios
```

## Steps

1. Launch on a device (the simulator does not show Now Playing on its lock screen). expo-audio's `setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' })` sets `Playback / Default / options 0`.
2. Tap **Play audio** (`setActiveForLockScreen(true, …)` + `play()`). The session stays `Playback / Default / 0`. Lock the device: the lock screen shows "Repro audio" and its controls.
3. Tap **Show muted video**. Lock the device.
4. Tap **Hide video**, then **Play audio again**. Lock the device.

To see where the write comes from, attach lldb:

```
br set -r "^-\[AVAudioSession setCategory" -G1 -C "po $arg3" -C "po $arg4" -C "p/x $arg5" -C "bt 4"
```

## Expected

The muted video does not change the session: it stays `Playback / Default / 0` while expo-audio plays, and the lock screen keeps showing the audio player.

## Actual

Step 3: the audio glitches briefly, then keeps playing, but the lock screen no longer shows its title, artwork or controls. The session is now `Playback / MoviePlayback / options 1` (`.mixWithOthers`), written by expo-video while expo-audio plays:

```
thread #33, queue = 'com.expo.video.manager.managerQueue'
  frame #0: AudioSession`-[AVAudioSession setCategory:mode:options:error:]
  frame #1: ExpoVideo`VideoManager.setAudioSession() at VideoManager.swift:152:26
  frame #2: ExpoVideo`closure #1 in VideoManager.setAppropriateAudioSessionOrWarn() at VideoManager.swift:114:13
```

Step 4: the session stays `Playback / MoviePlayback / 1`, and the lock screen still shows no playback. `play()` reactivates the session but does not set the category again; only `setAudioModeAsync` does.
