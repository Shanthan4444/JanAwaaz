import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Card } from '../../shared/components/Card';
import { useAuth } from '../../services/auth/AuthContext';

export default function WorkerLogin() {
  const router = useRouter();
  const { signInWorker } = useAuth();
  const [credential, setCredential] = useState('Ramesh Kumar');
  const [password, setPassword] = useState('worker123');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!credential.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Worker Name/ID and Password are required.');
      return;
    }
    setLoading(true);
    try {
      await signInWorker(credential.trim(), password.trim());
      Alert.alert('Access Granted', 'Signed in successfully as a Dispatched Technician.');
      router.replace('/worker/dashboard');
    } catch (e: any) {
      const errMsg = e.response?.data?.error?.message || e.message || 'Worker sign in failed.';
      Alert.alert('Sign In Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>FIELD WORKER OPERATIONS</Text>
          <Text style={styles.desc}>Sign in as an assigned technician to inspect work orders, report progress, and submit proof of resolution.</Text>

          <Input
            label="Worker Name or ID"
            value={credential}
            onChangeText={setCredential}
            placeholder="e.g. Ramesh Kumar"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Enter credentials"
          />
          <Button
            title="SIGN IN TO WORKER APP"
            loading={loading}
            onPress={handleSignIn}
            style={styles.btn}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F7F3'
  },
  container: {
    padding: 24,
    backgroundColor: '#F8F7F3',
    flexGrow: 1,
    justifyContent: 'center'
  },
  card: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 8
  },
  title: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5
  },
  desc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18
  },
  btn: {
    borderRadius: 4,
    backgroundColor: '#2F2F2F',
    marginTop: 12
  }
});
