import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { apiClient } from '../../services/api/apiClient';
import { useAuth } from '../../services/auth/AuthContext';

export default function AuthorityDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['authorityDashboard'],
    queryFn: async () => {
      const res: any = await apiClient.get('/authority/dashboard');
      return res?.data || res;
    }
  });

  const issues = dashboardData?.priorityQueue || [];
  const metrics = dashboardData?.metrics || { total: 0, critical: 0, high: 0, pending: 0, resolved: 0 };

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
            <Text style={styles.welcome}>COMMAND CENTER</Text>
            <Text style={styles.officerName}>{user?.name || 'Officer Dashboard'}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kpiContainer}>
          <Card style={styles.kpiBox}>
            <Text style={styles.kpiNum}>{metrics.total}</Text>
            <Text style={styles.kpiLabel}>TOTAL</Text>
          </Card>
          <Card style={[styles.kpiBox, { borderLeftWidth: 3, borderLeftColor: '#B56B6B' }]}>
            <Text style={[styles.kpiNum, { color: '#B56B6B' }]}>{(metrics.critical || 0) + (metrics.high || 0)}</Text>
            <Text style={styles.kpiLabel}>URGENT</Text>
          </Card>
          <Card style={[styles.kpiBox, { borderLeftWidth: 3, borderLeftColor: '#C9A86A' }]}>
            <Text style={[styles.kpiNum, { color: '#C9A86A' }]}>{metrics.pending}</Text>
            <Text style={styles.kpiLabel}>PENDING</Text>
          </Card>
          <Card style={[styles.kpiBox, { borderLeftWidth: 3, borderLeftColor: '#6D8B74' }]}>
            <Text style={[styles.kpiNum, { color: '#6D8B74' }]}>{metrics.resolved}</Text>
            <Text style={styles.kpiLabel}>SOLVED</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>PRIORITY QUEUE ORDERED BY AI SCORE</Text>

        {isLoading ? (
          <ActivityIndicator color="#2F2F2F" size="large" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={issues}
            keyExtractor={(item) => item.issueId}
            refreshing={isLoading}
            onRefresh={refetch}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active issues in the priority queue.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/authority/issue-detail?id=${item.issueId}`)}>
                <Card style={styles.issueCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.priorityBox}>
                      <Text style={styles.priorityText}>Score: {item.priority}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>

                  <Text style={styles.issueTitle}>{item.title}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
                    <View style={styles.statsRow}>
                      <Text style={styles.statsText}>👍 {item.supporters || 1}</Text>
                      <Text style={[styles.statsText, { marginLeft: 8 }]}>🙋‍♂️ {item.volunteers || 0}</Text>
                    </View>
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
  officerName: {
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
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  kpiBox: {
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 4
  },
  kpiNum: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F'
  },
  kpiLabel: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    marginTop: 2,
    letterSpacing: 0.5
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
  issueCard: {
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
  issueTitle: {
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statsText: {
    fontSize: 11,
    color: '#555555',
    fontFamily: 'Inter_400Regular'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20
  },
  emptyText: {
    color: '#888888',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center'
  }
});
