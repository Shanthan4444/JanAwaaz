import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  useColorScheme,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';

// ==========================================
// 1. THEMES DEFINITION (LIGHT & DARK BUILD)
// ==========================================
const themes = {
  dark: {
    background: '#090A0F',
    card: '#11131E',
    border: '#1E2235',
    text: '#FFFFFF',
    textSec: '#94A3B8',
    primary: '#6366F1',
    primarySubtle: 'rgba(99, 102, 241, 0.12)',
    success: '#10B981',
    successSubtle: 'rgba(16, 185, 129, 0.12)',
    danger: '#EF4444',
    dangerSubtle: 'rgba(239, 68, 68, 0.12)',
    warning: '#F59E0B',
    warningSubtle: 'rgba(245, 158, 11, 0.12)'
  },
  light: {
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textSec: '#64748B',
    primary: '#6366F1',
    primarySubtle: 'rgba(99, 102, 241, 0.08)',
    success: '#10B981',
    successSubtle: 'rgba(16, 185, 129, 0.08)',
    danger: '#EF4444',
    dangerSubtle: 'rgba(239, 68, 68, 0.08)',
    warning: '#F59E0B',
    warningSubtle: 'rgba(245, 158, 11, 0.08)'
  }
};

export default function App() {
  const systemScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  // Active theme based on system settings
  const [themeMode, setThemeMode] = useState<'automatic' | 'light' | 'dark'>('automatic');
  const activeTheme = themeMode === 'automatic'
    ? (systemScheme === 'dark' ? themes.dark : themes.light)
    : (themeMode === 'dark' ? themes.dark : themes.light);

  // Dynamic Navigation State
  const [currentScreen, setCurrentScreen] = useState<string>('portal-select');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Authentication Session State
  const [userToken, setUserToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Mock Database State (in-sync with backend schema)
  const [issues, setIssues] = useState<any[]>([
    {
      issueId: 'JAN-AUG-2026-1042',
      title: 'Water pipe leak Green Park Road',
      description: 'Major water pipeline burst causing road flooding and sub-grade erosion near crossing.',
      category: 'Water Leakage',
      department: 'Jal Board / Water Works',
      status: 'REPORTED',
      priority: 88,
      severity: 'HIGH',
      supporters: 14,
      volunteers: 2,
      reopenCount: 0,
      area: 'Sector 14',
      landmark: 'Green Park Main Rd',
      evidence: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80']
    },
    {
      issueId: 'JAN-AUG-2026-1043',
      title: 'Unchecked garbage heaps next to school',
      description: 'Piles of solid plastic wastes left uncollected for the past 6 days.',
      category: 'Garbage',
      department: 'Solid Waste Management',
      status: 'RESOLVED',
      priority: 76,
      severity: 'MEDIUM',
      supporters: 8,
      volunteers: 1,
      reopenCount: 1,
      area: 'University Road',
      landmark: 'Gate No 2 Crossing',
      evidence: ['https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80'],
      resolutionEvidence: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80']
    }
  ]);

  // Auth Inputs
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [officerEmail, setOfficerEmail] = useState('officer@jansetu.gov.in');
  const [officerPassword, setOfficerPassword] = useState('admin123');
  const [workerId, setWorkerId] = useState('W-01');
  const [workerPassword, setWorkerPassword] = useState('worker123');

  // Reporting Wizard state
  const [reportStep, setReportStep] = useState(1);
  const [reportImage, setReportImage] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportCategory, setReportCategory] = useState('Road Damage');
  const [reportLandmark, setReportLandmark] = useState('');
  const [reportSeverity, setReportSeverity] = useState('HIGH');
  const [reportPriority, setReportPriority] = useState(85);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  // Resolution inputs
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==========================================
  // SHARED API ACTION METHODS (MOCK SIMULATION)
  // ==========================================
  const handleCitizenLogin = () => {
    if (!loginPhone) return;
    if (!otpSent) {
      setLoading(true);
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        setLoginOtp('123456');
      }, 800);
    } else {
      if (loginOtp !== '123456') {
        Alert.alert('Error', 'Invalid OTP code. Use 123456.');
        return;
      }
      setUserToken('mock_citizen_token');
      setCurrentUser({ id: 'citizen-001', name: 'Demo Citizen', role: 'CITIZEN' });
      setCurrentScreen('citizen-dashboard');
    }
  };

  const handleOfficerLogin = () => {
    if (officerPassword !== 'admin123') {
      Alert.alert('Error', 'Invalid password. Use admin123.');
      return;
    }
    setUserToken('mock_officer_token');
    setCurrentUser({ id: 'officer-001', name: 'Municipal Officer', role: 'OFFICER', department: 'Roads & Infrastructure' });
    setCurrentScreen('authority-dashboard');
  };

  const handleWorkerLogin = () => {
    if (workerPassword !== 'worker123') {
      Alert.alert('Error', 'Invalid password. Use worker123.');
      return;
    }
    setUserToken('mock_worker_token');
    setCurrentUser({ id: 'worker-001', name: 'Ramesh Kumar', role: 'WORKER', workerId: workerId });
    setCurrentScreen('worker-dashboard');
  };

  const simulateCameraCapture = async () => {
    setLoading(true);
    setReportStep(2); // AI Processing

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied.');
      }
      setReportImage('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80');

      setTimeout(() => {
        // High fidelity AI analysis mock
        setReportTitle('Asphalt road cracking and pothole hazard');
        setReportDesc('Severe structural cracking on the road surface causing transit slowdowns.');
        setReportCategory('Road Damage');
        setReportLandmark('Sector 14 Crossing');
        setReportSeverity('HIGH');
        setReportPriority(88);

        // Find duplicates
        setDuplicates([
          {
            issueId: 'JAN-AUG-2026-1042',
            title: 'Water pipe leak Green Park Road',
            similarity: 0.72
          }
        ]);
        setLoading(false);
        setReportStep(3); // Duplicate Check
      }, 2000);
    } catch (e) {
      setLoading(false);
      setReportStep(4);
    }
  };

  const submitNewIssue = () => {
    const newId = `JAN-AUG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIssue = {
      issueId: newId,
      title: reportTitle,
      description: reportDesc,
      category: reportCategory,
      department: getDept(reportCategory),
      status: 'REPORTED',
      priority: reportPriority,
      severity: reportSeverity,
      supporters: 1,
      volunteers: 0,
      reopenCount: 0,
      area: 'Sector 14',
      landmark: reportLandmark,
      evidence: [reportImage]
    };

    setIssues([newIssue, ...issues]);
    Alert.alert('Success', `Report filed successfully! ID: ${newId}`);
    setCurrentScreen('citizen-dashboard');
    resetReportState();
  };

  const resetReportState = () => {
    setReportStep(1);
    setReportImage(null);
    setReportTitle('');
    setReportDesc('');
    setReportLandmark('');
    setDuplicates([]);
  };

  const handleSupport = (issueId: string) => {
    setIssues(issues.map(i => {
      if (i.issueId === issueId) {
        return { ...i, supporters: i.supporters + 1 };
      }
      return i;
    }));
    Alert.alert('Support Recorded', 'Consolidating local urgency metrics.');
  };

  const handleVerifyYes = (issueId: string) => {
    setIssues(issues.map(i => {
      if (i.issueId === issueId) {
        return { ...i, status: 'CLOSED' };
      }
      return i;
    }));
    Alert.alert('Verified', 'Issue closed successfully!');
    setCurrentScreen('citizen-dashboard');
  };

  const handleVerifyNo = (issueId: string) => {
    if (!reopenReason) {
      setShowReopenInput(true);
      return;
    }
    setIssues(issues.map(i => {
      if (i.issueId === issueId) {
        return { ...i, status: 'REOPENED', reopenCount: i.reopenCount + 1, priority: Math.min(i.priority + 15, 100) };
      }
      return i;
    }));
    Alert.alert('Reopened', 'Issue escalated to Command Center.');
    setShowReopenInput(false);
    setReopenReason('');
    setCurrentScreen('citizen-dashboard');
  };

  const handleAssignWorker = (issueId: string, workerName: string) => {
    setIssues(issues.map(i => {
      if (i.issueId === issueId) {
        return { ...i, status: 'ASSIGNED', assignedWorker: { name: workerName, role: 'Field Technician' } };
      }
      return i;
    }));
    Alert.alert('Dispatched', `Assigned task to ${workerName}.`);
    setCurrentScreen('authority-dashboard');
  };

  const handleStartWork = (issueId: string) => {
    setIssues(issues.map(i => {
      if (i.issueId === issueId) {
        return { ...i, status: 'IN_PROGRESS' };
      }
      return i;
    }));
    Alert.alert('In Progress', 'Status updated.');
  };

  const handleCompleteWork = (issueId: string) => {
    if (!resolutionPhoto) {
      Alert.alert('Capture Required', 'Please capture resolution photo evidence first.');
      return;
    }
    setIssues(issues.map(i => {
      if (i.issueId === issueId) {
        return { ...i, status: 'RESOLVED', resolutionEvidence: [resolutionPhoto] };
      }
      return i;
    }));
    Alert.alert('Resolved', 'Dispatched to Citizen for verification.');
    setCurrentScreen('worker-dashboard');
    setResolutionPhoto(null);
  };

  const simulateResolutionUpload = () => {
    setLoading(true);
    setTimeout(() => {
      setResolutionPhoto('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80');
      setLoading(false);
    }, 1000);
  };

  const getDept = (cat: string) => {
    switch (cat) {
      case 'Road Damage': return 'Roads & Infrastructure';
      case 'Garbage': return 'Solid Waste Management';
      case 'Water Leakage': return 'Jal Board / Water Works';
      default: return 'Municipal Services';
    }
  };

  const logout = () => {
    setUserToken(null);
    setCurrentUser(null);
    setOtpSent(false);
    setLoginOtp('');
    setCurrentScreen('portal-select');
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  const renderHeader = (title: string, onBack?: () => void) => (
    <View style={[styles.header, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
            <Text style={{ color: activeTheme.primary, fontSize: 16, fontWeight: '900' }}>&lt; BACK</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: activeTheme.text }]}>{title}</Text>
      </View>
      {userToken && (
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>EXIT</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: activeTheme.background }]}>
      <StatusBar style={activeTheme.text === '#FFFFFF' ? 'light' : 'dark'} />

      {/* Theme Switching System Header */}
      <View style={[styles.themeBar, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <Text style={[styles.themeLabel, { color: activeTheme.textSec }]}>THEME:</Text>
        <TouchableOpacity onPress={() => setThemeMode('automatic')} style={[styles.themeBtn, themeMode === 'automatic' && { borderColor: activeTheme.primary }]}>
          <Text style={[styles.themeBtnText, { color: themeMode === 'automatic' ? activeTheme.primary : activeTheme.textSec }]}>SYSTEM</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setThemeMode('light')} style={[styles.themeBtn, themeMode === 'light' && { borderColor: activeTheme.primary }]}>
          <Text style={[styles.themeBtnText, { color: themeMode === 'light' ? activeTheme.primary : activeTheme.textSec }]}>LIGHT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setThemeMode('dark')} style={[styles.themeBtn, themeMode === 'dark' && { borderColor: activeTheme.primary }]}>
          <Text style={[styles.themeBtnText, { color: themeMode === 'dark' ? activeTheme.primary : activeTheme.textSec }]}>DARK</Text>
        </TouchableOpacity>
      </View>

      {/* ==========================================
          SCREEN: PORTAL SELECTION INDEX
         ========================================== */}
      {currentScreen === 'portal-select' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.portalHeader}>
            <Text style={styles.portalTitle}>JANSETU</Text>
            <Text style={[styles.portalSubtitle, { color: activeTheme.primary }]}>CIVIC INTELLIGENCE NETWORK</Text>
            <Text style={[styles.portalTagline, { color: activeTheme.textSec }]}>Fully responsive, OTA-first mobile client</Text>
          </View>

          <View style={[styles.gridContainer, isTablet && styles.tabletGrid]}>
            <TouchableOpacity onPress={() => setCurrentScreen('citizen-login')} style={[styles.portalCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, width: isTablet ? '31%' : '100%' }]}>
              <Text style={[styles.cardTitle, { color: activeTheme.text }]}>Citizen Portal</Text>
              <Text style={[styles.cardDesc, { color: activeTheme.textSec }]}>Report local infrastructure hazards and verify resolved orders.</Text>
              <View style={[styles.cardAction, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.cardActionText}>ENTER CITIZEN APP</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentScreen('authority-login')} style={[styles.portalCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, width: isTablet ? '31%' : '100%' }]}>
              <Text style={[styles.cardTitle, { color: activeTheme.text }]}>Municipal Authority</Text>
              <Text style={[styles.cardDesc, { color: activeTheme.textSec }]}>Access the command queue, monitor priority widgets, and dispatch workers.</Text>
              <View style={[styles.cardAction, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.cardActionText}>COMMAND CENTER</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentScreen('worker-login')} style={[styles.portalCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, width: isTablet ? '31%' : '100%' }]}>
              <Text style={[styles.cardTitle, { color: activeTheme.text }]}>Field Technician</Text>
              <Text style={[styles.cardDesc, { color: activeTheme.textSec }]}>Manage assignments, update task states, and upload resolution proof.</Text>
              <View style={[styles.cardAction, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.cardActionText}>TECHNICIAN PORTAL</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ==========================================
          SCREENS: CITIZEN PORTAL MODULE
         ========================================== */}
      {currentScreen === 'citizen-login' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader('Citizen Verification', () => setCurrentScreen('portal-select'))}
          <View style={[styles.formContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Text style={[styles.formTitle, { color: activeTheme.text }]}>MOBILE LOGIN</Text>
            <Text style={[styles.formDesc, { color: activeTheme.textSec }]}>Sign in securely via OTP. Standard code is 123456.</Text>

            {!otpSent ? (
              <View>
                <Text style={[styles.label, { color: activeTheme.textSec }]}>MOBILE PHONE</Text>
                <TextInput
                  value={loginPhone}
                  onChangeText={setLoginPhone}
                  keyboardType="phone-pad"
                  style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                />
                <TouchableOpacity onPress={handleCitizenLogin} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary }]}>
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>SEND OTP</Text>}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.label, { color: activeTheme.textSec }]}>ENTER OTP CODE</Text>
                <TextInput
                  value={loginOtp}
                  onChangeText={setLoginOtp}
                  keyboardType="numeric"
                  placeholder="Enter 123456"
                  placeholderTextColor={activeTheme.textSec}
                  style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                />
                <TouchableOpacity onPress={handleCitizenLogin} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary }]}>
                  <Text style={styles.btnText}>VERIFY & LOGIN</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {currentScreen === 'citizen-dashboard' && (
        <View style={{ flex: 1 }}>
          {renderHeader('My Civic Reports')}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.bannerCard, { backgroundColor: activeTheme.primarySubtle, borderColor: activeTheme.primary }]}>
              <Text style={[styles.bannerTitle, { color: activeTheme.text }]}>Need to Report an Issue?</Text>
              <Text style={[styles.bannerDesc, { color: activeTheme.textSec }]}>File a visual report with real-time AI metadata scanning.</Text>
              <TouchableOpacity onPress={() => setCurrentScreen('citizen-report')} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary, marginTop: 12 }]}>
                <Text style={styles.btnText}>REPORT NEW ISSUE</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: activeTheme.primary }]}>SUBMITTED REPORT LIST</Text>

            {issues.map((item) => (
              <TouchableOpacity key={item.issueId} onPress={() => { setSelectedIssueId(item.issueId); setCurrentScreen('citizen-track'); }}>
                <View style={[styles.itemCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.itemCat, { color: activeTheme.textSec }]}>{item.category.toUpperCase()}</Text>
                    <View style={[styles.badge, { backgroundColor: item.status === 'RESOLVED' ? activeTheme.successSubtle : activeTheme.primarySubtle }]}>
                      <Text style={{ color: item.status === 'RESOLVED' ? activeTheme.success : activeTheme.primary, fontSize: 10, fontWeight: '800' }}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.itemTitle, { color: activeTheme.text }]}>{item.title}</Text>
                  <View style={styles.itemFooter}>
                    <Text style={[styles.itemId, { color: activeTheme.textSec }]}>ID: {item.issueId}</Text>
                    <Text style={{ color: activeTheme.primary, fontSize: 12, fontWeight: '800' }}>TRACK DETAILS &gt;</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {currentScreen === 'citizen-report' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader('File New Report', () => { resetReportState(); setCurrentScreen('citizen-dashboard'); })}

          {reportStep === 1 && (
            <View style={[styles.formContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
              <Text style={[styles.formTitle, { color: activeTheme.text }]}>Visual Evidence Capture</Text>
              <Text style={[styles.formDesc, { color: activeTheme.textSec }]}>Snap or select a photo of the civic hazard. Geolocation details will be gathered automatically.</Text>
              <TouchableOpacity onPress={simulateCameraCapture} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary }]}>
                <Text style={styles.btnText}>CAPTURE EVIDENCE</Text>
              </TouchableOpacity>
            </View>
          )}

          {reportStep === 2 && (
            <View style={[styles.formContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, alignItems: 'center' }]}>
              <ActivityIndicator color={activeTheme.primary} size="large" style={{ marginBottom: 16 }} />
              <Text style={[styles.formTitle, { color: activeTheme.text }]}>AI ANALYSIS ACTIVE</Text>
              <Text style={[styles.formDesc, { color: activeTheme.textSec, textAlign: 'center' }]}>Resolving coordinates, loading category classifications, and checking neighborhood duplicate registries...</Text>
            </View>
          )}

          {reportStep === 3 && (
            <View>
              <View style={[styles.warningCard, { backgroundColor: activeTheme.warningSubtle, borderColor: activeTheme.warning }]}>
                <Text style={{ color: activeTheme.warning, fontSize: 16, fontWeight: '900', marginBottom: 4 }}>Similar Issue Already Exists</Text>
                <Text style={{ color: activeTheme.warning, fontSize: 12, lineHeight: 16 }}>Another citizen reported a similar hazard nearby. You can support this ticket to consolidate municipal attention.</Text>
              </View>

              {duplicates.map((dup) => (
                <View key={dup.issueId} style={[styles.formContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, marginBottom: 12 }]}>
                  <Text style={[styles.itemId, { color: activeTheme.primary }]}>ID: {dup.issueId}</Text>
                  <Text style={[styles.itemTitle, { color: activeTheme.text }]}>{dup.title}</Text>
                  <TouchableOpacity onPress={() => handleSupport(dup.issueId)} style={[styles.successBtn, { backgroundColor: activeTheme.success, marginTop: 12 }]}>
                    <Text style={styles.btnText}>SUPPORT THIS ISSUE (+15 Urgency)</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity onPress={() => setReportStep(4)} style={[styles.outlineBtn, { borderColor: activeTheme.primary, marginTop: 12 }]}>
                <Text style={{ color: activeTheme.primary, fontWeight: '800' }}>File New Ticket Anyway</Text>
              </TouchableOpacity>
            </View>
          )}

          {reportStep === 4 && (
            <View style={[styles.formContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
              <Text style={[styles.formTitle, { color: activeTheme.text }]}>Verify AI Summary</Text>
              {reportImage && <Image source={{ uri: reportImage }} style={styles.previewImg} />}

              <Text style={[styles.label, { color: activeTheme.textSec }]}>TITLE</Text>
              <TextInput value={reportTitle} onChangeText={setReportTitle} style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]} />

              <Text style={[styles.label, { color: activeTheme.textSec }]}>DESCRIPTION</Text>
              <TextInput value={reportDesc} onChangeText={setReportDesc} multiline numberOfLines={3} style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background, height: 70 }]} />

              <Text style={[styles.label, { color: activeTheme.textSec }]}>DETECTED LANDMARK</Text>
              <TextInput value={reportLandmark} onChangeText={setReportLandmark} style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]} />

              <View style={styles.rowBetween}>
                <Text style={{ color: activeTheme.textSec, fontWeight: '700' }}>Estimated Severity:</Text>
                <Text style={{ color: activeTheme.danger, fontWeight: '900' }}>{reportSeverity}</Text>
              </View>

              <TouchableOpacity onPress={submitNewIssue} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary, marginTop: 20 }]}>
                <Text style={styles.btnText}>CONFIRM & SUBMIT ISSUE</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {currentScreen === 'citizen-track' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader('Track Details', () => setCurrentScreen('citizen-dashboard'))}
          {(() => {
            const item = issues.find(i => i.issueId === selectedIssueId);
            if (!item) return null;
            const trustScore = Math.min(45 + (item.supporters || 0) * 8 + (item.volunteers || 0) * 12, 100);

            return (
              <View>
                <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.itemCat, { color: activeTheme.textSec }]}>{item.category.toUpperCase()}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={[styles.itemTitle, { color: activeTheme.text, fontSize: 18, marginTop: 6 }]}>{item.title}</Text>
                  <Text style={[styles.itemDesc, { color: activeTheme.textSec, marginTop: 8 }]}>{item.description}</Text>
                </Card>

                <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                  <Text style={{ color: activeTheme.primary, fontWeight: '900', fontSize: 12, letterSpacing: 1 }}>NEIGHBORHOOD ENGAGEMENT</Text>
                  <Text style={{ color: activeTheme.textSec, fontSize: 12, marginTop: 4 }}>🎯 {item.supporters} affected citizens supported this ticket.</Text>
                  
                  <View style={{ marginVertical: 12 }}>
                    <View style={styles.rowBetween}>
                      <Text style={{ color: activeTheme.textSec, fontSize: 11, fontWeight: '700' }}>Community Trust Rating</Text>
                      <Text style={{ color: activeTheme.success, fontSize: 11, fontWeight: '900' }}>{trustScore}%</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: activeTheme.background, borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
                      <View style={{ height: '100%', backgroundColor: activeTheme.success, width: `${trustScore}%` }} />
                    </View>
                  </View>

                  <Button title="AFFECTS ME TOO (+15 Urgency)" onPress={() => handleSupport(item.issueId)} />
                </Card>

                {item.status === 'RESOLVED' && (
                  <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.primary }}>
                    <Text style={{ color: activeTheme.primary, fontWeight: '900', fontSize: 14 }}>Awaiting Citizen Verification</Text>
                    <Text style={{ color: activeTheme.textSec, fontSize: 12, marginTop: 4 }}>Technicians logged repair evidence on site. Verify resolution to close.</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                      <View style={{ width: '48%' }}>
                        <Text style={{ color: activeTheme.textSec, fontSize: 10, fontWeight: '800', textAlign: 'center', marginBottom: 4 }}>BEFORE</Text>
                        <Image source={{ uri: item.evidence[0] }} style={{ width: '100%', height: 100, borderRadius: 6 }} />
                      </View>
                      <View style={{ width: '48%' }}>
                        <Text style={{ color: activeTheme.textSec, fontSize: 10, fontWeight: '800', textAlign: 'center', marginBottom: 4 }}>AFTER</Text>
                        <Image source={{ uri: item.resolutionEvidence[0] }} style={{ width: '100%', height: 100, borderRadius: 6 }} />
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                      <TouchableOpacity onPress={() => handleVerifyYes(item.issueId)} style={[styles.successBtn, { backgroundColor: activeTheme.success, flex: 1, marginRight: 8 }]}>
                        <Text style={styles.btnText}>YES, RESOLVED</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleVerifyNo(item.issueId)} style={[styles.dangerBtn, { backgroundColor: activeTheme.danger, flex: 1 }]}>
                        <Text style={styles.btnText}>NO, REOPEN</Text>
                      </TouchableOpacity>
                    </View>

                    {showReopenInput && (
                      <View style={{ marginTop: 16 }}>
                        <TextInput
                          value={reopenReason}
                          onChangeText={setReopenReason}
                          placeholder="Why is it unresolved?"
                          placeholderTextColor={activeTheme.textSec}
                          style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                        />
                        <TouchableOpacity onPress={() => handleVerifyNo(item.issueId)} style={[styles.dangerBtn, { backgroundColor: activeTheme.danger }]}>
                          <Text style={styles.btnText}>SUBMIT REOPEN REQUEST</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Card>
                )}
              </View>
            );
          })()}
        </ScrollView>
      )}

      {/* ==========================================
          SCREENS: AUTHORITY COMMAND CENTER MODULE
         ========================================== */}
      {currentScreen === 'authority-login' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader('Command Center Portal', () => setCurrentScreen('portal-select'))}
          <View style={[styles.formContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Text style={[styles.formTitle, { color: activeTheme.text }]}>OFFICIAL LOGIN</Text>
            <Text style={[styles.formDesc, { color: activeTheme.textSec }]}>Sign in using administrative credentials.</Text>

            <Text style={[styles.label, { color: activeTheme.textSec }]}>OFFICER EMAIL</Text>
            <TextInput value={officerEmail} onChangeText={setOfficerEmail} keyboardType="email-address" style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]} />

            <Text style={[styles.label, { color: activeTheme.textSec }]}>PASSWORD</Text>
            <TextInput value={officerPassword} onChangeText={setOfficerPassword} secureTextEntry style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]} />

            <TouchableOpacity onPress={handleOfficerLogin} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary }]}>
              <Text style={styles.btnText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentScreen === 'authority-dashboard' && (
        <View style={{ flex: 1 }}>
          {renderHeader('Command Queue')}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Command KPI Widgets */}
            <View style={styles.kpiContainer}>
              <Card style={[styles.kpiBox, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                <Text style={[styles.kpiNum, { color: activeTheme.text }]}>{issues.length}</Text>
                <Text style={[styles.kpiLabel, { color: activeTheme.textSec }]}>TOTAL</Text>
              </Card>
              <Card style={[styles.kpiBox, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderLeftWidth: 3, borderLeftColor: activeTheme.danger }]}>
                <Text style={[styles.kpiNum, { color: activeTheme.danger }]}>{issues.filter(i => i.priority >= 85).length}</Text>
                <Text style={[styles.kpiLabel, { color: activeTheme.textSec }]}>CRITICAL</Text>
              </Card>
              <Card style={[styles.kpiBox, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderLeftWidth: 3, borderLeftColor: activeTheme.warning }]}>
                <Text style={[styles.kpiNum, { color: activeTheme.warning }]}>{issues.filter(i => i.status === 'REPORTED' || i.status === 'REOPENED').length}</Text>
                <Text style={[styles.kpiLabel, { color: activeTheme.textSec }]}>PENDING</Text>
              </Card>
            </View>

            <Text style={[styles.sectionTitle, { color: activeTheme.primary }]}>PRIORITY QUEUE (AI ORDERED)</Text>

            {issues.map((item) => (
              <TouchableOpacity key={item.issueId} onPress={() => { setSelectedIssueId(item.issueId); setCurrentScreen('authority-detail'); }}>
                <View style={[styles.itemCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                  <View style={styles.rowBetween}>
                    <View style={[styles.priorityBadge, { backgroundColor: activeTheme.primary }]}>
                      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>P-{item.priority}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={[styles.itemTitle, { color: activeTheme.text, marginTop: 8 }]}>{item.title}</Text>
                  <View style={styles.itemFooter}>
                    <Text style={[styles.itemId, { color: activeTheme.textSec }]}>{item.department}</Text>
                    <Text style={{ color: activeTheme.primary, fontSize: 11, fontWeight: '800' }}>MANAGE DISPATCH &gt;</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {currentScreen === 'authority-detail' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader('Manage Dispatch', () => setCurrentScreen('authority-dashboard'))}
          {(() => {
            const item = issues.find(i => i.issueId === selectedIssueId);
            if (!item) return null;

            return (
              <View>
                <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.itemCat, { color: activeTheme.textSec }]}>{item.category.toUpperCase()}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={[styles.itemTitle, { color: activeTheme.text, fontSize: 18, marginTop: 6 }]}>{item.title}</Text>
                  <Text style={[styles.itemDesc, { color: activeTheme.textSec, marginTop: 8 }]}>{item.description}</Text>
                  {item.evidence?.[0] && <Image source={{ uri: item.evidence[0] }} style={{ width: '100%', height: 160, borderRadius: 8, marginTop: 12 }} />}
                </Card>

                {item.status === 'REPORTED' || item.status === 'VERIFIED' || item.status === 'REOPENED' ? (
                  <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                    <Text style={{ color: activeTheme.primary, fontWeight: '900', fontSize: 12, letterSpacing: 1 }}>DISPATCH TECHNICIAN</Text>
                    
                    <TouchableOpacity onPress={() => handleAssignWorker(item.issueId, 'Ramesh Kumar')} style={styles.workerSelectRow}>
                      <View>
                        <Text style={{ color: activeTheme.text, fontWeight: '800' }}>Ramesh Kumar</Text>
                        <Text style={{ color: activeTheme.textSec, fontSize: 11 }}>Roads & Asphalt Specialist</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: activeTheme.primarySubtle }]}>
                        <Text style={{ color: activeTheme.primary, fontSize: 10, fontWeight: '800' }}>DISPATCH</Text>
                      </View>
                    </TouchableOpacity>
                  </Card>
                ) : (
                  <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                    <Text style={{ color: activeTheme.primary, fontWeight: '900', fontSize: 12 }}>ALLOCATED WORKER</Text>
                    <Text style={{ color: activeTheme.text, fontWeight: '800', marginTop: 4 }}>{item.assignedWorker?.name || 'Ramesh Kumar'}</Text>
                    <Text style={{ color: activeTheme.textSec, fontSize: 11 }}>{item.assignedWorker?.role || 'Field Technician'}</Text>
                  </Card>
                )}
              </View>
            );
          })()}
        </ScrollView>
      )}

      {/* ==========================================
          SCREENS: FIELD WORKER PORTAL MODULE
         ========================================== */}
      {currentScreen === 'worker-login' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader('Technician Portal', () => setCurrentScreen('portal-select'))}
          <View style={[styles.formContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Text style={[styles.formTitle, { color: activeTheme.text }]}>WORKER SIGN IN</Text>
            <Text style={[styles.formDesc, { color: activeTheme.textSec }]}>Sign in using technician identification.</Text>

            <Text style={[styles.label, { color: activeTheme.textSec }]}>WORKER ID</Text>
            <TextInput value={workerId} onChangeText={setWorkerId} style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]} />

            <Text style={[styles.label, { color: activeTheme.textSec }]}>PASSWORD</Text>
            <TextInput value={workerPassword} onChangeText={setWorkerPassword} secureTextEntry style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]} />

            <TouchableOpacity onPress={handleWorkerLogin} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary }]}>
              <Text style={styles.btnText}>LOG IN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentScreen === 'worker-dashboard' && (
        <View style={{ flex: 1 }}>
          {renderHeader('My Active Tasks')}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.sectionTitle, { color: activeTheme.primary }]}>ASSIGNED DISPATCH ORDERS</Text>

            {issues.map((item) => (
              <TouchableOpacity key={item.issueId} onPress={() => { setSelectedIssueId(item.issueId); setCurrentScreen('worker-detail'); }}>
                <View style={[styles.itemCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.itemCat, { color: activeTheme.textSec }]}>{item.category.toUpperCase()}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={[styles.itemTitle, { color: activeTheme.text, marginTop: 8 }]}>{item.title}</Text>
                  <View style={styles.itemFooter}>
                    <Text style={[styles.itemId, { color: activeTheme.textSec }]}>{item.area}</Text>
                    <Text style={{ color: activeTheme.primary, fontSize: 11, fontWeight: '800' }}>VIEW DETAILS &gt;</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {currentScreen === 'worker-detail' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderHeader('Workorder Detail', () => setCurrentScreen('worker-dashboard'))}
          {(() => {
            const item = issues.find(i => i.issueId === selectedIssueId);
            if (!item) return null;

            return (
              <View>
                <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.itemCat, { color: activeTheme.textSec }]}>{item.category.toUpperCase()}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <Text style={[styles.itemTitle, { color: activeTheme.text, fontSize: 18, marginTop: 6 }]}>{item.title}</Text>
                  <Text style={[styles.itemDesc, { color: activeTheme.textSec, marginTop: 8 }]}>{item.description}</Text>
                  {item.evidence?.[0] && <Image source={{ uri: item.evidence[0] }} style={{ width: '100%', height: 160, borderRadius: 8, marginTop: 12 }} />}
                </Card>

                {item.status === 'ASSIGNED' && (
                  <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                    <Text style={{ color: activeTheme.text, fontWeight: '800' }}>Activate Workorder</Text>
                    <Text style={{ color: activeTheme.textSec, fontSize: 12, marginVertical: 8 }}>Signal that you have arrived on site and are commencing repairs.</Text>
                    <TouchableOpacity onPress={() => handleStartWork(item.issueId)} style={[styles.primaryBtn, { backgroundColor: activeTheme.primary }]}>
                      <Text style={styles.btnText}>START REPAIR WORK</Text>
                    </TouchableOpacity>
                  </Card>
                )}

                {item.status === 'IN_PROGRESS' && (
                  <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                    <Text style={{ color: activeTheme.text, fontWeight: '800' }}>Log Resolution Evidence</Text>
                    
                    <Text style={[styles.label, { color: activeTheme.textSec, marginTop: 12 }]}>REPAIR NOTES</Text>
                    <TextInput
                      value={resolutionNotes}
                      onChangeText={setResolutionNotes}
                      placeholder="e.g. Cleared asphalt cracks and patched surface"
                      placeholderTextColor={activeTheme.textSec}
                      style={[styles.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.background }]}
                    />

                    {!resolutionPhoto ? (
                      <TouchableOpacity onPress={simulateResolutionUpload} style={[styles.outlineBtn, { borderColor: activeTheme.primary, marginVertical: 12 }]}>
                        <Text style={{ color: activeTheme.primary, fontWeight: '800' }}>SNAP RESOLUTION PHOTO</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ marginVertical: 12 }}>
                        <Image source={{ uri: resolutionPhoto }} style={{ width: '100%', height: 140, borderRadius: 8 }} />
                        <TouchableOpacity onPress={() => setResolutionPhoto(null)} style={{ marginTop: 6 }}>
                          <Text style={{ color: activeTheme.danger, fontSize: 12, fontWeight: '800' }}>Delete Photo</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity onPress={() => handleCompleteWork(item.issueId)} style={[styles.successBtn, { backgroundColor: activeTheme.success, marginTop: 12 }]}>
                      <Text style={styles.btnText}>SUBMIT WORK COMPLETED</Text>
                    </TouchableOpacity>
                  </Card>
                )}

                {item.status === 'RESOLVED' && (
                  <Card style={{ backgroundColor: activeTheme.card, borderColor: activeTheme.border }}>
                    <Text style={{ color: activeTheme.success, fontWeight: '900', fontSize: 14 }}>Awaiting Citizen Verification</Text>
                    <Text style={{ color: activeTheme.textSec, fontSize: 12, marginTop: 4 }}>Repair details submitted. Pending citizen check to close workorder.</Text>
                  </Card>
                )}
              </View>
            );
          })()}
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

// ==========================================
// 6. HELPER SUB-COMPONENTS (PORTABLE EXPORTS)
// ==========================================
function Card({ children, style }: any) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

function Button({ title, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.genericBtn}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

function StatusBadge({ status }: any) {
  const getColors = () => {
    switch (status) {
      case 'CLOSED':
      case 'RESOLVED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' };
      case 'IN_PROGRESS':
      case 'ASSIGNED':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' };
      case 'REOPENED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366F1' };
    }
  };
  const colors = getColors();
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={{ color: colors.text, fontSize: 9, fontWeight: '900' }}>{status}</Text>
    </View>
  );
}

// ==========================================
// 7. RESPONSIVE COMPACT STYLES
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0
  },
  themeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  themeLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginRight: 8
  },
  themeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    marginLeft: 6
  },
  themeBtnText: {
    fontSize: 9,
    fontWeight: '900'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  portalHeader: {
    alignItems: 'center',
    marginVertical: 32
  },
  portalTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2
  },
  portalSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 4
  },
  portalTagline: {
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center'
  },
  gridContainer: {
    width: '100%',
    flexDirection: 'column'
  },
  tabletGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  portalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20
  },
  cardAction: {
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  logoutBtn: {
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900'
  },
  formContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center'
  },
  formDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 16
  },
  primaryBtn: {
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  successBtn: {
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dangerBtn: {
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  outlineBtn: {
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  bannerCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '900'
  },
  bannerDesc: {
    fontSize: 12,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12
  },
  itemCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemCat: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 4
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 16
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.2)'
  },
  itemId: {
    fontSize: 10,
    fontFamily: 'monospace'
  },
  previewImg: {
    width: '100%',
    height: 140,
    borderRadius: 6,
    marginBottom: 16,
    resizeMode: 'cover'
  },
  warningCard: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16
  },
  card: {
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 14,
    marginBottom: 12
  },
  genericBtn: {
    backgroundColor: '#6366F1',
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  kpiBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1
  },
  kpiNum: {
    fontSize: 20,
    fontWeight: '900'
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  workerSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 0.5,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    paddingTop: 12
  }
});
