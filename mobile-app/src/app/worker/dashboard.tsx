import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { apiClient } from '../../services/api/apiClient';
import { useAuth } from '../../services/auth/AuthContext';

export default function WorkerDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['workerTasks'],
    queryFn: async () => {
      const res: any = await apiClient.get('/worker/tasks');
      return res?.data || res;
    }
  });

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await signOut();
        router.replace('/');
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>FIELD WORKER PORTAL</Text>
            <Text style={styles.workerName}>{user?.name || 'Technician User'}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>MY ASSIGNED TASKS</Text>

        {isLoading ? (
          <ActivityIndicator color="#2F2F2F" size="large" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={tasks || []}
            keyExtractor={(item) => item.issueId}
            refreshing={isLoading}
            onRefresh={refetch}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active work orders assigned to you.</Text>
                <Text style={styles.emptySubText}>New tasks will appear here when dispatched by the Command Center.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/worker/task-detail?id=${item.issueId}`)}>
                <Card style={styles.taskCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.priorityBox}>
                      <Text style={styles.priorityText}>Priority: {item.priority}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  <Text style={styles.taskTitle}>{item.title}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
                    <Text style={styles.actionLink}>OPEN WORKORDER &gt;</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F7F3'
  },
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  welcome: {
    color: '#6D8B74',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5
  },
  workerName: {
    color: '#2F2F2F',
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_900Black',
    marginTop: 2
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#B56B6B'
  },
  logoutText: {
    color: '#B56B6B',
    fontSize: 10,
    fontFamily: 'Inter_700Bold'
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    letterSpacing: 1,
    marginBottom: 16
  },
  listContainer: {
    paddingBottom: 20
  },
  taskCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 8
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  priorityBox: {
    backgroundColor: '#FAF5E6',
    borderWidth: 1,
    borderColor: '#C9A86A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  priorityText: {
    color: '#8C6D32',
    fontSize: 10,
    fontFamily: 'Inter_700Bold'
  },
  taskTitle: {
    color: '#2F2F2F',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E1DA',
    paddingTop: 10
  },
  categoryText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#777777'
  },
  actionLink: {
    color: '#6D8B74',
    fontSize: 11,
    fontFamily: 'Inter_700Bold'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20
  },
  emptyText: {
    color: '#666666',
    fontFamily: 'PlayfairDisplay_900Black',
    fontSize: 16,
    textAlign: 'center'
  },
  emptySubText: {
    color: '#888888',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6
  }
});
