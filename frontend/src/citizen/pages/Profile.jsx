import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, ThumbsUp, Users, Shield, Activity, Camera } from 'lucide-react';
import { Card } from '../../shared/components/Card';
import { Avatar } from '../../shared/components/Avatar';
import { mockApi } from '../../services/api/mockApi';

export const Profile = ({ onNavigate }) => {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    mockApi.getUserProfile().then(setUserProfile);
    const unsubscribe = mockApi.subscribe(() => {
      mockApi.getUserProfile().then(setUserProfile);
    });
    return unsubscribe;
  }, []);

  if (!userProfile) return null;

  return (
    <div className="container" style={{ maxWidth: '840px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* User Header Profile Card */}
      <Card style={{ marginBottom: 'var(--space-8)', backgroundColor: 'var(--color-bg-surface-elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <Avatar src={userProfile.avatar} name={userProfile.name} size="lg" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                {userProfile.name}
              </h1>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-resolved)' }}>
                <Award size={12} /> {userProfile.badge}
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Citizen Civic Contributor • Active Sector 14 Guardian
            </p>
          </div>
        </div>
      </Card>

      {/* Your Civic Impact Ledger */}
      <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', textAlign: 'left' }}>
        CIVIC IMPACT PROFILE
      </h2>

      {/* Community Impact Summary Card */}
      <Card style={{
        backgroundColor: 'var(--status-verified-bg)',
        borderColor: 'rgba(46, 125, 50, 0.25)',
        padding: 'var(--space-5)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        textAlign: 'left'
      }}>
        <div style={{ fontSize: '32px' }}>🌱</div>
        <div>
          <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            You Helped Improve 3 Neighborhoods
          </h3>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
            Your contributions directly helped repair roads in University East, clear waste blockades in Metro Hub, and report electrical infrastructure concerns in Green Park.
          </p>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Issues Reported
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text-primary)', margin: '4px 0' }}>
            12
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>civic problems filed</span>
        </Card>

        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Verified by AI
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-brand-primary)', margin: '4px 0' }}>
            8
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>active cases monitored</span>
        </Card>

        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Resolutions Confirmed
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--status-resolved)', margin: '4px 0' }}>
            4
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>neighborhood fixes verified</span>
        </Card>
      </div>

      {/* Recent Contribution History */}
      <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>
        Recent Civic Actions
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--status-resolved)', fontWeight: 700 }}>+50 POINTS AWARDED</span>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Verified Resolution: Pothole near University Gate</h4>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>Confirmed work quality performed by field technician.</p>
            </div>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>Today</span>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-brand-primary)', fontWeight: 700 }}>+30 POINTS AWARDED</span>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Volunteered for Water Supply Leakage</h4>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>Joined local volunteer coordination unit.</p>
            </div>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>Yesterday</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
