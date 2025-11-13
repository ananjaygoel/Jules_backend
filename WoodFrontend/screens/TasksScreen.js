import React from 'react';
import Screen from '../components/ui/Screen';
import Text from '../components/ui/Text';

export default function TasksScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 22 }}>Tasks</Text>
    </Screen>
  );
}
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { api } from '../src/api';
import { useUser } from '../src/userContext';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { theme } from '../src/theme';

export default function TasksScreen() {
  const [msg, setMsg] = useState('');
  const { refresh } = useUser();
  const [spinResult, setSpinResult] = useState(null); // { result, potentialCoins }
  const [rrResult, setRrResult] = useState(null); // { result, potentialCoins }
  const [scratchAmount, setScratchAmount] = useState(null); // number

  const run = async (fn) => {
    setMsg('');
    try {
      const res = await fn();
      setMsg(JSON.stringify(res));
      // Coins might have changed; refresh global user
      await refresh();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const doSpin = async () => {
    setMsg(''); setSpinResult(null);
    try {
      const res = await api.spinWheel();
      setSpinResult(res);
      setMsg(`Spin: ${res.result} ${res.potentialCoins ? `(+${res.potentialCoins})` : ''}`);
    } catch (e) { setMsg(e.message); }
  };

  const claimSpin = async () => {
    if (!spinResult) return;
    await run(() => api.claimSpin(spinResult.result));
    setSpinResult(null);
  };

  const doRR = async () => {
    setMsg(''); setRrResult(null);
    try {
      const res = await api.russianRoulette();
      setRrResult(res);
      setMsg(`Russian Roulette: ${res.result}${res.potentialCoins ? ` (+${res.potentialCoins})` : ''}`);
    } catch (e) { setMsg(e.message); }
  };

  const claimRR = async () => {
    if (!rrResult) return;
    await run(() => api.claimRussianRoulette(rrResult.result));
    setRrResult(null);
  };

  const doScratch = async () => {
    setMsg(''); setScratchAmount(null);
    try {
      const res = await api.scratchCard();
      setScratchAmount(res.potentialCoins);
      setMsg(`Scratch Card: ${res.potentialCoins} coins`);
    } catch (e) { setMsg(e.message); }
  };

  const claimScratch = async () => {
    if (scratchAmount === null || scratchAmount === undefined) return;
    await run(() => api.claimScratchCard(scratchAmount));
    setScratchAmount(null);
  };


  return (
    <Screen>
      <View style={styles.container}>
        <Title>Tasks</Title>
        <SecondaryButton title="Complete Profile" onPress={() => run(api.completeProfile)} />
        <SecondaryButton title="Follow Social" onPress={() => run(api.followSocial)} />
        <SecondaryButton title="Watch Ad" onPress={() => run(api.watchAd)} />
        <SecondaryButton title="Monthly Bonus" onPress={() => run(api.monthlyBonus)} />
        <SecondaryButton title="Spin Wheel" onPress={doSpin} />
        {!!spinResult && (
          <PrimaryButton title="Claim Spin Reward" onPress={claimSpin} />
        )}
        <SecondaryButton title="Russian Roulette" onPress={doRR} />
        {!!rrResult && (
          <PrimaryButton title="Claim RR Reward" onPress={claimRR} />
        )}
        <SecondaryButton title="Scratch Card" onPress={doScratch} />
        {(scratchAmount !== null && scratchAmount !== undefined) && (
          <PrimaryButton title={`Claim Scratch Reward (+${scratchAmount})`} onPress={claimScratch} />
        )}
        {!!msg && <Body style={styles.msg}>{msg}</Body>}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  msg: { marginTop: 12, color: theme.colors.text }
});
