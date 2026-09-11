import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { apiClient } from '../../services/api/apiClient';

export default function AuthorityIssueDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Fetch issue details
  const { data: issue, isLoading: issueLoading, error: issueError } = useQuery({
    queryKey: ['authorityIssueDetail', id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/authority/issues/${id}`);
      return res?.data || res;
    },
    enabled: !!id
  });

  // 2. Fetch available workers
  const { data: workers, isLoading: workersLoading } = useQuery({
    queryKey: ['authorityWorkers'],
    queryFn: async () => {
      const res: any = await apiClient.get('/authority/workers');
      return res?.data || res;
    }
  });

  // 3. Mutation to verify ticket (REPORTED -> VERIFIED)
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res: any = await apiClient.post(`/authority/issues/${id}/verify`, {});
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorityIssueDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['authorityDashboard'] });
      Alert.alert('Report Verified', 'Issue has been approved and moved to the dispatch queue.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Verification failed.';
      Alert.alert('Error', msg);
    }
  });

  // 4. Mutation to assign technician
  const assignMutation = useMutation({
    mutationFn: async (workerId: string) => {
      const res: any = await apiClient.post(`/authority/issues/${id}/assign`, { workerId });
      return res?.data || res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorityIssueDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['authorityDashboard'] });
      Alert.alert('Worker Dispatched', 'Field worker has been assigned successfully.', [
        { text: 'OK', onPress: () => router.replace('/authority/dashboard') }
      ]);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || 'Assignment failed.';
      Alert.alert('Error', msg);
    }
  });

  const isLoading = issueLoading || workersLoading;

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#2F2F2F" size="large" />
      </View>
    );
  }

  if (issueError || !issue) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Report details could not be loaded.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <Text style={styles.category}>{issue.category?.toUpperCase()}</Text>
            <StatusBadge status={issue.status} />
          </View>
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.desc}>{issue.description}</Text>

          {issue.evidence?.[0]?.url && (
            <Image source={{ uri: issue.evidence[0].url }} style={styles.evidenceImage} />
          )}
        </Card>

        {/* Priority and Severity KPIs */}
        <Card style={styles.infoCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>AI Priority Rating</Text>
            <Text style={styles.metaValue}>{issue.priority} / 100</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Severity Category</Text>
            <Text style={styles.metaValue}>{issue.severity}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Assigned Department</Text>
            <Text style={styles.metaValue}>{issue.department}</Text>
          </View>
        </Card>

        {/* Verification Action (If status is REPORTED) */}
        {issue.status === 'REPORTED' && (
          <Card style={styles.actionCard}>
            <Text style={styles.panelTitle}>Verify Report Validity</Text>
            <Text style={styles.panelDesc}>Verify this ticket to authorize resource allocation and enable field technician dispatching.</Text>
            <Button
              title="VERIFY & APPROVE REPORT"
              variant="success"
              loading={verifyMutation.isPending}
              onPress={() => verifyMutation.mutate()}
            />
          </Card>
        )}

        {/* Dispatch Panel (If status is VERIFIED / REOPENED) */}
        {(issue.status === 'VERIFIED' || issue.status === 'REOPENED') && (
          <Card style={styles.actionCard}>
            <Text style={styles.panelTitle}>DISPATCH FIELD WORKER</Text>
            <Text style={styles.panelDesc}>Select an available technician in the {issue.department} department.</Text>

            {workers && workers.length > 0 ? (
              workers
                .filter((w: any) => w.status === 'AVAILABLE')
                .map((w: any) => (
                  <Card key={w.employeeId} style={styles.workerItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.workerName}>{w.name}</Text>
                      <Text style={styles.workerRole}>{w.role} ({w.skill})</Text>
                      <Text style={styles.workerScore}>Civic Score: {w.civicScore}%</Text>
                    </View>
                    <Button
                      title="DISPATCH"
                      variant="primary"
                      loading={assignMutation.isPending}
                      onPress={() => assignMutation.mutate(w.employeeId)}
                    />
                  </Card>
                ))
            ) : (
              <Text style={styles.emptyText}>No available technicians in this department.</Text>
            )}
          </Card>
        )}

        {/* Assigned Worker Details (If status is ASSIGNED / IN_PROGRESS / RESOLVED / CLOSED) */}
        {issue.assignedWorker?.name && (
          <Card style={styles.completedCard}>
            <Text style={styles.panelTitle}>ASSIGNED TECHNICIAN</Text>
            <Text style={styles.workerName}>{issue.assignedWorker.name}</Text>
            <Text style={styles.workerRole}>{issue.assignedWorker.role || 'Field Engineer'}</Text>
            {issue.assignedWorker.phone && (
              <Text style={styles.workerPhone}>Contact: {issue.assignedWorker.phone}</Text>
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
    lineHeight: 18,
    marginBottom: 16
  },
  evidenceImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  panelTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#2F2F2F',
    letterSpacing: 1.5,
    marginBottom: 4
  },
  panelDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    marginBottom: 16,
    lineHeight: 16
  },
  workerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F7F3',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4
  },
  workerName: {
    color: '#2F2F2F',
    fontSize: 14,
    fontFamily: 'Inter_700Bold'
  },
  workerRole: {
    color: '#666666',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2
  },
  workerScore: {
    color: '#6D8B74',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    marginTop: 2
  },
  workerPhone: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#888888',
    marginTop: 4
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E1DA'
  },
  metaLabel: {
    fontSize: 12,
    color: '#777777',
    fontFamily: 'Inter_700Bold'
  },
  metaValue: {
    fontSize: 12,
    color: '#2F2F2F',
    fontFamily: 'Inter_700Bold'
  },
  emptyText: {
    color: '#888888',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12
  }
});
