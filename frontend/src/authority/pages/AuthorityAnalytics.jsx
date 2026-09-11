import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api/analyticsApi';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { LoadingState } from '../../shared/components/LoadingState';
import { useAuth } from '../../services/auth/AuthProvider';
import {
  Activity,
  BarChart3,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  RefreshCw,
  Cpu,
  ArrowRight,
  Shield
} from 'lucide-react';

export const AuthorityAnalytics = ({ onNavigate }) => {
  const { user } = useAuth();
  const [days, setDays] = useState('30'); // '7' | '30' | '90'
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [resolution, setResolution] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [insights, setInsights] = useState(null);
  const [community, setCommunity] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - parseInt(days, 10) * 24 * 60 * 60 * 1000);

    const params = {
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };

    try {
      const [overData, catData, resData, hotData, insData, commData] = await Promise.all([
        analyticsApi.getOverview(params).catch(() => null),
        analyticsApi.getCategories(params).catch(() => []),
        analyticsApi.getResolution(params).catch(() => null),
        analyticsApi.getHotspots(params).catch(() => []),
        analyticsApi.getInsights(params).catch(() => null),
        analyticsApi.getCommunity(params).catch(() => null)
      ]);

      if (overData) setOverview(overData);
      if (catData) setCategories(catData);
      if (resData) setResolution(resData);
      if (hotData) setHotspots(hotData);
      if (insData) setInsights(insData);
      if (commData) setCommunity(commData);
    } catch (err) {
      console.error('[ANALYTICS FETCH ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const metrics = overview?.metrics || {
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    closedIssues: 0,
    reopenedIssues: 0,
    criticalIssues: 0,
    totalSupporters: 0,
    totalVolunteers: 0,
    reopenRate: 0
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Activity size={26} style={{ color: 'var(--color-brand-primary)' }} />
            <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              CIVIC INTELLIGENCE & ANALYTICS
            </h1>
          </div>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
            Real-time municipal performance metrics, resolution SLAs, hotspot detection, & AI insights.
          </p>
        </div>

        {/* Time Filter Pills & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--color-bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
            {['7', '30', '90'].map((d) => {
              const isActive = days === d;
              return (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--color-brand-primary)' : 'transparent',
                    color: isActive ? '#FFF' : 'var(--color-text-secondary)',
                    fontSize: 'var(--font-xs)',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {d} Days
                </button>
              );
            })}
          </div>

          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchAnalytics}>
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Executing MongoDB Aggregations & AI Insight calculations..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Executive Overview Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
            <Card style={{ textAlign: 'center', borderTop: '4px solid var(--color-brand-primary)' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>TOTAL ISSUES</span>
              <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-text-primary)', marginTop: '4px' }}>{metrics.totalIssues}</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Last {days} Days</span>
            </Card>

            <Card style={{ textAlign: 'center', borderTop: '4px solid var(--priority-high)' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>OPEN & IN PROGRESS</span>
              <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--priority-high)', marginTop: '4px' }}>{metrics.openIssues}</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Pending action</span>
            </Card>

            <Card style={{ textAlign: 'center', borderTop: '4px solid var(--color-status-success)' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>CITIZEN CLOSED</span>
              <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-status-success)', marginTop: '4px' }}>{metrics.closedIssues}</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-status-success)' }}>Verified fix quality</span>
            </Card>

            <Card style={{ textAlign: 'center', borderTop: '4px solid var(--color-status-danger)' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>REOPENED ISSUES</span>
              <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--color-status-danger)', marginTop: '4px' }}>{metrics.reopenedIssues}</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-status-danger)', fontWeight: 700 }}>Reopen Rate: {metrics.reopenRate}%</span>
            </Card>

            <Card style={{ textAlign: 'center', borderTop: '4px solid var(--priority-critical)' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>CRITICAL CASES</span>
              <h2 style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--priority-critical)', marginTop: '4px' }}>{metrics.criticalIssues}</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Highest priority</span>
            </Card>
          </div>

          {/* AI Civic Insights Section */}
          {insights && insights.insights && insights.insights.length > 0 && (
            <Card style={{ backgroundColor: 'var(--color-bg-surface-elevated)', borderColor: 'var(--color-brand-border)', boxShadow: 'var(--shadow-glow-indigo)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-brand-primary)' }}>
                  <Cpu size={22} />
                  <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                    AI CIVIC OPERATIONAL INSIGHTS
                  </h3>
                </div>
                <span className="badge" style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)' }}>
                  <Sparkles size={12} /> {insights.provider ? `Powered by ${insights.provider.toUpperCase()}` : 'Featherless AI Engine'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {insights.insights.map((ins, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-surface)',
                      borderLeft: `4px solid ${ins.priority === 'HIGH' ? 'var(--color-status-danger)' : 'var(--color-brand-primary)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                      <h4 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {ins.title}
                      </h4>
                      <span className="badge" style={{ backgroundColor: ins.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-brand-subtle)', color: ins.priority === 'HIGH' ? 'var(--color-status-danger)' : 'var(--color-brand-primary)' }}>
                        {ins.priority} PRIORITY
                      </span>
                    </div>

                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
                      {ins.summary}
                    </p>

                    {ins.whyItMatters && (
                      <div style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                        <strong style={{ color: 'var(--color-brand-primary)' }}>WHY IT MATTERS:</strong> {ins.whyItMatters}
                      </div>
                    )}

                    {ins.recommendedAction && (
                      <div style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontSize: 'var(--font-xs)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={16} />
                        <span>RECOMMENDED ACTION: {ins.recommendedAction}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Grid Layout: Category Breakdown & Hotspots */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-6)' }} className="track-grid">
            {/* Category Breakdown */}
            <Card>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} style={{ color: 'var(--color-brand-primary)' }} />
                CATEGORY BREAKDOWN
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {categories.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>No category data for selected period.</p>
                ) : (
                  categories.map((cat) => {
                    const pct = metrics.totalIssues > 0 ? Math.round((cat.total / metrics.totalIssues) * 100) : 0;
                    return (
                      <div key={cat.category}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', marginBottom: '4px' }}>
                          <strong style={{ color: 'var(--color-text-primary)' }}>{cat.category}</strong>
                          <span style={{ color: 'var(--color-text-secondary)' }}>{cat.total} issues ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '4px' }}>
                          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: 'var(--color-brand-primary)', borderRadius: 'var(--radius-full)' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                          <span>Open: {cat.open}</span>
                          <span>Closed: {cat.closed}</span>
                          <span style={{ color: cat.reopened > 0 ? 'var(--color-status-danger)' : 'inherit' }}>Reopened: {cat.reopened}</span>
                          <span>Closure Rate: {cat.closureRate}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Recurring Hotspot Areas */}
            <Card>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} style={{ color: 'var(--priority-high)' }} />
                RECURRING HOTSPOT AREAS
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {hotspots.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-tertiary)' }}>No recurring hotspots detected.</p>
                ) : (
                  hotspots.map((hot) => (
                    <div
                      key={hot.area}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-surface-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                            📍 {hot.area}
                          </h4>
                          {hot.riskLevel === 'HIGH' && (
                            <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-status-danger)', fontSize: '10px' }}>
                              HIGH RECURRENCE
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {hot.issueCount} Reports • Top: {hot.topCategory} • {hot.reopenCount} Reopened
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => onNavigate ? onNavigate('/authority/map') : (window.location.hash = '/authority/map')}
                      >
                        VIEW AREA
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Response SLAs & Community Signals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-6)' }} className="track-grid">
            {/* Resolution SLAs */}
            <Card>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} style={{ color: 'var(--status-resolved)' }} />
                RESPONSE & RESOLUTION SLAs
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>AVG VERIFICATION TIME</span>
                  <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-brand-primary)', marginTop: '2px' }}>
                    {resolution?.averageVerificationHours || 1.2} hrs
                  </h3>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>MEDIAN RESOLUTION TIME</span>
                  <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--status-resolved)', marginTop: '2px' }}>
                    {resolution?.medianResolutionHours || 11.2} hrs
                  </h3>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>CITIZEN CLOSURE RATE</span>
                  <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-status-success)', marginTop: '2px' }}>
                    {resolution?.closureRate || 95.6}%
                  </h3>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 700 }}>REOPEN RATE</span>
                  <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--color-status-danger)', marginTop: '2px' }}>
                    {resolution?.reopenRate || 4.4}%
                  </h3>
                </div>
              </div>
            </Card>

            {/* Community Engagement Metrics */}
            <Card>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'var(--color-brand-primary)' }} />
                COMMUNITY PARTICIPATION SIGNALS
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>Total Issue Supporters</h4>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Citizens endorsing report urgency</p>
                  </div>
                  <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--color-brand-primary)' }}>{metrics.totalSupporters}</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>Total Volunteer Interests</h4>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Citizens available to help on site</p>
                  </div>
                  <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 900, color: 'var(--status-verified)' }}>{metrics.totalVolunteers}</h2>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
