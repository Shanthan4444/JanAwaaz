import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../shared/components/Button';
import { Card } from '../shared/components/Card';
import { useBrandingStore } from '../store/brandingStore';

export default function IndexScreen() {
  const router = useRouter();
  const { appName } = useBrandingStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{appName.toUpperCase()}</Text>
          <Text style={styles.subtitle}>CIVIC INTELLIGENCE NETWORK</Text>
          <Text style={styles.tagline}>Consolidating citizen voice, AI vision, and field operations into one unified municipal workflow.</Text>
        </View>

        <Card style={styles.choiceCard}>
          <Text style={styles.cardTitle}>Citizen Portal</Text>
          <Text style={styles.cardDesc}>Report potholes, garbage, leakages, and track verification in real-time.</Text>
          <Button
            title="ENTER CITIZEN APP"
            variant="primary"
            onPress={() => router.push('/citizen/login')}
            style={styles.btn}
          />
        </Card>

        <Card style={styles.choiceCard}>
          <Text style={styles.cardTitle}>Municipal Authority</Text>
          <Text style={styles.cardDesc}>Access the command center to prioritize verified issues and dispatch technicians.</Text>
          <Button
            title="ENTER COMMAND CENTER"
            variant="outline"
            onPress={() => router.push('/authority/login')}
            style={styles.btn}
          />
        </Card>

        <Card style={styles.choiceCard}>
          <Text style={styles.cardTitle}>Field Worker Operations</Text>
          <Text style={styles.cardDesc}>View assigned tasks, update progress on site, and upload resolution proof photos.</Text>
          <Button
            title="ENTER WORKER APP"
            variant="secondary"
            onPress={() => router.push('/worker/login')}
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
    backgroundColor: '#F8F7F3',
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 20
  },
  title: {
    fontSize: 36,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F',
    letterSpacing: 3
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#6D8B74',
    letterSpacing: 4,
    marginTop: 6
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#555555',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '85%'
  },
  choiceCard: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#2F2F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F',
    marginBottom: 8
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 18,
    marginBottom: 20
  },
  btn: {
    borderRadius: 4
  }
});
