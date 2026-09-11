import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TextInput, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MapView, { Marker } from 'react-native-maps';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { citizenApi } from '../../services/api/citizenApi';

export default function TrackIssueScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenForm, setShowReopenForm] = useState(false);

  // 1. Fetch ticket details
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['citizenIssueDetail', id],
    queryFn: () => citizenApi.getIssue(id as string),
    enabled: !!id
  });

  // 2. Mutation for verifying issue FIXED
  const verifyMutation = useMutation({
    mutationFn: () => citizenApi.verifyIssue(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenIssueDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['citizenIssues'] });
      Alert.alert('Verification Submitted', 'Thank you for confirming resolution. Ticket is now closed.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit verification status.');
    }
  });

  // 3. Mutation for reopening issue NOT FIXED
  const reopenMutation = useMutation({
    mutationFn: (reason: string) => citizenApi.reopenIssue(id as string, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizenIssueDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['citizenIssues'] });
      setShowReopenForm(false);
      setReopenReason('');
      Alert.alert('Ticket Reopened', 'The ticket has been reopened and dispatched back to the department.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to reopen ticket.';
      Alert.alert('Error', msg);
    }
  });

  const handleVerifyFixed = () => {
    Alert.alert(
      'Confirm Resolution',
      'Are you sure you want to mark this issue as resolved and close the ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Confirm', onPress: () => verifyMutation.mutate() }
      ]
    );
  };

  const handleReopenSubmit = () => {
    if (!reopenReason.trim()) {
      Alert.alert('Validation Error', 'Please enter a reason for reopening.');
      return;
    }
    reopenMutation.mutate(reopenReason.trim());
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F2F2F" />
      </View>
    );
  }

  if (error || !issue) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Report ticket details could not be retrieved.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.category}>{issue.category?.toUpperCase()}</Text>
            <StatusBadge status={issue.status} />
          </View>
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.desc}>{issue.description}</Text>

          {issue.location && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: issue.location.latitude || 28.5355,
                  longitude: issue.location.longitude || 77.3910,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: issue.location.latitude || 28.5355,
                    longitude: issue.location.longitude || 77.3910
                  }}
                  title={issue.title}
                />
              </MapView>
            </View>
          )}

          {issue.evidence?.[0]?.url && (
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>BEFORE PROOF PHOTO:</Text>
              <Image source={{ uri: issue.evidence[0].url }} style={styles.evidenceImage} />
            </View>
          )}
        </Card>

        {/* Assigned Field Worker Detail */}
        {issue.assignedWorker?.name && (
          <Card style={styles.card}>
            <Text style={styles.sectionHeading}>ASSIGNED FIELD TECHNICIAN</Text>
            <View style={styles.workerContainer}>
              <View>
                <Text style={styles.workerName}>{issue.assignedWorker.name}</Text>
                <Text style={styles.workerRole}>{issue.assignedWorker.role || 'Field Engineer'}</Text>
                {issue.assignedWorker.phone && (
                  <Text style={styles.workerPhone}>Contact: {issue.assignedWorker.phone}</Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Verification Card for RESOLVED / CITIZEN_VERIFICATION */}
        {(issue.status === 'RESOLVED' || issue.status === 'CITIZEN_VERIFICATION') && (
          <Card style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>Citizen Work Quality Verification</Text>
            <Text style={styles.verificationDesc}>
              The assigned technician has resolved the issue. Please inspect the site.
            </Text>

            {issue.resolution?.evidence?.[0]?.url && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.sectionHeading}>AFTER PROOF PHOTO:</Text>
                <Image source={{ uri: issue.resolution.evidence[0].url }} style={styles.evidenceImage} />
              </View>
            )}

            {!showReopenForm ? (
              <View style={styles.btnRow}>
                <Button
                  title="CONFIRM FIXED & CLOSE"
                  variant="success"
                  style={{ flex: 1, marginRight: 8 }}
                  onPress={handleVerifyFixed}
                  loading={verifyMutation.isPending}
                />
                <Button
                  title="REOPEN ISSUE"
                  variant="outline"
                  style={{ flex: 1 }}
                  onPress={() => setShowReopenForm(true)}
                />
              </View>
            ) : (
              <View>
                <Text style={styles.label}>Reason for Reopening</Text>
                <TextInput
                  style={styles.textInput}
                  value={reopenReason}
                  onChangeText={setReopenReason}
                  placeholder="Describe why the work is incomplete or substandard"
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.btnRow}>
                  <Button
                    title="SUBMIT REOPEN"
                    variant="primary"
                    style={{ flex: 1, marginRight: 8 }}
                    onPress={handleReopenSubmit}
                    loading={reopenMutation.isPending}
                  />
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => setShowReopenForm(false)}
                  />
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Timeline Tracking */}
        <Card style={styles.card}>
          <Text style={styles.sectionHeading}>REPORT TIMELINE HISTORY</Text>
          {issue.timeline?.map((item: any, idx: number) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelinePoint} />
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>
                <Text style={styles.timelineDesc}>{item.description}</Text>
              </View>
            </View>
          ))}
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
    padding: 20
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7F3'
  },
  errorText: {
    color: '#B56B6B',
    fontFamily: 'Inter_700Bold',
    fontSize: 14
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 8,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  category: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    letterSpacing: 0.5
  },
  title: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F',
    marginBottom: 8
  },
  desc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#555555',
    lineHeight: 20,
    marginBottom: 16
  },
  mapContainer: {
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E1DA'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  section: {
    marginTop: 12
  },
  sectionHeading: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#888888',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  evidenceImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  workerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  workerName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#2F2F2F'
  },
  workerRole: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    marginTop: 2
  },
  workerPhone: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888888',
    marginTop: 4
  },
  verificationCard: {
    padding: 16,
    backgroundColor: '#FAF5E6',
    borderWidth: 1,
    borderColor: '#C9A86A',
    borderRadius: 8,
    marginBottom: 16
  },
  verificationTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#C9A86A',
    marginBottom: 4
  },
  verificationDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#8C6D32',
    lineHeight: 16,
    marginBottom: 16
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 12
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#8C6D32',
    marginBottom: 6
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 4,
    padding: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#2F2F2F',
    textAlignVertical: 'top',
    marginBottom: 12
  },
  timelineItem: {
    flexDirection: 'row',
    marginVertical: 8
  },
  timelinePoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6D8B74',
    marginTop: 5,
    marginRight: 12
  },
  timelineContent: {
    flex: 1
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  timelineTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#2F2F2F'
  },
  timelineTime: {
    fontSize: 10,
    color: '#888888',
    fontFamily: 'Inter_400Regular'
  },
  timelineDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    lineHeight: 16
  }
});
