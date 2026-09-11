import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Card } from '../../shared/components/Card';
import { useAuth } from '../../services/auth/AuthContext';

export default function CitizenLogin() {
  const router = useRouter();
  const { requestOtp, verifyOtp } = useAuth();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!mobile || mobile.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(mobile);
      setOtpSent(true);
      if (res?.devOtp) {
        setOtp(res.devOtp);
        Alert.alert('OTP Dispatch', `OTP Code Generated for Local Dev: ${res.devOtp}`);
      } else {
        Alert.alert('OTP Dispatch', 'OTP code sent. Please check your SMS/WhatsApp.');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Failed to request OTP. Try again.';
      Alert.alert('Request Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.trim().length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(mobile, otp);
      Alert.alert('Access Granted', 'Signed in successfully.');
      router.replace('/citizen/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message || 'OTP verification failed.';
      Alert.alert('Verification Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>CITIZEN PORTAL</Text>
          <Text style={styles.desc}>Sign in securely using OTP verification to report and track municipal issues in real-time.</Text>

          {!otpSent ? (
            <View>
              <Input
                label="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                placeholder="e.g. 9876543210"
              />
              <Button
                title="SEND OTP CODE"
                loading={loading}
                onPress={handleSendOtp}
                style={styles.btn}
              />
            </View>
          ) : (
            <View>
              <Input
                label="6-Digit Verification Code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                placeholder="Enter 6-digit code"
              />
              <Button
                title="VERIFY & SIGN IN"
                loading={loading}
                onPress={handleVerify}
                style={styles.btn}
              />
              <Button
                title="Change Mobile Number"
                variant="outline"
                style={styles.outlineBtn}
                onPress={() => setOtpSent(false)}
              />
            </View>
          )}
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
    fontSize: 22,
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
    marginTop: 12
  },
  outlineBtn: {
    borderRadius: 4,
    marginTop: 12
  }
});
