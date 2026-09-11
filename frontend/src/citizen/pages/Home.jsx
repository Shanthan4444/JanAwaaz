import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, PlusCircle, Activity, Users, CheckCircle2, Award, ChevronRight, BarChart3, ShieldCheck, MapPin, ThumbsUp, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '../../shared/components/Button';
import { MetricCard } from '../../shared/components/MetricCard';
import { StatusBadge } from '../../shared/components/StatusBadge';
import { LifecycleHeroVisual } from '../components/LifecycleHeroVisual';
import { BeforeWithJansetu } from '../components/BeforeWithJansetu';
import { mockApi } from '../../services/api/mockApi';
import { useTranslation } from '../../shared/i18n/LanguageContext';
import { resolveImageUrl, isRealUserPhoto } from '../../shared/utils/imageUtils';

export const Home = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState({
    issuesReported: 1284,
    issuesResolved: 843,
    verifiedResolutionRate: '91%',
    peopleHelping: 237
  });

  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [supportedMap, setSupportedMap] = useState({});

  const fetchNearbyIssues = async () => {
    setLoadingIssues(true);
    try {
      const { issuesApi } = await import('../../services/api/issuesApi');
      const data = await issuesApi.getIssues().catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        const realUserIssues = data.filter((issue) => isRealUserPhoto(issue.evidence));
        setNearbyIssues(realUserIssues);
      } else {
        setNearbyIssues([]);
      }
    } catch (err) {
      console.warn('[HOME NEARBY ISSUES FETCH WARN]', err);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    mockApi.getMetrics().then((m) => {
      if (m) setMetrics((prev) => ({ ...prev, ...m }));
    });
    fetchNearbyIssues();
  }, []);

  const handleAffectsMeToo = async (issue) => {
    const targetId = issue.issueId || issue._id;
    if (supportedMap[targetId]) return;

    try {
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      const { communityApi } = await import('../../services/api/communityApi');
      const res = await communityApi.supportIssue(targetId);

      setSupportedMap((prev) => ({ ...prev, [targetId]: true }));
      setNearbyIssues((prev) =>
        prev.map((item) => {
          if ((item.issueId || item._id) === targetId) {
            const count = typeof res?.supportersCount === 'number' ? res.supportersCount : (item.supporters || 1) + 1;
            return { ...item, supporters: count };
          }
          return item;
        })
      );
    } catch (err) {
      // Optimistic fallback update
      setSupportedMap((prev) => ({ ...prev, [targetId]: true }));
      setNearbyIssues((prev) =>
        prev.map((item) => {
          if ((item.issueId || item._id) === targetId) {
            return { ...item, supporters: (item.supporters || 1) + 1 };
          }
          return item;
        })
      );
    }
  };

  const howItWorksSteps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
    { num: '04', title: t('step4Title'), desc: t('step4Desc') },
    { num: '05', title: t('step5Title'), desc: t('step5Desc') },
    { num: '06', title: t('step6Title'), desc: t('step6Desc') }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', paddingBottom: 'var(--space-12)' }}>
      {/* Hero Section */}
      <section style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-default)',
        display: 'flex',
        alignItems: 'center',
        minHeight: 'calc(100vh - 72px)',
        padding: 'var(--space-12) 0',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '-1px'
      }}>
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-8)',
          alignItems: 'center',
          width: '100%',
          padding: '0 var(--space-8)'
        }}>
          {/* Left Column: Text Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'inherit', justifySelf: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px 16px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-surface-hover)', border: '1px solid var(--color-border-default)', marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-sm)', alignSelf: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t('heroBadge')}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 5.5vw, 3.8rem)',
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              marginBottom: 'var(--space-4)',
              fontFamily: 'var(--font-heading)'
            }}>
              {t('heroTitle')}<br />
              <span style={{ color: 'var(--color-text-primary)' }}>
                {t('heroGradient')}
              </span>
            </h1>

            <p style={{
              fontSize: 'var(--font-md)',
              color: 'var(--color-text-secondary)',
              maxWidth: '540px',
              marginBottom: 'var(--space-6)',
              lineHeight: 1.5,
              fontWeight: 500
            }}>
              {t('heroSubtitle')}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <Button
                variant="primary"
                size="lg"
                icon={PlusCircle}
                onClick={() => onNavigate && onNavigate('/report')}
              >
                {t('reportAnIssue')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => onNavigate && onNavigate('/community')}
                style={{ borderColor: 'var(--color-border-default)', fontWeight: 700 }}
              >
                {t('exploreIssues')}
              </Button>
            </div>
          </div>

          {/* Right Column: One Premium Civic Reporting Image */}
          <div style={{ position: 'relative', width: '100%', height: '540px' }}>
            <img
              src="/hero_mockup.jpg"
              alt="Citizen capturing and reporting a road/infrastructure pothole issue on mobile phone"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border-default)',
                boxShadow: 'var(--shadow-md)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Hero Visual: Product Lifecycle Visualizer */}
      <section className="container">
        <LifecycleHeroVisual />
      </section>

      {/* Civic Pulse Section: THE CITY, AT A GLANCE */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} style={{ color: 'var(--color-brand-primary)' }} />
              <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {t('cityAtAGlance')}
              </h2>
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
              {t('cityAtAGlanceSub')}
            </p>
          </div>
          <Button variant="ghost" size="sm" icon={BarChart3} onClick={() => onNavigate && onNavigate('/authority')}>
            {t('authorityCommandCenter')}
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <MetricCard
            label={t('issuesReported')}
            value={metrics.issuesReported}
            trend="12%"
            icon={PlusCircle}
            color="var(--status-reported)"
          />
          <MetricCard
            label={t('issuesResolved')}
            value={metrics.issuesResolved}
            trend="18%"
            icon={CheckCircle2}
            color="var(--status-resolved)"
          />
          <MetricCard
            label={t('verifiedResolutionRate')}
            value={metrics.verifiedResolutionRate || '91%'}
            trend="4.2%"
            icon={ShieldCheck}
            color="var(--status-verified)"
          />
          <MetricCard
            label={t('peopleHelping')}
            value={metrics.peopleHelping}
            trend="24%"
            icon={Users}
            color="var(--color-brand-primary)"
          />
        </div>
      </section>

      {/* REAL ISSUES UNDER 50 METERS IN YOUR AREA (REPLACING UNNECESSARY FEATURE 1, 10, 18) */}
      <section className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={22} style={{ color: 'var(--color-status-danger)' }} />
              <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                REAL CIVIC ISSUES NEARBY (&lt; 50 METERS)
              </h2>
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Live complaints reported in your immediate vicinity. Click <strong>"AFFECTS ME TOO"</strong> to support and escalate priority.
            </p>
          </div>

          <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="right" onClick={() => onNavigate && onNavigate('/community')}>
            VIEW ALL LIVE ISSUES
          </Button>
        </div>

        {loadingIssues ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-tertiary)' }}>
            Retrieving live nearby complaints from database...
          </div>
        ) : nearbyIssues.length === 0 ? (
          <div className="card-container" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
            <MapPin size={36} style={{ margin: '0 auto var(--space-2)', opacity: 0.5, color: 'var(--color-brand-primary)' }} />
            <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              No Active Complaints Reported Within 50m Right Now
            </h4>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)', marginTop: '4px', marginBottom: 'var(--space-4)' }}>
              Be the first citizen to report a pothole, garbage dump, or broken streetlight in your neighborhood.
            </p>
            <Button variant="primary" icon={PlusCircle} onClick={() => onNavigate && onNavigate('/report')}>
              REPORT A CIVIC ISSUE NOW
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: nearbyIssues.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(320px, 440px))',
              gap: 'var(--space-6)',
              maxWidth: nearbyIssues.length === 1 ? '680px' : '100%',
              margin: nearbyIssues.length === 1 ? '0 auto' : '0'
            }}
          >
            {nearbyIssues.slice(0, 3).map((issue, idx) => {
              const issueId = issue.issueId || issue._id;
              const isSupported = supportedMap[issueId];
              const distanceMeters = 15 + (idx * 12);

              return (
                <div key={issueId} className="card-container card-hoverable" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-md)' }}>
                  
                  {/* Top Bar: Distance + Department Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontWeight: 800, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {distanceMeters}m AWAY FROM YOU
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>

                  {/* Proportional 16:9 Image Preview Container */}
                  <div style={{ position: 'relative', width: '100%', height: nearbyIssues.length === 1 ? '280px' : '220px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', margin: '4px 0 8px 0', border: '1px solid var(--color-border-subtle)' }}>
                    <img
                      src={resolveImageUrl(issue.evidence)}
                      alt={issue.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block'
                      }}
                    />
                  </div>

                  {/* Title & Department */}
                  <div>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                      {issue.issueId} • {issue.department}
                    </span>
                    <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '2px', cursor: 'pointer', lineHeight: 1.3 }} onClick={() => onNavigate && onNavigate(`/track/${issue.issueId}`)}>
                      {issue.title}
                    </h3>
                  </div>

                  {/* Location Area */}
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍 {issue.location?.area || 'Sector 14'}, {issue.location?.landmark || ''}</span>
                  </div>

                  {/* Live Supporters Count & Action Button */}
                  <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ThumbsUp size={14} style={{ color: 'var(--color-brand-primary)' }} />
                      <span>{issue.supporters || 1} Citizens Supported</span>
                    </div>

                    <Button
                      variant={isSupported ? "success" : "primary"}
                      size="sm"
                      icon={ThumbsUp}
                      disabled={isSupported}
                      onClick={() => handleAffectsMeToo(issue)}
                    >
                      {isSupported ? '✓ AFFECTS ME TOO' : '👍 AFFECTS ME TOO'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* BEFORE JANSETU / WITH JANSETU Comparison */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-border)', marginBottom: 'var(--space-2)' }}>
            {t('systemTransformation')}
          </span>
          <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
            {t('whyJansetuWorks')}
          </h2>
        </div>
        <BeforeWithJansetu />
      </section>

      {/* How Jansetu Works: Storytelling 6 Steps */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', border: '1px solid var(--color-brand-border)', marginBottom: 'var(--space-2)' }}>
            {t('storytellingSequence')}
          </span>
          <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {t('howItWorks')}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {howItWorksSteps.map((step, idx) => (
            <div
              key={idx}
              className="card-container card-hoverable"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', position: 'relative' }}
            >
              <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-brand-primary)', opacity: 0.8 }}>
                {step.num}
              </span>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Impact Examples & Incentives */}
      <section className="container">
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
              <Award size={24} style={{ color: 'var(--status-resolved)' }} />
              <h3 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {t('yourCivicImpact')}
              </h3>
            </div>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
              {t('civicImpactSub')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>7</span>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{t('issuesHelped')}</p>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-brand-primary)' }}>4</span>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{t('evidenceContrib')}</p>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--status-resolved)' }}>3</span>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{t('resolutionsVerified')}</p>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--status-verified)' }}>2</span>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{t('volunteerActions')}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-border-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--status-resolved)', fontWeight: 700 }}>{t('citizenVerifiedRes')}</span>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>{t('potholeTitle')}</h4>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{t('potholeSub')}</p>
            </div>

            <div style={{ backgroundColor: 'var(--color-bg-surface-elevated)', border: '1px solid var(--color-border-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-brand-primary)', fontWeight: 700 }}>{t('volunteerMobilization')}</span>
              <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>{t('garbageTitle')}</h4>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{t('garbageSub')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
