import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
    FaCalendarAlt,
    FaClipboardCheck,
    FaUsers,
    FaMoneyBillWave,
    FaArrowRight,
    FaPlus,
    FaChartLine,
    FaCarSide,
    FaClock,
    FaCheckCircle,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { protocolsApi, ProtocolCounters } from '../../api/protocolsApi';
import { activityApi } from '../../api/activity';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiCard {
    id: string;
    label: string;
    value: string | number;
    sub: string;
    icon: React.ReactElement;
    color: string;
    bg: string;
    trend?: 'up' | 'down' | null;
}

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactElement;
    path: string;
    color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getGreeting = (firstName: string): string => {
    const h = new Date().getHours();
    if (h < 12) return `Dzień dobry, ${firstName}`;
    if (h < 18) return `Cześć, ${firstName}`;
    return `Dobry wieczór, ${firstName}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [counters, setCounters] = useState<ProtocolCounters | null>(null);
    const [loading, setLoading] = useState(true);
    const [activityCount, setActivityCount] = useState<number>(0);

    const todayFormatted = format(new Date(), "EEEE, d MMMM yyyy", { locale: pl });
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    useEffect(() => {
        const load = async () => {
            try {
                const [cntRes, actRes] = await Promise.allSettled([
                    protocolsApi.getProtocolCounters(),
                    activityApi.getActivities({ startDate: todayStr, endDate: todayStr, page: 0, size: 1 })
                ]);

                if (cntRes.status === 'fulfilled') {
                    setCounters(cntRes.value);
                }
                if (actRes.status === 'fulfilled' && actRes.value.success && actRes.value.data) {
                    setActivityCount(actRes.value.data.pagination.totalElements ?? 0);
                }
            } catch (_) {
                // silently fail – dashboard should never crash
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [todayStr]);

    const kpiCards: KpiCard[] = [
        {
            id: 'scheduled',
            label: 'Zaplanowane',
            value: loading ? '—' : (counters?.scheduled ?? 0),
            sub: 'Oczekuje na realizację',
            icon: <FaClock />,
            color: '#6366f1',
            bg: 'rgba(99, 102, 241, 0.08)',
        },
        {
            id: 'inProgress',
            label: 'W realizacji',
            value: loading ? '—' : (counters?.inProgress ?? 0),
            sub: 'Aktualnie w warsztacie',
            icon: <FaCarSide />,
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.08)',
        },
        {
            id: 'readyForPickup',
            label: 'Gotowe do odbioru',
            value: loading ? '—' : (counters?.readyForPickup ?? 0),
            sub: 'Czeka na klienta',
            icon: <FaCheckCircle />,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.08)',
        },
        {
            id: 'all',
            label: 'Wszystkich wizyt',
            value: loading ? '—' : (counters?.all ?? 0),
            sub: 'W systemie łącznie',
            icon: <FaClipboardCheck />,
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.08)',
        },
    ];

    const quickActions: QuickAction[] = [
        {
            id: 'new-visit',
            label: 'Nowa wizyta',
            icon: <FaPlus />,
            path: '/calendar',
            color: '#6366f1',
        },
        {
            id: 'calendar',
            label: 'Kalendarz',
            icon: <FaCalendarAlt />,
            path: '/calendar',
            color: '#3b82f6',
        },
        {
            id: 'clients',
            label: 'Klienci',
            icon: <FaUsers />,
            path: '/clients-vehicles',
            color: '#10b981',
        },
        {
            id: 'finances',
            label: 'Finanse',
            icon: <FaMoneyBillWave />,
            path: '/finances',
            color: '#f59e0b',
        },
        {
            id: 'visits',
            label: 'Wizyty',
            icon: <FaClipboardCheck />,
            path: '/visits',
            color: '#8b5cf6',
        },
        {
            id: 'stats',
            label: 'Aktualności',
            icon: <FaChartLine />,
            path: '/activity',
            color: '#06b6d4',
        },
    ];

    return (
        <Page>
            {/* ── Hero ──────────────────────────────────────────────────── */}
            <Hero>
                <HeroContent>
                    <HeroEyebrow>
                        <LiveDot />
                        {todayFormatted}
                    </HeroEyebrow>
                    <HeroTitle>
                        {user ? getGreeting(user.firstName) : 'Witaj w DetailingPro'}
                    </HeroTitle>
                    <HeroSub>
                        Masz <strong>{loading ? '...' : counters?.scheduled ?? 0}</strong> zaplanowanych wizyt
                        {' '}i <strong>{loading ? '...' : counters?.inProgress ?? 0}</strong> w realizacji.
                    </HeroSub>
                </HeroContent>

                <HeroActions>
                    <HeroCta onClick={() => navigate('/calendar')}>
                        <FaCalendarAlt />
                        Otwórz kalendarz
                        <FaArrowRight style={{ marginLeft: 'auto', opacity: 0.7 }} />
                    </HeroCta>
                    <HeroCtaSecondary onClick={() => navigate('/visits')}>
                        <FaClipboardCheck />
                        Wszystkie wizyty
                    </HeroCtaSecondary>
                </HeroActions>
            </Hero>

            <Body>
                {/* ── KPI Row ───────────────────────────────────────────── */}
                <Section>
                    <SectionLabel>Przegląd</SectionLabel>
                    <KpiGrid>
                        {kpiCards.map((card, i) => (
                            <KpiCardBox key={card.id} $delay={i * 60}>
                                <KpiIconWrap $color={card.color} $bg={card.bg}>
                                    {card.icon}
                                </KpiIconWrap>
                                <KpiInfo>
                                    <KpiValue>{card.value}</KpiValue>
                                    <KpiLabel>{card.label}</KpiLabel>
                                    <KpiSub>{card.sub}</KpiSub>
                                </KpiInfo>
                            </KpiCardBox>
                        ))}
                    </KpiGrid>
                </Section>

                {/* ── Quick Actions ─────────────────────────────────────── */}
                <Section>
                    <SectionLabel>Szybki dostęp</SectionLabel>
                    <ActionsGrid>
                        {quickActions.map((action) => (
                            <ActionCard key={action.id} onClick={() => navigate(action.path)}>
                                <ActionIcon $color={action.color}>
                                    {action.icon}
                                </ActionIcon>
                                <ActionLabel>{action.label}</ActionLabel>
                                <ActionArrow>
                                    <FaArrowRight />
                                </ActionArrow>
                            </ActionCard>
                        ))}
                    </ActionsGrid>
                </Section>

                {/* ── Status strip ──────────────────────────────────────── */}
                <StatusStrip>
                    <StatusItem>
                        <StatusDot $color="#10b981" />
                        <span>System działa poprawnie</span>
                    </StatusItem>
                    <StatusItem>
                        <StatusDot $color="#6366f1" />
                        <span>DetailingPro v2.1.0</span>
                    </StatusItem>
                </StatusStrip>
            </Body>
        </Page>
    );
};

export default DashboardPage;

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Page = styled.div`
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
`;

const Hero = styled.section`
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%);
    padding: 48px 40px 52px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    flex-wrap: wrap;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -60px;
        right: -60px;
        width: 320px;
        height: 320px;
        background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
        pointer-events: none;
    }

    &::after {
        content: '';
        position: absolute;
        bottom: -80px;
        left: 30%;
        width: 260px;
        height: 260px;
        background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);
        pointer-events: none;
    }

    @media (max-width: 768px) {
        padding: 32px 20px 36px;
    }
