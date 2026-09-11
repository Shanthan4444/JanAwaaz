import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { citizenApi } from '../../services/api/citizenApi';
import { useAuth } from '../../services/auth/AuthContext';

export default function CitizenDashboard() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  // 1. Fetch Citizen Profile & Stats
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['citizenProfile'],
    queryFn: citizenApi.getProfile
  });

  // 2. Fetch Citizen's Submitted Issues
  const { data: issues, isLoading: issuesLoading, refetch: refetchIssues } = useQuery({
    queryKey: ['citizenIssues'],
    queryFn: () => citizenApi.getIssues()
  });

  const handleRefresh = async () => {
    await Promise.all([refetchProfile(), refetchIssues()]);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await signOut();
        router.replace('/');
      }}
    ]);
  };

  const isPageLoading = profileLoading || issuesLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Citizen Portal</Text>
            <Text style={styles.citizenName}>{profile?.name || user?.name || 'Citizen User'}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>

        {/* Action Card */}
        <Card style={styles.actionCard}>
          <Text style={styles.actionTitle}>Reported a Civic Hazard?</Text>
          <Text style={styles.actionDesc}>Submit visual evidence with GPS location. Our AI categorizes and dispatches to appropriate authorities instantly.</Text>
          <Button
            title="REPORT NEW CIVIC ISSUE"
            onPress={() => router.push('/citizen/report')}
            style={styles.actionBtn}
          />
        </Card>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Card style={styles.statBox}>
            <Text style={styles.statNum}>{profile?.metrics?.reportedIssues || 0}</Text>
            <Text style={styles.statLabel}>REPORTED</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#6D8B74' }]}>{profile?.metrics?.closedIssues || 0}</Text>
            <Text style={styles.statLabel}>RESOLVED</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#C9A86A' }]}>{profile?.metrics?.supportedIssues || 0}</Text>
            <Text style={styles.statLabel}>UPVOTES</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>MY FILED REPORTS</Text>

        {isPageLoading ? (
          <ActivityIndicator color="#2F2F2F" size="large" style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={issues || []}
            keyExtractor={(item) => item.issueId}
            refreshing={isPageLoading}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>You haven't filed any reports yet.</Text>
                <Text style={styles.emptySubText}>Tap the report button above to file your first civic report.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/citizen/track?id=${item.issueId}`)}>
                <Card style={styles.issueCard}>
                  <View style={styles.issueHeader}>
                    <Text style={styles.issueCategory}>{item.category.toUpperCase()}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={styles.issueTitle}>{item.title}</Text>
                  <View style={styles.issueFooter}>
                    <Text style={styles.issueId}>ID: {item.issueId}</Text>
                    <Text style={styles.trackLink}>TRACK STATUS &gt;</Text>
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
    color: '#666666',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  citizenName: {
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
  actionCard: {
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2F2F2F',
    backgroundColor: '#FFFFFF',
    padding: 16
  },
  actionTitle: {
    color: '#2F2F2F',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_900Black',
    marginBottom: 4
  },
  actionDesc: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    marginBottom: 16
  },
  actionBtn: {
    borderRadius: 4,
    backgroundColor: '#2F2F2F'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  statBox: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF'
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F'
  },
  statLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    marginTop: 4,
    letterSpacing: 1
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    letterSpacing: 1.5,
    marginBottom: 12
  },
  listContainer: {
    paddingBottom: 20
  },
  issueCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF'
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  issueCategory: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#777777',
    letterSpacing: 0.5
  },
  issueTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#2F2F2F',
    marginBottom: 12
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E1DA',
    paddingTop: 10
  },
  issueId: {
    fontFamily: 'monospace',
    color: '#888888',
    fontSize: 11
  },
  trackLink: {
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
