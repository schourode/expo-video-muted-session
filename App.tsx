import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getSessionState } from './modules/session-probe/src/SessionProbeModule';

const VIDEO_URL = 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';

function formatSession(): string {
  const s = getSessionState();
  if (!s) return 'n/a';
  return `${s.category.replace('AVAudioSessionCategory', '')} / ${s.mode.replace('AVAudioSessionMode', '')} / options ${s.options} / otherAudioPlaying ${s.otherAudioPlaying}`;
}

function MutedVideo() {
  const player = useVideoPlayer(VIDEO_URL, (p) => {
    p.muted = true;
    p.loop = true;
    p.play();
  });
  return <VideoView player={player} nativeControls={false} style={styles.video} />;
}

export default function App() {
  const audio = useAudioPlayer(require('./assets/audio.mp3'));
  const [showVideo, setShowVideo] = useState(false);
  const [session, setSession] = useState(formatSession);
  const [log, setLog] = useState<string[]>([]);

  const mark = (label: string) => {
    const line = `${new Date().toISOString().slice(11, 23)} ${label}`;
    console.log(`[repro] ${line}`);
    setLog((prev) => [...prev, line]);
  };

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    }).then(() => mark('setAudioModeAsync done'));
  }, []);

  useEffect(() => {
    let last = '';
    const id = setInterval(() => {
      const next = formatSession();
      if (next !== last) {
        last = next;
        setSession(next);
        mark(`session: ${next}`);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.session} testID="session">
        {session}
      </Text>
      <Button
        title="Play audio"
        onPress={() => {
          mark('tap: Play audio');
          audio.setActiveForLockScreen(true, { title: 'Repro audio' });
          audio.play();
        }}
      />
      <Button
        title={showVideo ? 'Hide video' : 'Show muted video'}
        onPress={() => {
          mark(showVideo ? 'tap: Hide video' : 'tap: Show muted video');
          setShowVideo((v) => !v);
        }}
      />
      <Button
        title="Play audio again"
        onPress={() => {
          mark('tap: Play audio again');
          audio.play();
        }}
      />
      {showVideo ? <MutedVideo /> : <View style={styles.video} />}
      <ScrollView style={styles.log}>
        {log.map((line, i) => (
          <Text key={i} style={styles.logLine}>
            {line}
          </Text>
        ))}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 16, gap: 8 },
  session: { fontSize: 14, fontWeight: '600' },
  video: { width: 320, height: 180, alignSelf: 'center', backgroundColor: '#eee' },
  log: { flex: 1 },
  logLine: { fontSize: 11, fontFamily: 'Menlo' },
});