`;

const HeroContent = styled.div`
    animation: ${fadeUp} 0.5s ease both;
`;

const HeroEyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(165, 180, 252, 0.8);
    text-transform: capitalize;
    margin-bottom: 12px;
    letter-spacing: 0.3px;
`;

const LiveDot = styled.span`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    animation: ${blink} 2.5s ease-in-out infinite;
    flex-shrink: 0;
`;

const HeroTitle = styled.h1`
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 700;
    color: #f8fafc;
    margin: 0 0 10px;
    letter-spacing: -0.5px;
    line-height: 1.2;
`;

const HeroSub = styled.p`
    font-size: 14px;
    color: rgba(148, 163, 184, 0.9);
    margin: 0;
    line-height: 1.5;

    strong {
        color: #a5b4fc;
        font-weight: 600;
    }
`;

const HeroActions = styled.div`
    display: flex;
    gap: 10px;
    flex-shrink: 0;
    animation: ${fadeUp} 0.5s 0.1s ease both;
    flex-wrap: wrap;

    @media (max-width: 600px) {
        width: 100%;
    }
`;

const HeroCta = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    min-width: 180px;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);

    &:hover {
        background: #4f46e5;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
    }

    &:active { transform: translateY(0); }
`;

const HeroCtaSecondary = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(248, 250, 252, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    backdrop-filter: blur(4px);

    &:hover {
        background: rgba(255, 255, 255, 0.13);
        border-color: rgba(255, 255, 255, 0.2);
    }
`;

const Body = styled.div`
    flex: 1;
    padding: 32px 40px 40px;
    max-width: 1200px;

    @media (max-width: 768px) {
        padding: 24px 20px 32px;
    }
`;

const Section = styled.div`
    margin-bottom: 36px;
    animation: ${fadeUp} 0.4s 0.15s ease both;
`;

const SectionLabel = styled.h2`
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 14px;
`;

const KpiGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
`;

const KpiCardBox = styled.div<{ $delay: number }>`
    background: #ffffff;
    border: 1px solid #e8edf2;
    border-radius: 14px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    animation: ${fadeUp} 0.4s ${({ $delay }) => $delay}ms ease both;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }
`;

const KpiIconWrap = styled.div<{ $color: string; $bg: string }>`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
`;

const KpiInfo = styled.div``;

const KpiValue = styled.div`
    font-size: 26px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
`;

const KpiLabel = styled.div`
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 2px;
`;

const KpiSub = styled.div`
    font-size: 11px;
    color: #94a3b8;
`;

const ActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 10px;
`;

const ActionCard = styled.button`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: #ffffff;
    border: 1px solid #e8edf2;
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        border-color: #c7d2e0;
    }

    &:active { transform: translateY(0); }
`;

const ActionIcon = styled.div<{ $color: string }>`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${({ $color }) => $color}18;
    color: ${({ $color }) => $color};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
`;

const ActionLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #334155;
    flex: 1;
`;

const ActionArrow = styled.div`
    color: #cbd5e1;
    font-size: 11px;
    transition: color 0.15s, transform 0.15s;

    ${ActionCard}:hover & {
        color: #94a3b8;
        transform: translateX(2px);
    }
`;

const StatusStrip = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
    padding-top: 8px;
`;

const StatusItem = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #94a3b8;
`;

const StatusDot = styled.span<{ $color: string }>`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
`;
