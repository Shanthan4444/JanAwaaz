import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Card } from '../../shared/components/Card';
import { useAuth } from '../../services/auth/AuthContext';

export default function AuthorityLogin() {
  const router = useRouter();
  const { signInAuthority } = useAuth();
  const [credential, setCredential] = useState('officer@jansetu.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!credential.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Officer Email/Employee ID and Password are required.');
      return;
    }
    setLoading(true);
    try {
      await signInAuthority(credential.trim(), password.trim());
      Alert.alert('Access Granted', 'Command Center session established.');
      router.replace('/authority/dashboard');
    } catch (e: any) {
      const errMsg = e.response?.data?.error?.message || e.message || 'Authority sign in failed.';
      Alert.alert('Authentication Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>COMMAND CENTER LOGIN</Text>
          <Text style={styles.desc}>Sign in as an authorized municipal official to review queues, verify reports, override classifications, and assign technicians.</Text>

          <Input
            label="Officer Email or Employee ID"
            value={credential}
            onChangeText={setCredential}
            keyboardType="email-address"
            placeholder="e.g. officer@jansetu.gov.in"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder="Enter credentials"
          />
          <Button
            title="SIGN IN TO COMMAND CENTER"
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
