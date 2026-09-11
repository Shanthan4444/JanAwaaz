import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../shared/components/Button';
import { Card } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { PriorityBadge } from '../../shared/components/PriorityBadge';
import { issuesApi } from '../../services/api/issuesApi';
import { communityApi } from '../../services/api/communityApi';

export default function ReportIssueScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(28.5355);
  const [longitude, setLongitude] = useState(77.3910);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road Damage');
  const [landmark, setLandmark] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [priority, setPriority] = useState(85);

  const [duplicates, setDuplicates] = useState<any[]>([]);

  const handleCapturePhoto = async () => {
    // 1. Request Camera Permission
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      Alert.alert('Permission Denied', 'JanSetu requires camera permissions to document issues.');
      return;
    }

    // 2. Request Location Permission
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      Alert.alert('Permission Denied', 'JanSetu requires location permissions to map issues.');
      return;
    }

    setLoading(true);
    try {
      // 3. Launch Camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        base64: true
      });

      if (result.canceled || !result.assets?.[0]) {
        setLoading(false);
        return;
      }

      const asset = result.assets[0];
      const imageUri = asset.uri;
      const base64Data = `data:image/jpeg;base64,${asset.base64}`;

      setImage(imageUri);
      setBase64Image(base64Data);
      setStep(2); // AI Analyzing Step

      // 4. Get Current GPS Coordinates
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      const lat = loc.coords.latitude;
      const lng = loc.coords.longitude;
      setLatitude(lat);
      setLongitude(lng);

      // 5. Send to AI vision preview analyzer
      const res = await issuesApi.analyzeCandidate(base64Data, lat, lng);

      // Populate AI-extracted metadata
      setTitle(res.issueTitle || res.title || 'Road Surface Defect');
      setDescription(res.description || res.summary || 'Exposed hazard requiring municipal resolution.');
      setCategory(res.category || 'Road Damage');
      setSeverity(res.severity || 'HIGH');
      setPriority(res.priority || 80);
      setLandmark(res.location?.landmark || res.address || '');
      setDuplicates(res.possibleDuplicates || []);

      // If duplicate risk is elevated, show duplicates screen first
      if (res.duplicateRisk >= 0.3 && res.possibleDuplicates?.length > 0) {
        setStep(3);
      } else {
        setStep(4);
      }
    } catch (err: any) {
      console.warn('[VISION AI ERROR]', err);
      Alert.alert('Analysis Failed', 'Could not run AI Vision analysis. Please fill details manually.', [
        { text: 'OK', onPress: () => setStep(4) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSupportExisting = async (issueId: string) => {
    setLoading(true);
    try {
      await communityApi.supportIssue(issueId);
      Alert.alert('Support Registered', 'You have supported this report. Priorities are consolidated!', [
        { text: 'OK', onPress: () => router.replace('/citizen/dashboard') }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to submit upvote support.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'Title and Description are required.');
      return;
    }
    setLoading(true);
    try {
      await issuesApi.createIssue({
        title,
        description,
        category,
        department: getDept(category),
        severity,
        priority,
        location: {
          latitude,
          longitude,
          area: 'Sector 14',
          landmark
        },
        evidence: [base64Image || '']
      });
      Alert.alert('Report Filed', 'Your civic report has been submitted and dispatched to the assignment engine.', [
        { text: 'OK', onPress: () => router.replace('/citizen/dashboard') }
      ]);
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Submission failed.';
      Alert.alert('Submission Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDept = (cat: string) => {
    switch (cat) {
      case 'Fire Hazard': return 'Fire & Emergency Services';
      case 'Electrical Hazard': return 'Electricity & Power Board';
      case 'Road Damage': return 'Roads & Infrastructure';
      case 'Garbage': return 'Solid Waste Management';
      case 'Water Leakage': return 'Jal Board / Water Works';
      case 'Drainage': return 'Drainage & Sewerage Board';
      default: return 'Municipal Services';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 1 && (
          <Card style={styles.card}>
            <Text style={styles.title}>Visual Evidence Capture</Text>
            <Text style={styles.desc}>Capture a clean photo of the municipal hazard. Location metadata and AI classification will be run automatically.</Text>
            <Button
              title="CAPTURE CIVIC HAZARD"
              onPress={handleCapturePhoto}
              style={styles.btn}
            />
          </Card>
        )}

        {step === 2 && (
          <Card style={styles.card}>
            <ActivityIndicator size="large" color="#2F2F2F" style={{ marginBottom: 20 }} />
            <Text style={styles.title}>AI CIVIC ANALYSIS</Text>
            <Text style={styles.desc}>Scanning visual evidence, matching GPS coordinates, and checking for duplicate hazard reports near you...</Text>
          </Card>
        )}

        {step === 3 && (
          <View>
            <Card style={styles.warningCard}>
              <Text style={styles.warningTitle}>Similar Issue Already Exists</Text>
              <Text style={styles.warningDesc}>Another citizen reported a similar issue nearby. Support their ticket to escalate priority instead of duplicating.</Text>
            </Card>

            {duplicates.map((dup) => (
              <Card key={dup.issueId} style={styles.dupCard}>
                <Text style={styles.dupId}>Ticket: {dup.issueId}</Text>
                <Text style={styles.dupTitle}>{dup.title}</Text>
                <Text style={styles.dupDetail}>Similarity Score: {(dup.similarity * 100).toFixed(0)}%</Text>
                <Button
                  title="SUPPORT THIS TICKET (+15 Impact)"
                  variant="success"
                  style={{ marginTop: 12 }}
                  onPress={() => handleSupportExisting(dup.issueId)}
                />
              </Card>
            ))}

            <Button
              title="Create New Ticket Anyway"
              variant="outline"
              style={{ marginTop: 12 }}
              onPress={() => setStep(4)}
            />
          </View>
        )}

        {step === 4 && (
          <Card style={styles.card}>
            <Text style={styles.title}>Verify Report Details</Text>
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
            />
            <Input
              label="Landmark"
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Next to Metro Pillar 42"
            />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>AI Category:</Text>
              <Text style={styles.metaValue}>{category}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>AI Severity:</Text>
              <PriorityBadge priority={severity} />
            </View>

            <Button
              title="CONFIRM & SUBMIT REPORT"
              variant="primary"
              loading={loading}
              onPress={handleSubmit}
              style={{ marginTop: 24 }}
            />
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
    padding: 20,
    backgroundColor: '#F8F7F3',
    flexGrow: 1
  },
  card: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    borderRadius: 8
  },
  title: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_900Black',
    color: '#2F2F2F',
    marginBottom: 8,
    textAlign: 'center'
  },
  desc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
    resizeMode: 'cover'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E1DA',
    paddingBottom: 8
  },
  metaLabel: {
    color: '#777777',
    fontSize: 13,
    fontFamily: 'Inter_700Bold'
  },
  metaValue: {
    color: '#2F2F2F',
    fontSize: 13,
    fontFamily: 'Inter_700Bold'
  },
  warningCard: {
    backgroundColor: '#FAF5E6',
    borderColor: '#C9A86A',
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8
  },
  warningTitle: {
    color: '#C9A86A',
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_900Black',
    marginBottom: 4
  },
  warningDesc: {
    color: '#8C6D32',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16
  },
  dupCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E1DA',
    padding: 16,
    borderRadius: 8
  },
  dupId: {
    fontSize: 11,
    color: '#6D8B74',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4
  },
  dupTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#2F2F2F'
  },
  dupDetail: {
    fontSize: 11,
    color: '#777777',
    marginTop: 4,
    fontFamily: 'Inter_400Regular'
  },
  btn: {
    borderRadius: 4,
    backgroundColor: '#2F2F2F'
  }
});
