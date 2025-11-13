import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { theme } from '../src/theme';
import { api } from '../src/api';

export default function PaymentsScreen() {
  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.paymentConfig();
        setCfg(c);
      } catch (e) {
        setError(e?.message || 'Failed to load payment config');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 16 }}>
      <Text style={{ color: theme.colors.text, fontSize: 22, marginBottom: 16 }}>Payments</Text>
      {error ? (
        <Text style={{ color: theme.colors.textMuted }}>{String(error)}</Text>
      ) : (
        <Text style={{ color: theme.colors.text }}>{cfg ? JSON.stringify(cfg) : 'Loading...'}</Text>
      )}
    </View>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Linking, Platform, Alert } from 'react-native';
import { api } from '../src/api';
import { useUser } from '../src/userContext';
import { useStripe } from '@stripe/stripe-react-native';
import * as RNIap from 'react-native-iap';
import Screen from '../components/ui/Screen';
import { Title, Body } from '../components/ui/Text';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { theme } from '../src/theme';

export default function PaymentsScreen() {
  const { refresh } = useUser();
  const [msg, setMsg] = useState('');
  const [amount, setAmount] = useState('100'); // INR
  const [coupon, setCoupon] = useState('');
  const [plans, setPlans] = useState([]);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const stripe = useStripe();
  const [isPresenting, setPresenting] = useState(false);
  const [iapProducts, setIapProducts] = useState([]);
  const [iapSubs, setIapSubs] = useState([]);
  const purchaseUpdateSubRef = useRef(null);
  const purchaseErrorSubRef = useRef(null);
  const cfgRef = useRef({ coins: [], subscriptions: [] });

  const verifyWithRetries = async (payload, max = 2) => {
    let lastErr;
    for (let i = 0; i <= max; i++) {
      try {
        return await api.verifyIAP(payload);
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    throw lastErr;
  };

  useEffect(() => {
    (async () => {
      try {
        const cfg = await api.paymentConfig();
        setPlans(cfg.membershipPlans || []);
        setStripeEnabled(!!cfg.stripeEnabled);
        cfgRef.current = { coins: cfg.iap?.android?.coins || [], subscriptions: cfg.iap?.android?.subscriptions || [] };
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          try {
            await RNIap.initConnection();
            const productIds = (Platform.OS === 'android' ? (cfg.iap?.android?.coins || []) : (cfg.iap?.ios?.coins || [])).map(p => p.productId);
            const subIds = (Platform.OS === 'android' ? (cfg.iap?.android?.subscriptions || []) : (cfg.iap?.ios?.subscriptions || [])).map(s => s.productId);
            if (productIds.length) {
              const prods = await RNIap.getProducts({ skus: productIds });
              setIapProducts(prods);
            }
            if (subIds.length) {
              const subs = await RNIap.getSubscriptions({ skus: subIds });
              setIapSubs(subs);
            }
          } catch (e) {
            console.warn('IAP init failed', e?.message);
          }
        }
      } catch (e) {
        console.warn('payment config failed', e?.message);
      }
    })();
    // Setup IAP listeners
    if (Platform.OS === 'android') {
      try {
        purchaseUpdateSubRef.current = RNIap.purchaseUpdatedListener(async (purchase) => {
          try {
            const pid = purchase.productId || (purchase.products && purchase.products[0]);
            const isSub = (cfgRef.current.subscriptions || []).some(s => s.productId === pid) || purchase.autoRenewingAndroid === true;
            const type = isSub ? 'subs' : 'inapp';
            if (Platform.OS === 'android') {
              const receipt = purchase.transactionReceipt ? JSON.parse(purchase.transactionReceipt) : null;
              const token = receipt?.purchaseToken || purchase.purchaseToken || receipt?.token;
              if (pid && token) {
                await verifyWithRetries({ platform: 'android', productId: pid, purchaseToken: token, orderId: purchase.transactionId, type });
                await refresh();
                setMsg(isSub ? 'Subscription verified and activated.' : 'Purchase verified and coins credited.');
              }
            } else if (Platform.OS === 'ios') {
              const base64 = purchase.transactionReceipt; // iOS returns base64
              if (pid && base64) {
                await verifyWithRetries({ platform: 'ios', productId: pid, receiptData: base64, orderId: purchase.transactionId, type });
                await refresh();
                setMsg(isSub ? 'Subscription verified and activated.' : 'Purchase verified and coins credited.');
              }
            }
          } catch (err) {
            setMsg(err.message || 'Verification failed');
            Alert.alert('Verification failed', err.message || 'Please try again');
          } finally {
            try {
              if (RNIap.finishTransaction) {
                await RNIap.finishTransaction({ purchase, isConsumable: Platform.OS === 'android' ? !purchase.autoRenewingAndroid : true });
              }
            } catch (errFinish) { console.warn('finishTransaction error', errFinish?.message); }
          }
        });
        purchaseErrorSubRef.current = RNIap.purchaseErrorListener((error) => {
          setMsg(error?.message || 'Purchase error');
        });
      } catch (errListener) { console.warn('IAP listener setup failed', errListener?.message); }
    }

    return () => {
      try { if (purchaseUpdateSubRef.current) purchaseUpdateSubRef.current.remove(); } catch (e) { console.warn('remove update listener failed', e?.message); }
      try { if (purchaseErrorSubRef.current) purchaseErrorSubRef.current.remove(); } catch (e) { console.warn('remove error listener failed', e?.message); }
      try { if (Platform.OS === 'android') RNIap.endConnection(); } catch (e) { console.warn('endConnection failed', e?.message); }
    };
  }, []);

  const buyCoins = async (rupees) => {
    setMsg('');
    try {
      const amountInPaise = Math.round(Number(rupees) * 100);
      const res = await api.createPaymentIntent({ amountInPaise, currency: 'inr' });
      if (stripeEnabled && res.clientSecret) {
        setPresenting(true);
        const init = await stripe.initPaymentSheet({ paymentIntentClientSecret: res.clientSecret });
        if (init.error) throw new Error(init.error.message);
        const present = await stripe.presentPaymentSheet();
        if (present.error) throw new Error(present.error.message);
        setMsg('Payment completed. Waiting for coins to reflect...');
        // Poll user balance a few times in case webhook updates are slightly delayed
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 2000));
          await refresh();
        }
        setMsg('Payment completed. Balance refreshed.');
        setPresenting(false);
      } else {
        setMsg(`PaymentIntent created. clientSecret: ${res.clientSecret || 'N/A'}. Stripe not fully configured for mobile sheet.`);
      }
    } catch (e) {
      setMsg(e.message);
      setPresenting(false);
    }
  };

  const subscribe = async (plan) => {
    setMsg('');
    try {
      const res = await api.createSubscription({ plan, couponCode: coupon || undefined });
      if (res.url) {
        Linking.openURL(res.url);
      }
      setMsg(`Subscription session created${res.url ? ' and opened in browser' : ''}.`);
      await refresh();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const purchaseIap = async (sku) => {
    setMsg('');
    try {
      await RNIap.requestPurchase({ sku });
      setMsg('Processing purchase...');
    } catch (e) {
      setMsg(e.message || 'Purchase failed');
      Alert.alert('Purchase failed', e.message || 'Please try again');
    }
  };

  const subscribeIap = async (sku) => {
    setMsg('');
    try {
      await RNIap.requestSubscription({ sku });
      setMsg('Processing subscription...');
    } catch (e) {
      setMsg(e.message || 'Subscription failed');
      Alert.alert('Subscription failed', e.message || 'Please try again');
    }
  };

  return (
    <Screen>
      <Title style={{ marginBottom: theme.spacing(2) }}>Payments</Title>
      <Body muted style={{ marginBottom: theme.spacing(1) }}>Buy coins</Body>
      <View style={styles.row}>
        <SecondaryButton title="₹50" onPress={() => buyCoins(50)} />
        <SecondaryButton title="₹100" onPress={() => buyCoins(100)} />
        <SecondaryButton title="₹200" onPress={() => buyCoins(200)} />
      </View>
      <View style={styles.row}>
        <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} placeholderTextColor={theme.colors.textMuted} />
        <PrimaryButton title="Buy" onPress={() => buyCoins(Number(amount) || 0)} loading={isPresenting} />
      </View>

      <Body muted style={{ marginTop: theme.spacing(2) }}>Subscribe</Body>
      <TextInput style={styles.input} placeholder="Coupon (optional)" value={coupon} onChangeText={setCoupon} placeholderTextColor={theme.colors.textMuted} />
      <View style={{ gap: 8 }}>
        {plans.length > 0 ? plans.map((p) => (
          <SecondaryButton key={p.key} title={`${p.key} (₹${p.price})`} onPress={() => subscribe(p.key)} />
        )) : (
          <View style={styles.row}>
            <SecondaryButton title="Tier 1 (₹300)" onPress={() => subscribe('tier1')} />
            <SecondaryButton title="Tier 2 (₹900)" onPress={() => subscribe('tier2')} />
          </View>
        )}
      </View>

      {!!msg && <Body style={styles.msg}>{msg}</Body>}
      {(Platform.OS === 'android' || Platform.OS === 'ios') && (
        <>
          <Body muted style={{ marginTop: theme.spacing(2) }}>{Platform.OS === 'ios' ? 'App Store Billing (iOS)' : 'Play Billing (Android)'}</Body>
          <Body muted>Coin Packs</Body>
          <View style={{ gap: 8 }}>
            {iapProducts.map((p) => (
              <SecondaryButton key={p.productId} title={`${p.title || p.productId} — ${p.localizedPrice}`} onPress={() => purchaseIap(p.productId)} />
            ))}
          </View>
          <Body muted style={{ marginTop: 8 }}>Subscriptions</Body>
          <View style={{ gap: 8 }}>
            {iapSubs.map((s) => (
              <SecondaryButton key={s.productId} title={`${s.title || s.productId} — ${s.localizedPrice}`} onPress={() => subscribeIap(s.productId)} />
            ))}
          </View>
        </>
      )}
      <Body muted style={styles.note}>Note: Payment Sheet requires server-provided Stripe publishable key and backend STRIPE_SECRET_KEY. Coins/subscriptions appear after webhook or IAP verification.</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.lg, padding: 14, color: theme.colors.text, backgroundColor: theme.colors.card },
  msg: { marginTop: 12, color: theme.colors.text },
  note: { marginTop: 8, color: theme.colors.textMuted, fontSize: 12 }
});
