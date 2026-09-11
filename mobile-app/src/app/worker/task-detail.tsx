import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { Input } from '../../shared/components/Input';
import { apiClient } from '../../services/api/apiClient';

export default function WorkerTaskDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);

  // 1. Fetch task details
  const { data: task, isLoading, error } = useQuery({
    queryKey: ['workerTaskDetail', id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/worker/tasks/${id}`);
      return res?.data || res;
    },
    enabled: !!id
  });

  // 2. Mutation for starting work
  const startWorkMutation = useMutation({
    mutationFn: async () => {
      const res: any = await apiClient.post(`/worker/tasks/${id}/start`, {});
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerTaskDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['workerTasks'] });
      Alert.alert('Work Started', 'Status has been updated to IN PROGRESS.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to start task.';
      Alert.alert('Error', msg);
    }
  });

  // 3. Mutation for completing work
  const resolveMutation = useMutation({
    mutationFn: async (payload: { resolutionNote: string; resolutionEvidence: string[] }) => {
      const res: any = await apiClient.post(`/worker/tasks/${id}/resolve`, payload);
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workerTaskDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['workerTasks'] });
      Alert.alert('Resolution Submitted', 'Work completed. Dispatched for citizen verification.', [
        { text: 'OK', onPress: () => router.replace('/worker/dashboard') }
      ]);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Failed to submit resolution.';
      Alert.alert('Error', msg);
    }
  });

  const handleCaptureResolutionPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'JanSetu requires camera permissions to document resolution.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        base64: true
      });

      if (result.canceled || !result.assets?.[0]) return;

      const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setResolutionPhoto(base64Data);
    } catch (e) {
      Alert.alert('Error', 'Failed to capture photo.');
    }
  };

  const handleCompleteWork = () => {
    if (!notes.trim()) {
      Alert.alert('Validation Error', 'Please enter technician resolution notes.');
      return;
    }
    if (!resolutionPhoto) {
      Alert.alert('Validation Error', 'Please capture a resolution proof photo.');
      return;
    }

    resolveMutation.mutate({
      resolutionNote: notes.trim(),
      resolutionEvidence: [resolutionPhoto]
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#2F2F2F" size="large" />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Task details could not be loaded.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <Text style={styles.category}>{task.category?.toUpperCase()}</Text>
            <StatusBadge status={task.status} />
          </View>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.desc}>{task.description}</Text>

          {task.evidence?.[0]?.url && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.imgLabel}>BEFORE WORK PHOTO:</Text>
              <Image source={{ uri: task.evidence[0].url }} style={styles.evidenceImage} />
            </View>
          )}
        </Card>

        {task.status === 'ASSIGNED' && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionTitle}>Activate Dispatch Order</Text>
            <Text style={styles.actionDesc}>Signal to the Command Center that you are starting operations on site.</Text>
            <Button
              title="START WORK NOW"
              variant="primary"
              loading={startWorkMutation.isPending}
              onPress={() => startWorkMutation.mutate()}
            />
          </Card>
        )}

        {task.status === 'IN_PROGRESS' && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionTitle}>Resolve Civic Ticket</Text>
            <Text style={styles.actionDesc}>Provide repair details and capture a photo of the completed repairs.</Text>

            <Input
              label="Technician Resolution Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Cleared garbage heap and sanitised area"
            />

            {!resolutionPhoto ? (
              <Button
                title="CAPTURE RESOLUTION PHOTO EVIDENCE"
                variant="outline"
                style={{ marginBottom: 16 }}
                onPress={handleCaptureResolutionPhoto}
              />
            ) : (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.imgLabel}>AFTER RESOLUTION PREVIEW:</Text>
                <Image source={{ uri: resolutionPhoto }} style={styles.evidenceImage} />
                <Button
                  title="Change Photo"
                  variant="outline"
                  style={{ marginTop: 8 }}
                  onPress={() => setResolutionPhoto(null)}
                />
              </View>
            )}

            <Button
              title="SUBMIT FOR CITIZEN VERIFICATION"
              variant="success"
              loading={resolveMutation.isPending}
              onPress={handleCompleteWork}
            />
          </Card>
        )}

        {(task.status === 'RESOLVED' || task.status === 'CITIZEN_VERIFICATION' || task.status === 'CLOSED') && (
          <Card style={styles.completedCard}>
            <Text style={styles.actionTitle}>Task Completed</Text>
            <Text style={styles.actionDesc}>This workorder is completed and awaits citizen feedback/verification.</Text>
            {task.resolution?.note && (
              <View style={styles.noteBox}>
                <Text style={styles.noteHeading}>Resolution Note:</Text>
                <Text style={styles.noteContent}>{task.resolution.note}</Text>
              </View>
            )}
            {task.resolution?.evidence?.[0]?.url && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.imgLabel}>AFTER RESOLUTION PHOTO:</Text>
                <Image source={{ uri: task.resolution.evidence[0].url }} style={styles.evidenceImage} />
              </View>
            )}
          </Card>
        )}
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
  loader: {
    flex: 1,
    backgroundColor: '#F8F7F3',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: '#B56B6B',
    fontFamily: 'Inter_700Bold',
    fontSize: 14
  },
  infoCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 8,
    marginBottom: 16
  },
  actionCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 8,
    marginBottom: 16
  },
  completedCard: {
    padding: 16,
    backgroundColor: '#FAF5E6',
    borderWidth: 1,
    borderColor: '#C9A86A',
    borderRadius: 8,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  category: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#777777'
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
    color: '#666666',
    lineHeight: 18
  },
  imgLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  evidenceImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F',
    marginBottom: 4
  },
  actionDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    marginBottom: 16,
    lineHeight: 16
  },
  noteBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 4,
    padding: 12,
    marginTop: 8
  },
  noteHeading: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    marginBottom: 4
  },
  noteContent: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#2F2F2F',
    lineHeight: 18
  }
});
